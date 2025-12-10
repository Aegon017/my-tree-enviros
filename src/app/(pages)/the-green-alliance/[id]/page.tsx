"use client";

import {
  ArrowLeft,
  Calendar,
  CreditCard,
  MapPin,
  TreePine,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Section from "@/components/section";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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

const formatUnits = (amount: number) => `${amount} Green Units`;

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

interface DonorAvatarProps {
  name: string;
  amount: string;
}

const DonorAvatar = ({ name, amount }: DonorAvatarProps) => (
  <div className="flex items-center justify-between p-3 rounded-md border border-border/50 hover:border-primary/20 transition-colors">
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-primary/10 text-primary text-xs">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <p className="font-medium text-sm">{name}</p>
    </div>
    <p className="font-semibold text-green-600 text-sm">
      {formatUnits(parseFloat(amount))}
    </p>
  </div>
);

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;

  const [campaignData, setCampaignData] =
    useState<ApiResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const response = await campaignService.getById(Number(id));
        const c = response.data?.campaign;

        if (!c) throw new Error("Campaign not found");

        setCampaignData({
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
            created_at: c.created_at || "",
            updated_at: c.updated_at || "",
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
              created_at: "",
              updated_at: "",
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
              created_at: "",
              updated_at: "",
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
        });
      } catch (err) {
        setError("Failed to load campaign details");
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [id]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const finalAmount = useMemo(
    () => parseFloat(customAmount) || 0,
    [customAmount],
  );

  const handleProceedToCheckout = () => {
    if (!user) return setShowLoginDialog(true);
    if (finalAmount <= 0) return alert("Please enter valid Green Units");

    const params = new URLSearchParams({
      mode: "buy_now",
      type: "campaign",
      campaign_id: id,
      amount: finalAmount.toString(),
    });

    router.push(`/checkout?${params.toString()}`);
  };

  if (loading)
    return (
      <Section>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold">Loading Campaign...</h1>
        </div>
      </Section>
    );

  if (error || !campaignData)
    return (
      <Section>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive">
            {error || "Campaign not found"}
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

  const { campaign_details, donors } = campaignData;

  const isExpired =
    new Date(campaign_details.expiration_date) < new Date();

  const topDonors = [...donors]
    .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
    .slice(0, 3);

  return (
    <Section>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="relative h-80">
              <Image
                src={campaign_details.main_image_url}
                alt={campaign_details.name}
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
              <CardTitle className="text-3xl lg:text-4xl">
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
              {!isExpired && (
                <div className="space-y-4">
                  <Label className="text-sm font-medium">
                    Enter Green Units
                  </Label>

                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="Enter Green Units"
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="pl-10"
                      min="1"
                    />
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                disabled={isExpired || finalAmount <= 0}
                onClick={handleProceedToCheckout}
              >
                {isExpired
                  ? "Campaign Ended"
                  : `Proceed to Checkout (${formatUnits(finalAmount)})`}
              </Button>

              <div className="border-t pt-4" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Participated Members
                  </CardTitle>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        View All
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          All Participants ({donors.length})
                        </DialogTitle>
                      </DialogHeader>

                      <ScrollArea className="h-96">
                        <div className="space-y-3">
                          {donors.map((d, i) => (
                            <DonorAvatar
                              key={i}
                              name={d.donor_name}
                              amount={d.amount}
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>

                {topDonors.length > 0 && (
                  <div className="space-y-3">
                    {topDonors.map((d, i) => (
                      <DonorAvatar
                        key={i}
                        name={d.donor_name}
                        amount={d.amount}
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />
    </Section>
  );
};

export default Page;
