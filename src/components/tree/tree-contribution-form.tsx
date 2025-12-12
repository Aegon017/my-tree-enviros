"use client";

import { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AddToCartButton from "../add-to-cart-button";
import type { Tree } from "@/types/tree.types";

const dedicationSchema = z.object({
  name: z.string().min(1, "Name is required."),
  occasion: z.string().min(1, "Occasion is required."),
  message: z.string().min(1, "Message is required."),
});

type DedicationValues = z.infer<typeof dedicationSchema>;

import { InitiativeSiteSelector } from "../initiative-site-selector";

// ... existing imports

export default function TreeContributionForm({
  tree,
  pageType,
}: {
  tree: Tree;
  pageType: "sponsor" | "adopt";
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedYears, setSelectedYears] = useState<number>(1);
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);


  const planOptions = useMemo(() => {
    if (!tree?.plan_prices) return [];
    return tree.plan_prices.map((pp) => ({
      planPriceId: pp.id,
      planId: pp.plan?.id,
      duration: pp.plan.duration,
      durationDisplay:
        pp.plan.duration > 1
          ? `${pp.plan.duration} Years`
          : `${pp.plan.duration} Year`,
      price: Number(String(pp.price).replace(/,/g, "")),
    }));
  }, [tree?.plan_prices]);

  useEffect(() => {
    if (!planOptions.length) return;
    const durations = planOptions.map((p) => p.duration);
    const defaultDuration = durations.includes(1) ? 1 : Math.min(...durations);
    setSelectedYears((prev) =>
      durations.includes(prev) ? prev : defaultDuration,
    );
  }, [planOptions]);

  const selectedPlan = planOptions.find((p) => p.duration === selectedYears);
  const totalPrice = selectedPlan ? selectedPlan.price * quantity : 0;
  const adoptableLimit =
    pageType === "adopt" ? (tree?.adoptable_count ?? 0) : Infinity;

  const form = useForm<DedicationValues>({
    resolver: zodResolver(dedicationSchema),
    mode: "onChange",
    defaultValues: { name: "", occasion: "", message: "" },
  });

  const watchName = form.watch("name");
  const watchOccasion = form.watch("occasion");
  const watchMessage = form.watch("message");

  const handleSponsorNow = form.handleSubmit((values) => {
    if (!selectedPlan) return;

    const params = new URLSearchParams({
      mode: "buy_now",
      type: pageType,
      plan_price_id: selectedPlan.planPriceId.toString(),
      quantity: quantity.toString(),
      dedication_name: values.name,
      dedication_occasion: values.occasion,
      dedication_message: values.message,
    });

    router.push(`/checkout?${params.toString()}`);
  });

  return (
    <>
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-6">
            Configure Your {pageType === "sponsor" ? "Sponsorship" : "Adoption"}
          </h3>

          {pageType === "sponsor" && (
            <div className="mb-6">
              <Label className="mb-2 block">Choose Planting Site (Optional)</Label>
              <InitiativeSiteSelector
                onSelect={(site) => setSelectedSiteId(site?.id ?? null)}
                selectedSiteId={selectedSiteId}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pageType === "sponsor" && (
              <div className="space-y-3">
                <Label>Number of Trees</Label>
                <div className="flex items-center border rounded-md bg-background justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    max={999}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, Number(e.target.value || 1)))
                    }
                    className="w-16 text-center border-0"
                    readOnly
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            )}

            {pageType === "adopt" && (
              <div className="space-y-3">
                <Label>Quantity</Label>
                <div className="flex items-center border rounded-md bg-muted px-4 py-2">
                  <span className="font-semibold">1 Tree Instance</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label>Duration</Label>
              <Select
                value={String(selectedYears)}
                onValueChange={(v) => setSelectedYears(Number(v))}
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {planOptions.map((p) => (
                    <SelectItem key={p.planPriceId} value={String(p.duration)}>
                      {p.durationDisplay}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedPlan && (
            <div className="bg-primary/5 p-4 rounded-md border mt-6">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold">Total Contribution</span>
                  <p className="text-sm text-muted-foreground">
                    {quantity} × {selectedPlan.duration} year(s)
                  </p>
                </div>
                <span className="text-3xl font-bold text-primary">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <form className="space-y-6" onSubmit={handleSponsorNow}>
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-6">Add Your Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label>Name</Label>
                <Input
                  placeholder="Name on certificate"
                  {...form.register("name")}
                />
                <p className="text-sm text-destructive mt-1">
                  {(form.formState.errors.name?.message as string) || ""}
                </p>
              </div>

              <div className="space-y-3">
                <Label>Occasion</Label>
                <Input
                  placeholder="Birthday, Anniversary, etc."
                  {...form.register("occasion")}
                />
                <p className="text-sm text-destructive mt-1">
                  {(form.formState.errors.occasion?.message as string) || ""}
                </p>
              </div>

              <div className="md:col-span-2 space-y-3">
                <Label>Special Message</Label>
                <Textarea
                  rows={3}
                  placeholder="A message for the certificate"
                  {...form.register("message")}
                />
                <p className="text-sm text-destructive mt-1">
                  {(form.formState.errors.message?.message as string) || ""}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <AddToCartButton
            type={pageType}
            treeId={pageType === "sponsor" ? tree.id : undefined}
            treeInstanceId={pageType === "adopt" ? tree.id : undefined}
            planId={selectedPlan?.planId}
            planPriceId={selectedPlan?.planPriceId}
            initiativeSiteId={pageType === "sponsor" ? selectedSiteId : null}
            quantity={quantity}
            dedication={{
              name: watchName,
              occasion: watchOccasion,
              message: watchMessage,
            }}
            validateDedication={() => form.trigger()}
            onSuccess={() => form.reset()}
            treeData={tree}
            planPriceData={selectedPlan}
            disabled={pageType === "adopt" && adoptableLimit === 0}
          />

          <Button className="flex-1" disabled={!selectedPlan} type="submit">
            {" "}
            {pageType === "sponsor" ? "Sponsor" : "Adopt"} Now{" "}
          </Button>
        </div>
      </form>
    </>
  );
}
