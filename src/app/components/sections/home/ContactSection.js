"use client";

import Link from "next/link";

/** NOTE: All comments must remain in English only. */
export default function ContactSection({
                                           bgUrl = null,
                                           eyebrow = "Connect",
                                           title = "Contact Veltiqo",
                                           subtitle = "We're ready to help you navigate the future of intelligent business solutions.",
                                           contentHtml = "",
                                           useGlobalContact = true,
                                           imageUrl = null,
                                           contactInfo = {},
                                       }) {
    const HTML = ({ html }) => (
        <div
            className="prose prose-invert max-w-2xl mx-auto mt-4"
            dangerouslySetInnerHTML={{ __html: html || "" }}
        />
    );

    const sectionBgStyle = bgUrl
        ? {
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
        }
        : undefined;

    const { email, phone, whatsapp, address } = contactInfo || {};

    const hasContactDetails = Boolean(email || phone || whatsapp || address);

    return (
        <section
            className="v-sec v-sec--scheme-1 relative text-center bg-center bg-cover bg-no-repeat"
            data-v="contact"
            style={sectionBgStyle}
        >
            {bgUrl && (
                <div
                    className="absolute inset-0 bg-black/40"
                    aria-hidden="true"
                />
            )}

            <div className="v-sec__container v-contact relative z-10">
                {/* Heading */}
                <header className="v-contact__head">
                    {eyebrow && <div className="v-kicker">{eyebrow}</div>}
                    <h2 className="v-title-xl">{title}</h2>
                    {subtitle && <p className="v-sub">{subtitle}</p>}
                    {contentHtml ? <HTML html={contentHtml} /> : null}
                </header>

                {/* Contact info from global settings */}
                {useGlobalContact && hasContactDetails && (
                    <div className="v-contact__grid">
                        {email && (
                            <div className="v-contact__item">
                                <h3 className="v-contact__title">Email</h3>
                                <a
                                    className="v-contact__link"
                                    href={`mailto:${email}`}
                                >
                                    {email}
                                </a>
                            </div>
                        )}

                        {phone && (
                            <div className="v-contact__item">
                                <h3 className="v-contact__title">Phone</h3>
                                <a
                                    className="v-contact__link"
                                    href={`tel:${phone}`}
                                >
                                    {phone}
                                </a>
                            </div>
                        )}

                        {(address || whatsapp) && (
                            <div className="v-contact__item">
                                <h3 className="v-contact__title">Office</h3>
                                {address && (
                                    <p className="v-contact__text">
                                        {address}
                                    </p>
                                )}
                                {whatsapp && (
                                    <p className="v-contact__text mt-1">
                                        WhatsApp: {whatsapp}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Static form – visual only for now */}
                <div className="mt-10 max-w-3xl mx-auto text-left">
                    <form
                        className="v-form v-form--contact glass-card"
                        onSubmit={(e) => e.preventDefault()}
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
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="businessName">
                                    Business Name <span className="text-xs text-gray-400">(optional)</span>
                                </label>
                                <input
                                    id="businessName"
                                    name="businessName"
                                    type="text"
                                    placeholder="Your company"
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
                            />
                        </div>

                        <div className="mt-6 flex flex-wrap items-center gap-4">
                            <button type="submit" className="btn-brand">
                                Send message
                            </button>
                            {email && (
                                <p className="text-sm text-white/70">
                                    Prefer email?{" "}
                                    <a
                                        href={`mailto:${email}`}
                                        className="underline decoration-dotted"
                                    >
                                        Reach out directly
                                    </a>
                                    .
                                </p>
                            )}
                        </div>
                    </form>
                </div>

                {/* Optional contact image */}
                {imageUrl && (
                    <img
                        className="v-img-wide mt-10 rounded-2xl border border-white/10"
                        src={imageUrl}
                        alt=""
                    />
                )}
            </div>
        </section>
    );
}
