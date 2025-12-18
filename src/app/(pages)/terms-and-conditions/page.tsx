"use client";

import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import { Card, CardContent } from "@/components/ui/card";

const Page = () => {
  return (
    <Section>
      <SectionTitle
        title="Terms & Conditions"
        align="center"
        subtitle="Please read these terms carefully before using Our Services."
      />

      <Section className="lg:py-0">
        <div className="max-w-5xl mx-auto">
          <Card className="shadow-sm border py-0">
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none px-6">
              <section>
                <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                <p>
                  Welcome to the MyTree App (the “App”), developed and operated
                  by Mytree Enviros. By accessing or using the App, you agree to
                  be bound by these Terms and Conditions and our Privacy Policy.
                  If you do not agree to these terms, please do not use the App.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  2. User Responsibilities
                </h2>
                <p>
                  You are responsible for maintaining the confidentiality of
                  your account and any activity that occurs under your account.
                  You agree not to engage in any activity that may harm,
                  disrupt, or negatively affect the App or other users. This
                  includes, but is not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Engaging in unlawful activities</li>
                  <li>Uploading harmful content (viruses, malware, etc.)</li>
                  <li>Violating intellectual property rights</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  3. Privacy and Data Collection
                </h2>
                <p>
                  By using the App, you agree to the collection and use of your
                  personal data as outlined in our Privacy Policy. This may
                  include information like your name, email address, usage data,
                  and location. For more details, please review our Privacy
                  Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  4. Intellectual Property
                </h2>
                <p>
                  All content, logos, graphics, text, and software within the
                  App are the property of Mytree Enviros or its licensors and
                  are protected by copyright laws. You may not copy, distribute,
                  modify, or create derivative works of any part of the App
                  without prior written consent.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  5. User-Generated Content
                </h2>
                <p>
                  If the App allows you to submit content (such as photos, text,
                  comments), you retain ownership of your content. However, by
                  submitting content, you grant Mytree Enviros a non-exclusive,
                  royalty-free, and transferable license to use, display, and
                  distribute your content within the App and related services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  6. Payments and Subscriptions
                </h2>
                <p>
                  The App may offer paid features such as subscriptions or
                  one-time purchases. By making a purchase, you agree to the
                  pricing, payment, and refund policies shown at checkout. All
                  payments are processed through third-party services, whose
                  terms you should review.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  7. Limitation of Liability
                </h2>
                <p>
                  To the maximum extent allowed by law, Mytree Enviros is not
                  responsible for damages, losses, or liabilities arising from
                  your use of the App, including errors, interruptions, or
                  failures in the App.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  8. Termination and Suspension
                </h2>
                <p>
                  We reserve the right to suspend or terminate your access to
                  the App at any time for violating these Terms and Conditions.
                  If terminated, your right to use the App ends immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">9. Governing Law</h2>
                <p>
                  All aspects of the use of this website, the purchase of any
                  products or services from My Tree Enviros, and any disputes
                  arising therefrom shall be governed by and construed in
                  accordance with the laws of the state of Telangana, India.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  10. Changes to Terms and Conditions
                </h2>
                <p>
                  We may update these Terms at any time. If changes occur, we
                  will notify you through the App or via email. Continued use of
                  the App means you accept the updated Terms.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </Section>
    </Section>
  );
};

export default Page;
