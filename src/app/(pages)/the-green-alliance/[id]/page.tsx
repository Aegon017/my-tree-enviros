"use client";

import {
  ArrowLeft,
  Calendar,
  CreditCard,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FeedTree } from "@/types/feed-tree";
import { campaignService } from "@/services/campaign.services";
import { Markup } from "interweave";
import { useAuth } from "@/hooks/use-auth";
import { LoginDialog } from "@/components/login-dialog";

interface ApiResponse {
  status: boolean;
  message: string;
  data: {
    campaign_id: number;
    title: string;
    campaign_details: FeedTree;
    raised_amount: number;
    pending_amount: number;
    target_amount: number | null;
    donors: Array<{
      donor_name: string;
      amount: string;
    }>;
  };
}

const formatMoney = (amount: number) => `${amount}`;

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;

  const [campaignData, setCampaignData] = useState<ApiResponse["data"] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState("");

  useEffect(() => {
    const fetchFeedTree = async () => {
      try {
        const response = await campaignService.getById(Number(id));

        if (response.data?.campaign) {
          const c = response.data.campaign;

          const mapped: ApiResponse["data"] = {
            campaign_id: c.id,
            title: c.name,
            campaign_details: {
              id: c.id,
              state_id: 0,
              city_id: 0,
              area: c.location?.name || "",
              type_id: null,
              name: c.name,
              slug: c.slug,
              sku: "",
              description: c.description || "",
              goal_amount: String(c.target_amount ?? "0"),
              raised_amount: String(c.raised_amount ?? "0"),
              main_image: "",
              expiration_date: c.end_date || new Date().toISOString(),
              created_at: c.created_at || new Date().toISOString(),
              updated_at: c.updated_at || new Date().toISOString(),
              created_by: 0,
              updated_by: 0,
              trash: 0,
              status: 1,
              main_image_url:
                c.thumbnail_url ||
                (Array.isArray(c.image_urls) ? c.image_urls[0] : "") ||
                "",
              city: {
                id: 0,
                name: c.location?.name || "",
                state_id: 0,
                slug: "",
                main_img: null,
                status: 1,
                trash: 0,
                created_by: 0,
                updated_by: 0,
                created_at: c.created_at || "",
                updated_at: c.updated_at || "",
                main_img_url: "",
              },
              state: {
                id: 0,
                name: c.location?.name || "",
                slug: "",
                main_img: null,
                status: 1,
                trash: 0,
                created_by: 0,
                updated_by: 0,
                created_at: c.created_at || "",
                updated_at: c.updated_at || "",
                main_img_url: "",
              },
              donations: [],
            },
            raised_amount: Number(c.raised_amount ?? 0),
            pending_amount: c.target_amount
              ? Number(c.target_amount) - Number(c.raised_amount ?? 0)
              : 0,
            target_amount: c.target_amount || null,
            donors: [],
          };

          setCampaignData(mapped);
          return;
        }

        throw new Error("Campaign not found");
      } catch (err) {
        setError("Failed to load campaign details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchFeedTree();
  }, [id]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const finalUnits = useMemo(
    () => parseInt(selectedUnits) || 0,
    [selectedUnits]
  );

  const totalMoney = useMemo(() => finalUnits * 500, [finalUnits]);

  const handleProceedToCheckout = useCallback(() => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    if (finalUnits <= 0) {
      alert("Please select valid Green Units");
      return;
    }

    const params = new URLSearchParams({
      mode: "buy_now",
      type: "campaign",
      campaign_id: id,
      amount: finalUnits.toString(),
    });
    router.push(`/checkout?${params.toString()}`);
  }, [user, finalUnits, id, router]);

  const campaignDetails = useMemo(() => {
    if (!campaignData) return null;

    const goalAmount = parseFloat(campaignData.campaign_details.goal_amount);
    const isExpired =
      new Date(campaignData.campaign_details.expiration_date) < new Date();
    const daysLeft = isExpired
      ? 0
      : Math.ceil(
        (new Date(
          campaignData.campaign_details.expiration_date
        ).getTime() -
          Date.now()) /
        (1000 * 60 * 60 * 24)
      );

    return {
      goalAmount,
      isExpired,
      daysLeft,
    };
  }, [campaignData]);

  if (loading) {
    return (
      <Section>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold">Loading Campaign...</h1>
          <p className="text-muted-foreground mt-2">
            Please wait while we load the campaign details.
          </p>
        </div>
      </Section>
    );
  }

  if (error || !campaignData) {
    return (
      <Section>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive">
            {error ? "Error Loading Campaign" : "Campaign Not Found"}
          </h1>
          <Link
            href="/the-green-alliance"
            className="mt-4 inline-flex items-center gap-2 text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Campaigns
          </Link>
        </div>
      </Section>
    );
  }

  const { campaign_details } = campaignData;

  if (!campaignDetails) return null;

  return (
    <Section>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-0 shadow-lg pt-0">
            <div className="relative h-80">
              <Image
                src={campaign_details.main_image_url}
                alt={campaign_details.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute top-4 left-4">
                <Badge
                  variant={campaignDetails.isExpired ? "destructive" : "default"}
                  className="backdrop-blur-sm"
                >
                  {campaignDetails.isExpired ? "Expired" : "Active"}
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-4">
              <div className="space-y-3">
                <CardTitle className="text-3xl lg:text-4xl leading-tight">
                  {campaign_details.name}
                </CardTitle>
                <CardDescription className="flex flex-col sm:flex-row gap-3 text-base">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {campaign_details.area}, {campaign_details.city.name}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Ends {formatDate(campaign_details.expiration_date)}
                  </span>
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <TreePine className="h-5 w-5" />
                Campaign Story
              </div>
              <Markup
                content={campaign_details.description ?? ""}
                className="prose max-w-none dark:prose-invert"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-20 border shadow-lg">
            <CardContent className="space-y-6">
              {!campaignDetails.isExpired && (
                <div className="space-y-4">
                  <Label className="text-sm font-medium">
                    Select Green Units
                  </Label>

                  <select
                    className="w-full border rounded-md p-2"
                    value={selectedUnits}
                    onChange={(e) => setSelectedUnits(e.target.value)}
                  >
                    <option value="">Select Units</option>
                    {Array.from({ length: 100 }, (_, i) => i + 1).map(
                      (unit) => (
                        <option key={unit} value={unit}>
                          {unit} Green Units
                        </option>
                      )
                    )}
                  </select>

                  {finalUnits > 0 && (
                    <p className="text-base font-semibold text-primary">
                      Total Amount: {formatMoney(totalMoney)} Rupees
                    </p>
                  )}
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                disabled={campaignDetails.isExpired || finalUnits <= 0}
                onClick={handleProceedToCheckout}
              >
                {campaignDetails.isExpired
                  ? "Campaign Ended"
                  : `Proceed to Checkout (${finalUnits} Units = ${totalMoney} Rupees)`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </Section>
  );
};

export default Page;
