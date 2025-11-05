"use client";

import Link from "next/link";

export default function BundelsSection() {
    return (
        <section id="pricing" className="v-sec v-sec--scheme-1" data-v="pricing">
            <div className="v-sec__container">
                <header className="v-head v-head--center" data-v="pricing-head">
                    <div className="v-kicker">Scale</div>
                    <h2 className="v-title-xl">Pricing plans</h2>
                    <p className="v-sub">Flexible packages designed to match your business growth trajectory.</p>
                </header>

                {/*<div className="v-switch" role="tablist" aria-label="Billing period">*/}
                {/*    <button className="v-switch__btn v-switch__btn--active">Monthly</button>*/}
                {/*    <button className="v-switch__btn">Yearly</button>*/}
                {/*</div>*/}

                <div className="v-pricing" data-v="pricing-grid">
                    {/* Basic */}
                    <article className="v-price" data-v="price-basic">
                        <header className="v-price__head">
                            <h3 className="v-price__title">Basic plan</h3>
                            <div className="v-price__value">
                                <span className="v-price__amount">$19</span>
                                <span className="v-price__per">/mo</span>
                            </div>
                        </header>
                        <div className="v-hr"/>
                        <div className="v-price__list">
                            <div className="v-li">Basic AI strategy consultation</div>
                            <div className="v-li">Monthly performance report</div>
                            <div className="v-li">Standard data analysis</div>
                        </div>
                        <a className="btn-brand w-full text-center">Start basic</a>
                    </article>

                    {/* Business */}
                    <article className="v-price" data-v="price-business">
                        <header className="v-price__head">
                            <h3 className="v-price__title">Business plan</h3>
                            <div className="v-price__value">
                                <span className="v-price__amount">$29</span>
                                <span className="v-price__per">/mo</span>
                            </div>
                        </header>
                        <div className="v-hr"/>
                        <div className="v-price__list">
                            <div className="v-li">Advanced AI strategy</div>
                            <div className="v-li">Weekly performance insights</div>
                            <div className="v-li">Comprehensive data analysis</div>
                            <div className="v-li">Custom dashboard integration</div>
                        </div>
                        <a className="btn-brand w-full text-center">Start business</a>
                    </article>

                    {/* Enterprise */}
                    <article className="v-price" data-v="price-enterprise">
                        <header className="v-price__head">
                            <h3 className="v-price__title">Enterprise plan</h3>
                            <div className="v-price__value">
                                <span className="v-price__amount">$49</span>
                                <span className="v-price__per">/mo</span>
                            </div>
                        </header>
                        <div className="v-hr"/>
                        <div className="v-price__list">
                            <div className="v-li">Full AI transformation</div>
                            <div className="v-li">Daily performance tracking</div>
                            <div className="v-li">Advanced predictive analytics</div>
                            <div className="v-li">Dedicated AI consultant</div>
                            <div className="v-li">Custom enterprise solutions</div>
                        </div>
                        <a className="btn-brand w-full text-center">Start enterprise</a>
                    </article>
                </div>
            </div>
        </section>
    )
}