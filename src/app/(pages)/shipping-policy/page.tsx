"use client"

import Section from "@/components/section"
import SectionTitle from "@/components/section-title"
import { Card, CardContent } from "@/components/ui/card"

const Page = () => {
    return (
        <Section>
            <SectionTitle
                title="Shipping Policy"
                align="center"
                subtitle="Please review our shipping process for plants, seeds, and gardening tools."
            />

            <Section className="lg:py-0">
                <div className="max-w-5xl mx-auto">
                    <Card className="shadow-sm border py-0">
                        <CardContent className="prose prose-neutral dark:prose-invert max-w-none px-6">

                            <section>
                                <h2 className="text-2xl font-bold mb-4">Our Commitment to You</h2>
                                <p>
                                    Thank you for choosing My Tree Enviros India Pvt Ltd for your gardening needs.
                                    We are committed to delivering your plants, seeds, and gardening tools safely and efficiently.
                                    As we ship live plants, our shipping process is carefully designed to ensure each plant arrives
                                    healthy and ready to thrive.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">1. Shipping Methods & Rates</h2>
                                <p>
                                    Shipping rates are calculated at checkout based on destination, package weight, and product type.
                                    Live plants may require special handling, packaging, and shipping methods to ensure safe delivery.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">2. Order Processing Time</h2>
                                <h3 className="text-xl font-semibold mt-4 mb-2">Standard Products (Seeds & Tools)</h3>
                                <p>
                                    Orders for non-perishable items are processed and shipped within 1–3 business days.
                                </p>

                                <h3 className="text-xl font-semibold mt-4 mb-2">Live Plants</h3>
                                <p>
                                    To reduce transit time and avoid weekend delays, live plant orders are processed
                                    Monday through Wednesday only. Please allow 3–5 business days for plant preparation,
                                    which includes inspection, hydration, and careful packaging.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">3. Packaging and Plant Safety</h2>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>
                                        Plants are securely packaged with protective wrapping, insulation, or heat/cold packs
                                        (seasonally) to shield them from extreme temperatures.
                                    </li>
                                    <li>
                                        We use sustainable and recyclable materials as much as possible.
                                    </li>
                                    <li>
                                        Orders containing multiple products may ship in separate boxes to protect delicate plants.
                                    </li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">4. Tracking Your Order</h2>
                                <p>
                                    Once your order has shipped, you will receive a confirmation email with a tracking number.
                                    You may use this number to follow your shipment’s progress with the carrier.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">5. Damages, Lost Packages & Guarantees</h2>

                                <h3 className="text-xl font-semibold mt-4 mb-2">A. Live Arrival Guarantee (Plants Only)</h3>
                                <p>
                                    We guarantee that all live plants will arrive alive and in good condition. Plants may appear
                                    dull due to transit time; with sunlight and water, they usually recover quickly.
                                </p>

                                <h3 className="text-xl font-semibold mt-4 mb-2">B. Other Products (Seeds & Tools)</h3>
                                <p>
                                    If non-live items arrive damaged or defective, contact us within 3 days of delivery for assistance.
                                </p>

                                <h3 className="text-xl font-semibold mt-4 mb-2">C. Lost Packages</h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>
                                        If tracking shows “Delivered” but you haven't received your package, please check with
                                        neighbors or your local post office.
                                    </li>
                                    <li>
                                        We are not responsible for packages marked as “Delivered” by the carrier.
                                    </li>
                                    <li>
                                        If your package is delayed in transit, contact us and we will assist you in filing a claim.
                                    </li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">6. Incorrect Shipping Information</h2>
                                <p>
                                    Please ensure your shipping details are accurate before placing an order.
                                    If an order is returned due to an incorrect address provided by the customer,
                                    an additional shipping fee will apply to resend the package.
                                    We are not responsible for packages sent to incorrectly entered addresses.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                                <p>If you have questions about this Shipping Policy, contact us:</p>
                                <p>
                                    <strong>Email:</strong> communication@mytree.care<br />
                                    <strong>Phone:</strong> +91 89777 30561 <br />
                                    <strong>Hours:</strong> 9:30 AM to 6:30 PM
                                </p>
                            </section>

                        </CardContent>
                    </Card>
                </div>
            </Section>
        </Section>
    )
}

export default Page