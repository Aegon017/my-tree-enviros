"use client"

import Section from "@/components/section"
import SectionTitle from "@/components/section-title"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin } from "lucide-react"

const Page = () => {
    return (
        <div className="bg-background">
            <div className="py-20 bg-linear-to-b from-muted/40 to-background">
                <SectionTitle
                    title="Get in Touch"
                    align="center"
                    subtitle="We’re here to help and answer any questions you may have."
                />
            </div>

            <Section className="lg:py-0">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="space-y-6 lg:col-span-1">
                        <Card className="p-6 hover:shadow-xl transition-all">
                            <CardContent className="space-y-4 p-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-full bg-primary/10">
                                        <MapPin className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-medium">Office Location</p>
                                        <p className="text-muted-foreground">
                                            My Tree Enviros India Pvt Ltd Org, Attn: Operations Manager,
                                            Plot No. 21, Madhapur, Gafoornagar, Hyderabad, Telangana 500081.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-full bg-primary/10">
                                        <Phone className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-medium">Phone</p>
                                        <p className="text-muted-foreground">+91 99482 33863</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-full bg-primary/10">
                                        <Mail className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-medium">Email</p>
                                        <p className="text-muted-foreground">communication@mytree.care</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden rounded-xl border py-0">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.451531533308!2d78.3847018746281!3d17.438089601343602!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb912d89ea1685%3A0xa5eed7b1e987d316!2sMY%20TREE%20ENVIROS!5e0!3m2!1sen!2sin!4v1764772791055!5m2!1sen!2sin"
                                className="w-full h-64"
                                loading="lazy"
                                allowFullScreen
                            ></iframe>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <Card className="p-8 shadow-md hover:shadow-xl transition-all">
                            <h3 className="text-2xl font-semibold mb-6">Send Us a Message</h3>
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input placeholder="Full Name" className="h-12" />
                                    <Input placeholder="Email Address" type="email" className="h-12" />
                                </div>
                                <Input placeholder="Phone Number" className="h-12" />
                                <Textarea placeholder="Your Message" rows={6} className="resize-none" />
                                <Button className="w-full h-12 text-base">Submit Message</Button>
                            </form>
                        </Card>
                    </div>
                </div>
            </Section>

            <div className="mt-20 bg-muted/30 py-16">
                <div className="max-w-6xl mx-auto text-center space-y-4">
                    <h3 className="text-xl font-semibold">Business Hours</h3>
                    <p className="text-muted-foreground">Monday – Saturday: 9:30 AM – 6:30 PM</p>
                    <p className="text-muted-foreground">Sunday: Closed</p>
                </div>
            </div>
        </div>
    )
}

export default Page
