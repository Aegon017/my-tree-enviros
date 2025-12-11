"use client"

import Section from "@/components/section"
import SectionTitle from "@/components/section-title"
import { Card, CardContent } from "@/components/ui/card"

const Page = () => {
    return (
        <Section>
            <SectionTitle
                title="Cancellation & Refund Policy"
                align="center"
                subtitle="Please review our cancellation and refund terms before placing an order."
            />

            <Section className="lg:py-0">
                <div className="max-w-5xl mx-auto">
                    <Card className="shadow-sm border py-0">
                        <CardContent className="prose prose-neutral dark:prose-invert max-w-none px-6">

                            <section>
                                <h2 className="text-2xl font-bold mb-4">Cancellation Policy</h2>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Orders can be cancelled within <strong>2 hours</strong> of placing the order.</li>
                                    <li>Once your order has been processed, cancellations will no longer be possible.</li>
                                </ul>
                                <p>
                                    For assistance, please contact our Customer Service team at
                                    <strong> communication@mytree.care</strong>. We’re here to help!
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">How to Cancel</h2>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>
                                        To request a cancellation, please email us at:
                                        <strong> communication@mytree.care</strong>
                                    </li>
                                    <li>
                                        Our Customer Support team will review your request and assist you through the cancellation process.
                                    </li>
                                </ul>
                                <p>
                                    Refunds for cancelled orders will be processed at the company’s discretion on a case-by-case basis.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">Refund Policy</h2>

                                <h3 className="text-xl font-semibold mt-4 mb-2">1. Eligibility for Refunds</h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>The item delivered was incorrect.</li>
                                    <li>The product was damaged or lost in transit.</li>
                                </ul>

                                <h3 className="text-xl font-semibold mt-4 mb-2">2. How to Request a Refund</h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>
                                        <a href="https://wa.me/918977730561" target="_blank" rel="noopener noreferrer">
                                            WhatsApp us on <strong>+91 89777 30561</strong>
                                        </a>
                                        within
                                        <strong> 24 hours</strong> of delivery with:
                                        <ul className="list-disc pl-6 mt-2 space-y-1">
                                            <li>Clear images or a short video of the damaged product and packaging.</li>
                                            <li>Your order number and details of the issue.</li>
                                        </ul>
                                    </li>
                                    <li>Our team will review the request and confirm whether a refund is approved.</li>
                                    <li>
                                        Once approved, refunds are processed within <strong>24 hours</strong>.
                                        Depending on your bank, the refunded amount will reflect in your account within
                                        <strong> 3–5 business days</strong>.
                                    </li>
                                </ul>
                            </section>

                        </CardContent>
                    </Card>
                </div>
            </Section>
        </Section>
    )
}

export default Page