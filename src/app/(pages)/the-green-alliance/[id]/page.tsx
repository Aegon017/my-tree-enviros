"use client";

import { ArrowLeft, Calendar, MapPin, TreePine } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import Section from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { campaignService } from "@/services/campaign.services";
import { Markup } from "interweave";
import { useAuth } from "@/hooks/use-auth";
import { LoginDialog } from "@/components/login-dialog";

export default function Page() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await campaignService.getById(Number(id));
        const c = res.data?.campaign;
        if (!c) throw new Error("Not found");

        setCampaign({
          id: c.id,
          name: c.name,
          area: c.location?.name || "",
          description: c.description || "",
          expiration_date: c.end_date || new Date().toISOString(),
          main_image_url:
            c.thumbnail_url ||
            (Array.isArray(c.image_urls) ? c.image_urls[0] : "") ||
            "",
          city: c.location?.name || "",
        });
      } catch {
        setError("Failed to load campaign");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const totalMoney = useMemo(() => 500, []);
  const isExpired = campaign && new Date(campaign.expiration_date) < new Date();

  const handleCheckout = useCallback(() => {
    if (!user) return setShowLoginDialog(true);

    const params = new URLSearchParams({
      mode: "buy_now",
      type: "campaign",
      campaign_id: String(id),
      amount: String(totalMoney),
    });

    router.push(`/checkout?${params.toString()}`);
  }, [user, totalMoney, id, router]);

  if (loading)
    return (
      <Section>
        <div className="text-center py-12 text-xl font-semibold">Loading...</div>
      </Section>
    );

  if (error || !campaign)
    return (
      <Section>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-600">{error || "Campaign Not Found"}</h1>
          <Link href="/the-green-alliance" className="inline-flex mt-4 gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Campaigns
          </Link>
        </div>
      </Section>
    );

  return (
    <Section>
      <div className="grid gap-8 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden shadow-lg border-0">
            <div className="relative h-80">
              <Image
                src={campaign.main_image_url}
                alt={campaign.name}
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
              <CardTitle className="text-3xl">{campaign.name}</CardTitle>
              <CardDescription className="flex gap-4 text-base mt-2">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {campaign.area}, {campaign.city}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Ends {new Date(campaign.expiration_date).toLocaleDateString("en-US")}
                </span>
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                <TreePine className="h-5 w-5" /> Campaign Story
              </div>

              <Markup content={campaign.description} className="prose dark:prose-invert" />
            </CardContent>
          </Card>
        </div>

        <Card className="sticky top-20 shadow-lg">
          <CardContent className="space-y-6">
            <Button
              className="w-full"
              size="lg"
              disabled={isExpired}
              onClick={handleCheckout}
            >
              {isExpired ? "Campaign Ended" : `Proceed to Checkout (${totalMoney} Rupees)`}
            </Button>
          </CardContent>
        </Card>
      </div>

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </Section>
  );
}