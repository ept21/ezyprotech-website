"use client"

import Link from "next/link";

export default function TestimonialsSection(){
    return (
    <section id="testimonials" className="v-sec v-sec--scheme-3">
        <div className="v-sec__container">
            {/* Heading */}
            <header className="v-head v-head--center">
                <h2 className="v-title-xl">Client success stories</h2>
                <p className="v-sub">Real results from businesses that transformed with Veltiqo</p>
            </header>

            {/* 3 cards */}
            <div className="v-grid-3--equal">
                {/* Card 1 */}
                <article className="v-testi">
                    <div className="v-testi__body">
                        <div className="v-stars" aria-label="5 out of 5">
                            <span className="v-star" />
                            <span className="v-star" />
                            <span className="v-star" />
                            <span className="v-star" />
                            <span className="v-star" />
                        </div>
                        <p className="v-testi__quote">
                            Veltiqo&apos;s AI strategy increased our revenue by 42% in six months.
                        </p>
                    </div>

                    <footer className="v-testi__footer">
                        <img className="v-avatar" src="https://placehold.co/48x48" alt="" />
                        <div className="v-person">
                            <div className="v-person__name">Michael Chen</div>
                            <div className="v-person__role">CEO, TechNova Solutions</div>
                        </div>
                    </footer>
                </article>

                {/* Card 2 */}
                <article className="v-testi">
                    <div className="v-testi__body">
                        <div className="v-stars" aria-label="5 out of 5">
                            <span className="v-star" />
                            <span className="v-star" />
                            <span className="v-star" />
                            <span className="v-star" />
                            <span className="v-star" />
                        </div>
                        <p className="v-testi__quote">
                            Their data analytics provided insights we never imagined possible.
                        </p>
                    </div>

                    <footer className="v-testi__footer">
                        <img className="v-avatar" src="https://placehold.co/48x48" alt="" />
                        <div className="v-person">
                            <div className="v-person__name">Sarah Rodriguez</div>
                            <div className="v-person__role">COO, Global Retail Group</div>
                        </div>
                    </footer>
                </article>

                {/* Card 3 */}
                <article className="v-testi">
                    <div className="v-testi__body">
                        <div className="v-stars" aria-label="5 out of 5">
                            <span className="v-star" />
                            <span className="v-star" />
                            <span className="v-star" />
                            <span className="v-star" />
                            <span className="v-star" />
                        </div>
                        <p className="v-testi__quote">
                            Veltiqo&apos;s enterprise solutions are game-changing for our organization.
                        </p>
                    </div>

                    <footer className="v-testi__footer">
                        <img className="v-avatar" src="https://placehold.co/48x48" alt="" />
                        <div className="v-person">
                            <div className="v-person__name">David Kim</div>
                            <div className="v-person__role">CTO, Innovative Systems</div>
                        </div>
                    </footer>
                </article>
            </div>
        </div>
    </section>

    )
}