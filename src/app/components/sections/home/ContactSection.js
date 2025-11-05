"use client"

import Link from "next/link"

export default function ContactSection() {
    return (
        <section className="v-sec v-sec--scheme-1 text-center" data-v="contact">
            <div className="v-sec__container v-contact">
                <header className="v-contact__head">
                    <div className="v-kicker">Connect</div>
                    <h2 className="v-title-xl">Contact Veltiqo</h2>
                    <p className="v-sub">
                        We're ready to help you navigate the future of intelligent business solutions.
                    </p>
                </header>

                <div className="v-contact__grid">
                    <div className="v-contact__item">
                        <h3 className="v-contact__title">Email</h3>
                        <a className="v-contact__link" href="mailto:hello@veltiqo.com">hello@veltiqo.com</a>
                    </div>

                    <div className="v-contact__item">
                        <h3 className="v-contact__title">Phone</h3>
                        <a className="v-contact__link" href="tel:+14155550123">+1 (415) 555-0123</a>
                    </div>

                    <div className="v-contact__item">
                        <h3 className="v-contact__title">Office</h3>
                        <p className="v-contact__text">123 Tech Lane, San Francisco, CA 94105</p>
                    </div>
                </div>

                <img className="v-img-wide" src="https://placehold.co/1280x720" alt=""/>
            </div>
        </section>
    )
}