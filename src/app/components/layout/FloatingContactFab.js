"use client";

import { useState, useMemo } from "react";

/** NOTE: All comments must remain in English only. */
export default function FloatingContactFab({
                                               phone = "+12135591219",          // Replace with real default phone
                                               whatsapp = "+12135591219",      // Replace with real default WhatsApp
                                               showOnMobile = true,
                                           }) {
    const [open, setOpen] = useState(false);

    // Normalize phone numbers for WhatsApp links
    const whatsappHref = useMemo(() => {
        const digitsOnly = (whatsapp || "").replace(/[^\d]/g, "");
        if (!digitsOnly) return "#";
        return `https://wa.me/${digitsOnly}`;
    }, [whatsapp]);

    const phoneHref = useMemo(() => {
        if (!phone) return "#";
        return `tel:${phone.replace(/\s+/g, "")}`;
    }, [phone]);

    // Optionally hide on very small screens if desired
    const visibilityClass = showOnMobile ? "block" : "hidden md:block";

    return (
        <div
            className={`fixed z-50 right-4 bottom-4 md:right-8 md:bottom-8 ${visibilityClass}`}
            aria-live="polite"
        >
            {/* Buttons container */}
            <div className="flex flex-col items-end gap-3">
                {/* WhatsApp + Phone buttons */}
                <div
                    className={`
                        flex flex-col items-end gap-2
                        transition-all duration-200 ease-out
                        ${open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"}
                    `}
                >
                    {/* WhatsApp button */}
                    <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                            flex items-center justify-center
                            w-12 h-12 md:w-14 md:h-14
                            rounded-full
                            bg-[#25D366]
                            shadow-lg shadow-black/40
                            hover:scale-105 active:scale-95
                            transition-transform duration-150
                            border border-white/40
                        "
                        aria-label="Chat on WhatsApp"
                    >
                        {/* Simple WhatsApp icon */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="w-6 h-6 text-white"
                            aria-hidden="true"
                        >
                            <path
                                fill="currentColor"
                                d="M12 2C6.486 2 2 6.145 2 11.229c0 2.008.676 3.869 1.834 5.394L2 22l5.555-1.791A9.96 9.96 0 0 0 12 20.458C17.514 20.458 22 16.313 22 11.229 22 6.145 17.514 2 12 2zm0 16.916a7.9 7.9 0 0 1-4.033-1.12l-.289-.172-3.293 1.062 1.077-3.047-.188-.313A7.3 7.3 0 0 1 4.08 11.23C4.08 7.29 7.604 4.09 12 4.09s7.92 3.2 7.92 7.139c0 3.94-3.524 7.687-7.92 7.687zm4.043-5.758c-.222-.111-1.313-.647-1.515-.72-.202-.074-.349-.111-.497.111-.148.222-.571.72-.7.868-.129.148-.259.167-.48.056-.222-.111-.935-.344-1.78-1.095-.658-.583-1.102-1.304-1.231-1.526-.129-.222-.014-.342.097-.453.1-.1.222-.259.333-.389.111-.13.148-.222.222-.37.074-.148.037-.278-.018-.389-.056-.111-.497-1.2-.681-1.645-.179-.43-.362-.372-.497-.378l-.425-.007c-.148 0-.389.056-.593.278-.204.222-.778.76-.778 1.852 0 1.092.797 2.147.908 2.295.111.148 1.572 2.4 3.814 3.265.534.212.951.339 1.276.435.536.152 1.023.131 1.409.08.43-.064 1.313-.537 1.499-1.056.185-.519.185-.963.129-1.056-.056-.093-.204-.148-.426-.259z"
                            />
                        </svg>
                    </a>

                    {/* Phone button */}
                    <a
                        href={phoneHref}
                        className="
                            flex items-center justify-center
                            w-12 h-12 md:w-14 md:h-14
                            rounded-full
                            bg-[#0A84FF]
                            shadow-lg shadow-black/40
                            hover:scale-105 active:scale-95
                            transition-transform duration-150
                            border border-white/40
                        "
                        aria-label="Call us"
                    >
                        {/* Simple phone icon */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="w-6 h-6 text-white"
                            aria-hidden="true"
                        >
                            <path
                                fill="currentColor"
                                d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2a1.003 1.003 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57.55 0 1 .45 1 1V21a1 1 0 0 1-1 1C11.42 22 2 12.58 2 2a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.01l-2.2 2.2z"
                            />
                        </svg>
                    </a>
                </div>

                {/* Main toggle button */}
                <button
                    type="button"
                    onClick={() => setOpen((prev) => !prev)}
                    className={`
                        flex items-center justify-center
                        w-14 h-14 md:w-16 md:h-16
                        rounded-full
                        bg-gradient-to-br from-[#0A84FF] to-[#00C293]
                        shadow-xl shadow-black/50
                        border border-white/50
                        transition-transform duration-150
                        hover:scale-105 active:scale-95
                        text-white
                    `}
                    aria-label={open ? "Close contact options" : "Open contact options"}
                >
                    {/* Simple + / X icon swap */}
                    <span
                        className={`
                            text-2xl font-bold leading-none
                            transition-transform duration-200
                            ${open ? "rotate-45" : "rotate-0"}
                        `}
                    >
                        +
                    </span>
                </button>
            </div>
        </div>
    );
}
