"use client";

import {
  ArrowLeft,
  Calendar,
  MapPin,
  TreePine,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Section from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FeedTree } from "@/types/feed-tree";
import { campaignService } from "@/services/campaign.services";
import { Markup } from "interweave";
import { useAuth } from "@/hooks/use-auth";
import { LoginDialog } from "@/components/login-dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ApiResponse {
  data: {
    campaign_id: number;
    title: string;
    campaign_details: FeedTree;
    raised_amount: number;
    pending_amount: number;
    target_amount: number | null;
    donors: Array<{ donor_name: string; amount: string }>;
  };
}

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;

  const [campaignData, setCampaignData] = useState<ApiResponse["data"] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedUnits, setSelectedUnits] = useState("1");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await campaignService.getById(Number(id));
        const c = res.data?.campaign;
        if (!c) throw new Error("Not found");

        setCampaignData({
          campaign_id: c.id,
          title: c.name,
          campaign_details: {
            id: c.id,
            name: c.name,
            slug: c.slug,
            area: c.location?.name || "",
            description: c.description ?? "",
            goal_amount: String(c.target_amount ?? "0"),
            raised_amount: String(c.raised_amount ?? "0"),
            expiration_date: c.end_date || new Date().toISOString(),
            main_image_url:
              c.thumbnail_url ||
              (Array.isArray(c.image_urls) ? c.image_urls[0] : "") ||
              "",
            city: {
              id: 0,
              name: c.location?.name || "",
            },
          } as any,
          raised_amount: Number(c.raised_amount ?? 0),
          pending_amount: Number(c.target_amount ?? 0) - Number(c.raised_amount ?? 0),
          target_amount: c.target_amount ?? 0,
          donors: [],
        });
      } catch {
        setError("Failed to load campaign");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const finalUnits = useMemo(() => parseInt(selectedUnits) || 1, [selectedUnits]);
  const totalMoney = useMemo(() => finalUnits * 500, [finalUnits]);

  const handleCheckout = useCallback(() => {
    if (!user) return setShowLoginDialog(true);

    const params = new URLSearchParams({
      mode: "buy_now",
      type: "campaign",
      campaign_id: id,
      amount: totalMoney.toString(), // ✅ FIXED: send money, not units
    });

    router.push(`/checkout?${params.toString()}`);
  }, [user, totalMoney, id, router]);

  if (loading)
    return (
      <Section>
        <div className="text-center py-12 text-xl font-semibold">Loading...</div>
      </Section>
    );

  if (error || !campaignData)
    return (
      <Section>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-600">
            {error || "Campaign Not Found"}
          </h1>
          <Link href="/the-green-alliance" className="inline-flex mt-4 gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Campaigns
          </Link>
        </div>
      </Section>
    );

  const c = campaignData.campaign_details;
  const isExpired = new Date(c.expiration_date) < new Date();

  return (
    <Section>
      <div className="grid gap-8 lg:grid-cols-3 items-start">
        {/* Left: Campaign Story */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden shadow-lg border-0">
            <div className="relative h-80">
              <Image
                src={c.main_image_url}
                alt={c.name}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge variant={isExpired ? "destructive" : "default"}>
                  {isExpired ? "Expired" : "Active"}
                </Badge>
              </div>
            </div>

            <CardHeader>
              <CardTitle className="text-3xl">{c.name}</CardTitle>
              <CardDescription className="flex gap-4 text-base mt-2">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {c.area}, {c.city.name}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Ends {new Date(c.expiration_date).toLocaleDateString("en-US")}
                </span>
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                <TreePine className="h-5 w-5" /> Campaign Story
              </div>

              <Markup
                content={c.description}
                className="prose dark:prose-invert"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: Donation Box */}
        <Card className="sticky top-20 shadow-lg">
          <CardContent className="space-y-6 pt-6">
            {!isExpired && (
              <div className="space-y-4">
                <Label>Select Green Units</Label>

                <Select value={selectedUnits} onValueChange={setSelectedUnits}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Units" />
                  </SelectTrigger>

                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((unit) => (
                      <SelectItem key={unit} value={String(unit)}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <p className="text-base font-semibold text-primary">
                  Total Amount: {totalMoney} Rupees
                </p>
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              disabled={isExpired}
              onClick={handleCheckout}
            >
              {isExpired
                ? "Campaign Ended"
                : `Proceed to Checkout (${finalUnits} Units = ${totalMoney} Rupees)`}
            </Button>
          </CardContent>
        </Card>
      </div>

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </Section>
  );
}