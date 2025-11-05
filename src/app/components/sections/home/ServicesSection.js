"use client";

import Link from "next/link";

export default function ServicesSection({ eyebrow, title, subtitle, items = [] }) {
    return (
        <section id="services" className="v-sec v-sec--scheme-2">
            <div className="v-sec__container">
                <header className="v-head v-head--center">
                    <div className="v-kicker v-kicker--dark">Accelerate</div>
                    <div className="v-title-xl">Our core services</div>
                    <p className="v-sub">Innovative solutions designed to drive your business forward with precision
                        and intelligence.</p>
                </header>
                <div className="v-grid-3">
                    <article className="v-card v-card--lg v-card--overlay bg-624x335">
                        <div className="v-card__head">
                            <span className="v-kicker v-kicker--light">AI</span>
                            <h3 className="v-card__title">AI consulting</h3>
                            <p className="v-card__text">
                                Strategic AI implementation to unlock transformative business potential and
                                competitive advantage.
                            </p>
                        </div>
                        <div className="v-card__actions">
                            <a href="#contact" className="btn-pill">Explore</a>
                            <a href="#services" className="btn-link">Learn</a>
                        </div>
                    </article>


                    <article className="v-card v-card--sm v-card--overlay bg-296x339">
                        <div className="v-card__head">
                            <div className="v-logo v-logo--tall" aria-hidden="true"></div>
                            <h4 className="v-card__title-sm">Data analytics</h4>
                            <p className="v-card__text">Advanced data insights to drive strategic decision
                                making.</p>
                        </div>
                        <div className="v-card__actions">
                            <a href="#services" className="btn-link">Learn</a>
                        </div>
                    </article>


                    <article className="v-card v-card--sm v-card--overlay bg-296x339">
                        <div className="v-card__head">
                            <div className="v-logo v-logo--tall" aria-hidden="true"></div>
                            <h4 className="v-card__title-sm">Enterprise solutions</h4>
                            <p className="v-card__text">Scalable technology frameworks tailored for complex
                                organizational needs.</p>
                        </div>
                        <div className="v-card__actions">
                            <a href="#services" className="btn-link">Learn</a>
                        </div>
                    </article>
                </div>

            </div>
        </section>
    );
}
