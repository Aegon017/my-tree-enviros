"use client";

import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Heart,
  IndianRupee,
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
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FeedTree } from "@/types/feed-tree";
import { campaignService } from "@/services/campaign.services";
import { Markup } from "interweave";
import { useAuth } from "@/hooks/use-auth";
import { LoginDialog } from "@/components/login-dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

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

// CREDIT OPTIONS
const AMOUNT_OPTIONS = [
  { value: "500", label: "500 Credits" },
  { value: "custom", label: "Custom Credits" },
] as const;

// FORMAT CREDITS
const formatCredits = (amount: number) => `${amount} Credits`;

// GET INITIALS
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

interface DonorAvatarProps {
  name: string;
  amount: string;
}

const DonorAvatar = ({ name, amount }: DonorAvatarProps) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-md border border-border/50 hover:border-primary/20 transition-colors">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">{name}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-green-600 text-sm">
          {formatCredits(parseFloat(amount))}
        </p>
      </div>
    </div>
  );
};

interface ProgressStatsProps {
  raised: number;
  goal: number;
  daysLeft: number;
  isExpired: boolean;
}

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;

  const [campaignData, setCampaignData] = useState<ApiResponse["data"] | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState("500");
  const [customAmount, setCustomAmount] = useState("");

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
        console.error("Error fetching feed tree:", err);
        setError("Failed to load campaign details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFeedTree();
    }
  }, [id]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const finalAmount = useMemo(() => {
    if (selectedAmount === "custom") {
      return parseFloat(customAmount) || 0;
    }
    return parseFloat(selectedAmount);
  }, [selectedAmount, customAmount]);

  const handleAmountSelect = useCallback((value: string) => {
    setSelectedAmount(value);
    if (value !== "custom") {
      setCustomAmount("");
    }
  }, []);

  const handleProceedToCheckout = useCallback(() => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    if (finalAmount <= 0) {
      alert("Please select a valid credits amount");
      return;
    }

    const params = new URLSearchParams({
      mode: "buy_now",
      type: "campaign",
      campaign_id: id,
      amount: finalAmount.toString(),
    });
    router.push(`/checkout?${params.toString()}`);
  }, [user, finalAmount, id, router]);

  const campaignDetails = useMemo(() => {
    if (!campaignData) return null;

    const goalAmount = parseFloat(campaignData.campaign_details.goal_amount);
    const isExpired =
      new Date(campaignData.campaign_details.expiration_date) < new Date();
    const daysLeft = isExpired
      ? 0
      : Math.ceil(
        (new Date(campaignData.campaign_details.expiration_date).getTime() -
          Date.now()) /
        (1000 * 60 * 60 * 24),
      );

    const topDonors = [...campaignData.donors]
      .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
      .slice(0, 3);

    return {
      goalAmount,
      isExpired,
      daysLeft,
      topDonors,
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
          <p className="text-muted-foreground mt-2">
            {error || "The campaign you're looking for doesn't exist."}
          </p>
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

  const { campaign_details, raised_amount, donors } = campaignData;

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
                  variant={
                    campaignDetails.isExpired ? "destructive" : "default"
                  }
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
                  <Label className="text-sm font-medium">Select Credits</Label>

                  <RadioGroup
                    value={selectedAmount}
                    onValueChange={handleAmountSelect}
                    className="grid grid-cols-2 gap-2"
                  >
                    {AMOUNT_OPTIONS.map((option) => (
                      <div key={option.value}>
                        <RadioGroupItem
                          value={option.value}
                          id={`amount-${option.value}`}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={`amount-${option.value}`}
                          className="flex items-center justify-center rounded-md border-2 border-muted bg-transparent p-3 text-sm font-semibold hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  {selectedAmount === "custom" && (
                    <div className="space-y-2">
                      <Label htmlFor="custom-amount-input" className="text-sm">
                        Enter Custom Credits
                      </Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Select
                          value={customAmount}
                          onValueChange={setCustomAmount}
                        >
                          <SelectTrigger className="pl-10 w-full">
                            <SelectValue placeholder="Select credits" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Custom Credits</SelectLabel>
                              <SelectItem value="100">100 Credits</SelectItem>
                              <SelectItem value="250">250 Credits</SelectItem>
                              <SelectItem value="500">500 Credits</SelectItem>
                              <SelectItem value="1000">1000 Credits</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Selected Credits</span>
                      <span className="font-bold text-green-600">
                        {formatCredits(finalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                disabled={campaignDetails.isExpired || finalAmount <= 0}
                onClick={handleProceedToCheckout}
              >
                {campaignDetails.isExpired
                  ? "Campaign Ended"
                  : `Proceed to Checkout (${formatCredits(finalAmount)})`}
              </Button>

              <div className="border-t pt-4" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Top Supporters
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
                          All Supporters ({donors.length})
                        </DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-96">
                        <div className="space-y-3">
                          {donors.map((donor, index) => (
                            <DonorAvatar
                              key={`${donor.donor_name}-${donor.amount}-${index}`}
                              name={donor.donor_name}
                              amount={donor.amount}
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>

                {campaignDetails.topDonors.length > 0 ? (
                  <div className="space-y-3">
                    {campaignDetails.topDonors.map((donor, index) => (
                      <DonorAvatar
                        key={`${donor.donor_name}-${donor.amount}-${index}`}
                        name={donor.donor_name}
                        amount={donor.amount}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">
                      Be the first supporter
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </Section>
  );
};

export default Page;