// /src/app/components/sections/home/ContactSection.jsx
"use client";

import { useState } from "react";
import Script from "next/script";

/** NOTE: All comments must remain in English only. */
const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

export default function ContactSection({
                                           bgUrl = null,
                                           mobileBgUrl = null,
                                           eyebrow = "Connect",
                                           title = "Contact Veltiqo",
                                           subtitle = "We're ready to help you navigate the future of intelligent business solutions.",
                                           contentHtml = "",
                                           useGlobalContact = true,
                                           imageUrl = null,      // pulled from CMS, optional
                                           contactInfo = {},
                                       }) {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        businessName: "",
        message: "",
    });

    const [status, setStatus] = useState({
        loading: false,
        success: false,
        error: "",
    });

    const [loadRecaptcha, setLoadRecaptcha] = useState(false);

    const HTML = ({ html }) => (
        <div
            className="prose prose-invert max-w-2xl mt-4 text-slate-900/80"
            dangerouslySetInnerHTML={{ __html: html || "" }}
        />
    );

    const { email, phone, whatsapp, address } = contactInfo || {};
    const hasContactDetails = Boolean(email || phone || whatsapp || address);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleInteraction = () => {
        if (!loadRecaptcha) {
            setLoadRecaptcha(true);
        }
    };

    const getRecaptchaToken = () => {
        return new Promise((resolve, reject) => {
            if (typeof window === "undefined") {
                return reject(new Error("reCAPTCHA is not available on server side."));
            }
            if (!window.grecaptcha || !siteKey) {
                return reject(
                    new Error("reCAPTCHA is not ready yet. Please try again in a moment.")
                );
            }

            window.grecaptcha.ready(() => {
                window.grecaptcha
                    .execute(siteKey, { action: "contact_submit" })
                    .then(resolve)
                    .catch(reject);
            });
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!loadRecaptcha) {
            setLoadRecaptcha(true);
            await new Promise((r) => setTimeout(r, 500));
        }

        setStatus({ loading: true, success: false, error: "" });

        try {
            let recaptchaToken = null;

            if (siteKey) {
                recaptchaToken = await getRecaptchaToken();
            }

            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    recaptchaToken,
                }),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok || !data?.ok) {
                throw new Error(data?.error || "Failed to send message");
            }

            setStatus({ loading: false, success: true, error: "" });

            setFormData({
                fullName: "",
                email: "",
                phone: "",
                businessName: "",
                message: "",
            });
        } catch (err) {
            console.error(err);
            setStatus({
                loading: false,
                success: false,
                error: err.message || "Something went wrong",
            });
        }
    };

    return (
        <>
            {/* Hide reCAPTCHA badge */}
            <style jsx global>{`
        .grecaptcha-badge {
          visibility: hidden;
        }
      `}</style>

            {siteKey && loadRecaptcha && (
                <Script
                    src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
                    strategy="afterInteractive"
                />
            )}

            <section
                data-v="contact"
                role="region"
                aria-label="Contact Veltiqo"
                className="v-sec v-sec--scheme-1 relative overflow-hidden"
            >
                {/* Backgrounds: desktop fixed, mobile non-fixed */}
                {bgUrl || mobileBgUrl ? (
                    <>
                        {bgUrl && (
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 hidden md:block bg-center bg-cover bg-no-repeat bg-fixed"
                                style={{ backgroundImage: `url(${bgUrl})` }}
                            />
                        )}

                        {mobileBgUrl && (
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 md:hidden bg-center bg-cover bg-no-repeat"
                                style={{ backgroundImage: `url(${mobileBgUrl})` }}
                            />
                        )}

                        {!mobileBgUrl && bgUrl && (
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 md:hidden bg-center bg-cover bg-no-repeat"
                                style={{ backgroundImage: `url(${bgUrl})` }}
                            />
                        )}

                        <div
                            aria-hidden="true"
                            className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,250,252,0.9),_rgba(186,230,253,0.9))]"
                        />
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.55),transparent_60%)] mix-blend-screen"
                        />
                    </>
                ) : (
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#f9fbff,_#e4f1ff)]"
                    />
                )}

                <div className="v-sec__container relative z-10 py-16 md:py-24">
                    <div className="grid gap-12 lg:gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-stretch">
                        {/* LEFT: heading + contact details + image from CMS */}
                        <div className="flex flex-col justify-center text-left">
                            <header className="max-w-xl">
                                {eyebrow && (
                                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-800/70">
                                        {eyebrow}
                                    </p>
                                )}
                                <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.04em] text-slate-900">
                                    {title}
                                </h2>
                                {subtitle && (
                                    <p className="mt-3 text-base md:text-lg text-slate-700">
                                        {subtitle}
                                    </p>
                                )}
                                {contentHtml ? <HTML html={contentHtml} /> : null}
                            </header>

                            {useGlobalContact && hasContactDetails && (
                                <div className="mt-8 space-y-6">
                                    {email && (
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-200/80 bg-white/60 shadow-[0_16px_40px_rgba(56,189,248,0.55)] backdrop-blur-xl">
                                                {/* Email icon */}
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    className="h-8 w-8 text-cyan-500"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.6"
                                                        d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"
                                                    />
                                                    <path
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.6"
                                                        d="M4 7l8 6 8-6"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900">
                                                    Email
                                                </div>
                                                <a
                                                    href={`mailto:${email}`}
                                                    className="text-sm text-slate-700 underline decoration-sky-300/70 decoration-dotted underline-offset-4"
                                                >
                                                    {email}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {phone && (
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-200/80 bg-white/60 shadow-[0_16px_40px_rgba(52,211,153,0.55)] backdrop-blur-xl">
                                                {/* Phone icon */}
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    className="h-8 w-8 text-emerald-500"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.6"
                                                        d="M8.5 4.5 7 6c-.7.7-.9 1.8-.4 2.7 1.9 3.5 4.7 6.3 8.2 8.2.9.5 2 .3 2.7-.4l1.5-1.5a1 1 0 0 0 0-1.4l-2.1-2.1a1 1 0 0 0-1.3-.07l-1.1.83c-.3.23-.72.27-1.06.1a11.9 11.9 0 0 1-4.1-4.1.93.93 0 0 1 .1-1.06l.83-1.1A1 1 0 0 0 11 6.3L8.9 4.2a1 1 0 0 0-1.4.3z"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900">
                                                    Phone
                                                </div>
                                                <a href={`tel:${phone}`} className="text-sm text-slate-700">
                                                    {phone}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {(address || whatsapp) && (
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-200/80 bg-white/60 shadow-[0_16px_40px_rgba(56,189,248,0.55)] backdrop-blur-xl">
                                                {/* Office icon */}
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    className="h-8 w-8 text-cyan-500"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.6"
                                                        d="M12 3.5a6 6 0 0 0-6 6c0 4.17 5.08 9.92 5.72 10.6a.4.4 0 0 0 .56 0C12.92 19.42 18 13.67 18 9.5a6 6 0 0 0-6-6z"
                                                    />
                                                    <circle
                                                        cx="12"
                                                        cy="9.5"
                                                        r="2.2"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.6"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900">
                                                    Office
                                                </div>
                                                {address && (
                                                    <p className="text-sm text-slate-700">{address}</p>
                                                )}
                                                {whatsapp && (
                                                    <p className="text-sm text-slate-700 mt-1">
                                                        WhatsApp: {whatsapp}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Image from CMS under the contact details (left side).
                  If imageUrl is null/empty – nothing is rendered. */}
                            {imageUrl && (
                                <div className="mt-10">
                                    <img
                                        src={imageUrl}
                                        alt=""
                                        loading="lazy"
                                        className="w-full max-w-md rounded-2xl border border-white/40 shadow-[0_18px_50px_rgba(15,23,42,0.25)]"
                                    />
                                </div>
                            )}
                        </div>

                        {/* RIGHT: glass form card */}
                        <div className="relative flex items-center">
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -inset-1 rounded-[40px] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.6),transparent_55%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.6),transparent_55%)] opacity-70 blur-xl"
                            />

                            <div className="relative flex-1">
                                <form
                                    className="v-form v-form--contact glass-card rounded-[32px] border border-white/70 bg-white/70 bg-clip-padding shadow-[0_20px_60px_rgba(15,23,42,0.25)] backdrop-blur-2xl px-6 py-6 md:px-8 md:py-7"
                                    onSubmit={handleSubmit}
                                    onFocus={handleInteraction}
                                    onClick={handleInteraction}
                                >
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="form-group">
                                            <label htmlFor="fullName">
                                                Full Name<span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                id="fullName"
                                                name="fullName"
                                                type="text"
                                                required
                                                placeholder="John Doe"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="email">
                                                Email<span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                required
                                                placeholder="you@example.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="phone">
                                                Phone<span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                required
                                                placeholder="+1 555 123 4567"
                                                value={formData.phone}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="businessName">
                                                Business Name{" "}
                                                <span className="text-xs text-gray-400">(optional)</span>
                                            </label>
                                            <input
                                                id="businessName"
                                                name="businessName"
                                                type="text"
                                                placeholder="Your company"
                                                value={formData.businessName}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group mt-4">
                                        <label htmlFor="message">
                                            Tell us a bit about your project or what you&apos;re looking for
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            rows={5}
                                            placeholder="For example: we want to rebuild our website with headless WordPress and automate lead routing…"
                                            value={formData.message}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="mt-6">
                                        <button
                                            type="submit"
                                            className="btn-brand w-full justify-center rounded-full text-base md:text-lg py-3.5"
                                            disabled={status.loading}
                                        >
                                            {status.loading ? "Sending..." : "Send message"}
                                        </button>
                                    </div>

                                    <div className="mt-4 text-xs text-slate-500/90">
                                        This site is protected by reCAPTCHA and the Google{" "}
                                        <a
                                            href="https://policies.google.com/privacy"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="underline hover:text-slate-700"
                                        >
                                            Privacy Policy
                                        </a>{" "}
                                        and{" "}
                                        <a
                                            href="https://policies.google.com/terms"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="underline hover:text-slate-700"
                                        >
                                            Terms of Service
                                        </a>{" "}
                                        apply.
                                    </div>

                                    {status.error && (
                                        <p className="mt-3 text-sm text-red-500">{status.error}</p>
                                    )}
                                    {status.success && (
                                        <p className="mt-3 text-sm text-emerald-500">
                                            Thanks, your message has been sent.
                                        </p>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
