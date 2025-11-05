"use client"

import Link from "next/link"

export default function CtaWideSection() {
    return (
        <section className="v-sec v-sec--scheme-1" data-v="cta">
            <div className="v-sec__container">
                <header className="v-head v-head--center">
                    <h2 className="v-title-xl">Ready to accelerate your business?</h2>
                    <p className="v-sub">
                        Let's discuss how our AI-driven solutions can transform your business strategy and
                        performance.
                    </p>
                </header>

                <div className="v-actions">
                    <a className="btn-brand">Get started</a>
                    <a className="btn-pill btn-pill--light">Book consultation</a>
                </div>

                <img className="v-img-wide" src="https://placehold.co/1280x738" alt=""/>
            </div>
        </section>
    )
}