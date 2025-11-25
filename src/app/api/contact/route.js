// app/api/contact/route.js

export async function POST(req) {
    try {
        const body = await req.json();
        const {
            fullName,
            email,
            phone,
            businessName,
            message,
            recaptchaToken, // <-- new
        } = body;

        // --- 1. Verify reCAPTCHA on the server ---
        const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;

        if (!recaptchaSecret) {
            console.error("[Contact API] Missing RECAPTCHA_SECRET_KEY");
            return Response.json(
                { ok: false, error: "Server misconfigured (captcha)." },
                { status: 500 }
            );
        }

        if (!recaptchaToken) {
            return Response.json(
                { ok: false, error: "reCAPTCHA token is missing." },
                { status: 400 }
            );
        }

        const verifyRes = await fetch(
            "https://www.google.com/recaptcha/api/siteverify",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: `secret=${encodeURIComponent(
                    recaptchaSecret
                )}&response=${encodeURIComponent(recaptchaToken)}`,
            }
        );

        const verifyData = await verifyRes.json();

        if (!verifyData.success || (verifyData.score ?? 0) < 0.5) {
            // You can tune the score threshold if you get too many false positives
            console.warn("[Contact API] reCAPTCHA failed:", verifyData);
            return Response.json(
                { ok: false, error: "reCAPTCHA verification failed." },
                { status: 400 }
            );
        }

        // --- 2. Existing CF7 + Flamingo integration ---

        const rawWpUrl = process.env.NEXT_PUBLIC_WP_URL;
        const formId = process.env.WP_CF7_CONTACT_FORM_ID; // e.g. "548"

        const wpUrl = rawWpUrl ? rawWpUrl.replace(/\/$/, "") : null;

        if (!wpUrl || !formId) {
            return Response.json(
                { ok: false, error: "Missing WP config (URL or form ID)." },
                { status: 500 }
            );
        }

        const formData = new FormData();

        // CF7 meta fields
        formData.append("_wpcf7", String(formId));
        formData.append("_wpcf7_unit_tag", `wpcf7-f${formId}-o1`);
        formData.append("_wpcf7_container_post", "0");
        formData.append("_wpcf7_locale", "en_US");

        // Custom fields and labels
        formData.append("your-subject", "HomePage Contact Lead");
        formData.append("formName", "Veltiqo HomePage Contact Form");

        formData.append("fullName", fullName || "");
        formData.append("email", email || "");
        formData.append("phone", phone || "");
        formData.append("businessName", businessName || "");
        formData.append("message", message || "");

        const wpRes = await fetch(
            `${wpUrl}/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`,
            {
                method: "POST",
                headers: {
                    Accept: "application/json",
                },
                body: formData,
            }
        );

        const text = await wpRes.text();
        let data = null;
        try {
            data = JSON.parse(text);
        } catch {
            console.error("[Contact API] Non-JSON CF7 response:", text);
        }

        if (!wpRes.ok || data?.status === "validation_failed") {
            return Response.json(
                {
                    ok: false,
                    error: data?.message || "CF7 validation failed",
                    details: data || text,
                },
                { status: 400 }
            );
        }

        return Response.json(
            {
                ok: true,
                message: data?.message || "Form submitted successfully.",
            },
            { status: 200 }
        );
    } catch (err) {
        console.error("[Contact API] Error:", err);
        return Response.json(
            { ok: false, error: "Unexpected server error." },
            { status: 500 }
        );
    }
}
