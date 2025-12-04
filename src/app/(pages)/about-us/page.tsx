"use client"

import Section from "@/components/section"
import SectionTitle from "@/components/section-title"
import { Card, CardContent } from "@/components/ui/card"

const Page = () => {
    return (
        <Section>
            <SectionTitle
                title="About Us"
                align="center"
                subtitle="Discover the mission and vision behind My Tree Enviros"
            />

            <Section className="lg:py-0">
                <div className="max-w-5xl mx-auto">
                    <Card className="shadow-sm border py-0">
                        <CardContent className="prose prose-neutral dark:prose-invert max-w-none px-6">

                            <section>
                                <h2 className="text-2xl font-bold mb-4">Who We Are</h2>
                                <p>
                                    My Tree Enviros is dedicated to building a greener, healthier planet through 
                                    technology-driven afforestation and environmental stewardship. Through our digital 
                                    ecosystem—available as both a mobile app and web platform—we empower individuals, 
                                    schools, corporates, communities, and organizations to take meaningful action 
                                    toward restoring India’s green cover.
                                </p>
                                <p>
                                    We believe that every tree planted today creates a better tomorrow. With transparent 
                                    tracking, smart technology, and deep community participation, My Tree Enviros makes 
                                    environmental contribution simple, impactful, and accessible to everyone.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">What We Do</h2>

                                <h3 className="text-xl font-semibold mt-4 mb-2">Tree Adoption & Plantation</h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Users can adopt trees through the MyTree App and website.</li>
                                    <li>Each tree is GPS-tagged for transparent tracking.</li>
                                    <li>Participate in plantation drives and large-scale green initiatives.</li>
                                </ul>

                                <h3 className="text-xl font-semibold mt-4 mb-2">Carbon Footprint Tracking</h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Automated CO₂ offset calculations based on adopted trees.</li>
                                    <li>Set carbon neutrality goals and monitor progress over time.</li>
                                </ul>

                                <h3 className="text-xl font-semibold mt-4 mb-2">Tree Health Monitoring</h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Regular updates on tree health and growth metrics.</li>
                                    <li>Notifications for watering, fertilization, and seasonal care.</li>
                                </ul>

                                <h3 className="text-xl font-semibold mt-4 mb-2">Community Engagement</h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Join plantation drives, workshops, and environmental campaigns.</li>
                                    <li>Connect with like-minded individuals, schools, and corporates.</li>
                                </ul>

                                <h3 className="text-xl font-semibold mt-4 mb-2">Eco-Friendly Marketplace</h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Shop for saplings, gardening tools, and sustainable home products.</li>
                                    <li>Exclusive offers for active contributors in the green movement.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">How We Work</h2>

                                <h3 className="text-xl font-semibold mt-4 mb-2">Mobile App + Web Platform</h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Register and set personalized environmental goals.</li>
                                    <li>Adopt and track trees via an intuitive GPS-based interface.</li>
                                    <li>Participate in community events and environmental challenges.</li>
                                    <li>Access guides, learning materials, and sustainability resources.</li>
                                    <li>Purchase eco-friendly products directly through the platform.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                                <p>
                                    Our mission is to restore ecological balance by encouraging mass participation in 
                                    tree planting, sustainability education, and long-term environmental care. We aim 
                                    to plant millions of trees across India, enrich biodiversity, and inspire future 
                                    generations to take responsibility for the environment.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">Why Choose My Tree Enviros?</h2>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Transparent GPS-based tree tracking</li>
                                    <li>Scientifically-backed CO₂ offset calculations</li>
                                    <li>Strong community-driven initiatives</li>
                                    <li>Trusted by institutions, corporates, NGOs, and individuals</li>
                                    <li>Focused on education and sustainable living</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">Join the Movement</h2>
                                <p>
                                    My Tree Enviros is more than an organization—it’s a movement for a sustainable future. 
                                    Whether you adopt a tree, join a plantation drive, or promote green living, your 
                                    contribution matters.
                                </p>
                                <p>
                                    Start your journey toward a greener tomorrow with the MyTree App or our web platform.
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
