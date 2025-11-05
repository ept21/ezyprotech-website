"use client";

import Link from "next/link";

export default function AboutSection(){
    return (

    <section id="about" className="v-sec v-sec--scheme-1">
        <div className="v-sec__container">
            {/* Heading */}
            <header className="v-head v-head--center">
                {/* Kicker */}
                <div className="v-kicker v-kicker--light">Transform</div>

                {/* Title */}
                <h2 className="v-title-xl">
                    Intelligent technology meets strategic vision
                </h2>

                {/* Subcopy */}
                <p className="v-sub">
                    We bridge the gap between cutting-edge AI technologies and practical business solutions.
                    Our approach combines deep technical expertise with strategic insights.
                </p>
            </header>

            {/* Logos strip */}
            <div className="v-logos v-logos--spaced" aria-label="Trusted by">
                {/* Decorative placeholders; replace with real logos/SVGs when ready */}
                <span className="v-logo" aria-hidden="true"></span>
                <span className="v-logo v-logo--tall" aria-hidden="true"></span>
                <span className="v-logo" aria-hidden="true"></span>
                <span className="v-logo v-logo--tall" aria-hidden="true"></span>
            </div>

            {/* Actions */}
            <div className="v-actions">
                <a href="/#about" className="btn-pill btn-pill--light">About us</a>
                <a href="/#mission" className="btn-link-dark">
                    Our mission <span aria-hidden="true">→</span>
                </a>
            </div>

            {/* Wide image */}
            <img
                className="v-img-wide"
                src="https://placehold.co/1280x738"
                alt=""
                loading="lazy"
            />
        </div>
    </section>

)
}