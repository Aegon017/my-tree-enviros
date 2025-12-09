"use client"

import Section from "@/components/section"
import SectionTitle from "@/components/section-title"
import { Card, CardContent } from "@/components/ui/card"

const Page = () => {
    return (
        <Section>
            <SectionTitle
                title="Privacy Policy"
                align="center"
                subtitle="Please read this Privacy Policy carefully before using Our Services."
            />

            <Section className="lg:py-0">
                <div className="max-w-5xl mx-auto">
                    <Card className="shadow-sm border py-0">
                        <CardContent className="prose prose-neutral dark:prose-invert max-w-none px-6">

                            <section>
                                <h2 className="text-2xl font-bold mb-4">Introduction</h2>
                                <p>
                                    This Privacy Policy describes how My Tree Enviros India Pvt Ltd (“we”, “us”, “our”)
                                    collects, uses, and discloses your personal information when you visit, use our services,
                                    or make a purchase from mytree.care (the “Site”) or otherwise communicate with us
                                    (collectively, the “Services”). “You” refers to any user of the Services, whether a customer,
                                    website visitor, or another individual whose information we have collected.
                                </p>
                                <p>
                                    By accessing or using any of the Services, you agree to the collection, use, and disclosure
                                    of your information as described in this Privacy Policy. If you do not agree, please do not
                                    use or access the Services.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">Changes to This Privacy Policy</h2>
                                <p>
                                    We may update this Privacy Policy periodically to reflect changes to our practices or for
                                    operational, legal, or regulatory reasons. Updates will be posted on the Site with an updated
                                    “Last updated” date, along with any legally required notices.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">How We Collect and Use Your Personal Information</h2>
                                <p>
                                    To provide the Services, we collect personal information about you from various sources.
                                    The information we collect depends on how you interact with us. In addition to the uses
                                    described below, we may use your information to communicate with you, operate the Services,
                                    comply with legal obligations, enforce terms, and protect our rights and users.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">What Personal Information We Collect</h2>

                                <h3 className="text-xl font-semibold mt-4 mb-2">Information You Provide Directly</h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Basic contact details such as name, address, phone number, email.</li>
                                    <li>Order details such as billing address, shipping address, payment confirmation, phone number.</li>
                                    <li>Account information such as username, password, security questions.</li>
                                    <li>Shopping information such as items viewed, cart activity, wishlist.</li>
                                    <li>Customer support information sent via messages or forms.</li>
                                </ul>

                                <h3 className="text-xl font-semibold mt-4 mb-2">Information Collected Through Cookies</h3>
                                <p>
                                    We automatically collect certain information (“Usage Data”) through cookies, pixels, and
                                    similar technologies. This may include device information, browser details, network
                                    connection data, IP address, and user interaction activity.
                                </p>

                                <h3 className="text-xl font-semibold mt-4 mb-2">Information from Third Parties</h3>
                                <p>
                                    We may obtain information about you from third-party vendors or service providers such as:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Companies supporting our Site and Services</li>
                                    <li>Payment processors handling financial transactions</li>
                                    <li>Analytics partners</li>
                                    <li>Marketing or advertising partners</li>
                                </ul>
                                <p>
                                    Any information received from third parties is handled according to this Privacy Policy.
                                    We are not responsible for third-party policies or practices.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">How We Use Your Personal Information</h2>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Providing products and services including order processing and account management.</li>
                                    <li>Marketing and advertising across platforms.</li>
                                    <li>Security and fraud prevention.</li>
                                    <li>Communicating with you for support or service improvements.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">Cookies</h2>
                                <p>
                                    We use cookies to operate and improve our Site and Services. You may disable cookies in
                                    your browser settings, but doing so may affect functionality or user experience.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">How We Disclose Personal Information</h2>
                                <p>We may disclose your personal information to:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Vendors and service providers such as IT, payments, shipping, analytics.</li>
                                    <li>Business and marketing partners, including tree planting partners.</li>
                                    <li>Affiliates within our corporate group.</li>
                                    <li>Legal authorities, when required.</li>
                                    <li>Third parties involved in business transactions like mergers.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">User-Generated Content</h2>
                                <p>
                                    Content submitted publicly through reviews or other tools becomes accessible to anyone.
                                    We are not responsible for misuse of content you choose to make public.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">Third Party Websites and Links</h2>
                                <p>
                                    Our Site may link to third-party sites. We are not responsible for their privacy/security
                                    practices. Review their policies before sharing information with them.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">Children's Data</h2>
                                <p>
                                    We do not knowingly collect data from children. If a child has provided information,
                                    contact us to request deletion.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">Security and Retention</h2>
                                <p>
                                    We use reasonable safeguards but cannot guarantee perfect security. Retention times vary
                                    based on operational or legal needs.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">Your Rights and Choices</h2>
                                <p>You may have rights including:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Access/Know</li>
                                    <li>Delete</li>
                                    <li>Correct</li>
                                    <li>Portability</li>
                                    <li>Opt-out of targeted advertising, sale, or sharing</li>
                                    <li>Limit sensitive information use</li>
                                    <li>Restrict processing</li>
                                    <li>Withdraw consent</li>
                                    <li>Appeal decisions</li>
                                </ul>
                                <p>
                                    You may exercise these rights through the Site or by contacting us. Verification may be
                                    required to process requests.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">Complaints</h2>
                                <p>
                                    If you have concerns about how your information is processed, contact us. You may also
                                    be able to escalate the complaint to your local data authority.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">International Users</h2>
                                <p>
                                    Your information may be processed outside your country. For transfers outside India,
                                    we rely on recognized legal transfer mechanisms unless the destination has adequate protections.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                                <p>
                                    For questions or to exercise your rights, contact us at:
                                </p>
                                <p>
                                    <strong>Email:</strong> communication@mytree.care<br />
                                    <strong>Address:</strong> My Tree Enviros India Pvt Ltd, Attn: Operations Manager,
                                    Plot No. 21, Madhapur, Gafoornagar, Hyderabad, Telangana 500081.
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