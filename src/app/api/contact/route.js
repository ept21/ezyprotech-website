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
        } = body;

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

        // ---- CF7 internal meta fields (this is what the browser normally sends) ----
        formData.append("_wpcf7", String(formId));                  // numeric form ID
        formData.append("_wpcf7_unit_tag", `wpcf7-f${formId}-o1`);  // must match pattern
        formData.append("_wpcf7_container_post", "0");              // no specific page
        formData.append("_wpcf7_locale", "en_US");                  // adjust if needed


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
                    // Do NOT set Content-Type – let fetch + FormData handle it
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
