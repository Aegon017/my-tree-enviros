"use client";

import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import { Card, CardContent } from "@/components/ui/card";

const Page = () => {
  return (
    <Section>
      <SectionTitle
        title="Cancellation & Refund Policy"
        align="center"
        subtitle="My Tree Enviros"
      />

      <Section className="lg:py-0">
        <div className="mx-auto max-w-5xl">
          <Card className="border shadow-sm">
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none px-6 py-6">
              <p>
                This policy governs the cancellation of orders and the procedure
                for requesting a replacement or refund for products purchased
                from My Tree Enviros.
              </p>

              <h2>1. Order Cancellation Policy</h2>

              <p>
                <strong>Pre-Shipment Cancellation:</strong> You may cancel your
                order for a full refund (100% of the order value) provided the
                order has not yet been shipped. Once your order has been marked
                as shipped or dispatched, it cannot be cancelled.
              </p>

              <p>
                <strong>How to Cancel:</strong> To request a cancellation,
                please get in touch with our Customer Support Team immediately
                with your Order ID via email at
                <strong> communication@mytree.care</strong> or phone at
                <strong> +91 89777 30561</strong>.
              </p>

              <p>
                <strong>Refund for Cancellation:</strong> If the cancellation
                request is approved, the full refund will be initiated
                immediately and typically processed back to the original payment
                source within <strong>5–7 working days</strong>.
              </p>

              <h2>2. Replacement and Refund Policy (Post-Delivery)</h2>

              <p>
                Due to the perishable and delicate nature of live plants, our
                policy focuses primarily on replacement for products that are
                damaged in transit.
              </p>

              <h3>
                A. Eligibility for Replacement (within 10 days of delivery)
              </h3>

              <p>
                Replacement claims must be raised within 10 days of the delivery
                date. We offer replacement or reshipment for the following
                conditions:
              </p>

              <p>
                <strong>Live Plants (Trees & Saplings):</strong> Replacement is
                available only if the plant is severely damaged upon arrival and
                is deemed not curable. This includes:
              </p>

              <ul>
                <li>Completely uprooted from the soil.</li>
                <li>Major stems or branches are completely broken.</li>
                <li>The plant is completely dried out upon arrival.</li>
              </ul>

              <p>
                <strong>Note:</strong> Minor leaf damage, slight wilting, or
                soil spillage is normal during transit and does not qualify for
                a replacement, as these issues are typically resolved with
                proper watering and care.
              </p>

              <p>
                <strong>Non-Plant Products (Planters, Tools, Supplies):</strong>{" "}
                Replacement is available only if the product has visible damage,
                such as:
              </p>

              <ul>
                <li>Visible cracks or breaks on planters.</li>
                <li>Manufacturing defects or non-functional parts.</li>
              </ul>

              <p>
                <strong>Incorrect or Missing Items:</strong> If you receive a
                wrong product or if parts/items are missing from your order, we
                will reship the correct item(s).
              </p>

              <h3>B. Claim Procedure & Proof of Damage</h3>

              <ul>
                <li>
                  <strong>Contact:</strong> Raise a concern by contacting our
                  Customer Support Team within the 10-day window.
                </li>
                <li>
                  <strong>Visual Proof:</strong> Clear, high-resolution
                  photographs or a short video demonstrating the damage to the
                  plant or product, especially in the original packaging.
                </li>
                <li>
                  <strong>Empty Box Claim:</strong> If the package received is
                  empty or contains missing items, a video recording of the
                  package being opened (unboxing video) is mandatory for us to
                  process a reshipment/refund.
                </li>
              </ul>

              <h3>C. Return of Products</h3>

              <p>
                My Tree Enviros generally does not require the return of live,
                damaged plants.
              </p>

              <p>
                For damaged non-plant products, we will instruct the customer if
                a return is necessary. Approved replacements will be delivered
                within 7–10 working days from the date the claim is approved.
              </p>

              <h2>3. Failed Delivery / Return to Origin (RTO) Policy</h2>

              <p>
                In cases where an order is returned to our facility (RTO) due to
                a fault or action on the customer's part, the following refund
                conditions apply:
              </p>

              <div className="not-prose space-y-4">
                <Card>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Reason for RTO (Customer Fault)
                      </p>
                      <p>Incorrect/Incomplete Address</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Available Options
                      </p>
                      <p>Reshipment or Refund</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Policy
                      </p>
                      <p>
                        Reshipment: Shipping charges must be paid again by the
                        customer.
                      </p>
                      <p>
                        Refund: The refund will be processed after a 25%
                        deduction from the total order value to cover initial
                        shipping, handling, and logistics costs.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Reason for RTO (Customer Fault)
                      </p>
                      <p>Customer Unavailability</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Available Options
                      </p>
                      <p>Reshipment or Refund</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Policy
                      </p>
                      <p>
                        Reshipment: Shipping charges must be paid again by the
                        customer.
                      </p>
                      <p>
                        Refund: A deduction of 25% of the total order value will
                        apply.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Reason for RTO (Customer Fault)
                      </p>
                      <p>Refusal to Accept Delivery</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Available Options
                      </p>
                      <p>Refund Only</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Policy
                      </p>
                      <p>
                        A 25% deduction from the total order value will apply.
                        Prepaid orders that are refused are not eligible for a
                        full refund.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <h2>4. General Refund Processing</h2>

              <p>
                <strong>Refund Initiation:</strong> Once a replacement or RTO
                refund request is approved, the refund will be initiated by My
                Tree Enviros within 7-10 working days.
              </p>

              <p>
                <strong>Refund Method:</strong> All refunds will be credited
                back to the original source of payment (e.g., credit card, debit
                card, bank account, or digital wallet). The time it takes for
                the credit to appear in your account depends on your bank.
              </p>

              <p>
                <strong>Products Purchased on Sale:</strong> Items purchased at
                a discounted price or during a sale are not eligible for a
                monetary refund, but will be covered by a replacement policy for
                damage, subject to stock availability.
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>
    </Section>
  );
};

export default Page;
