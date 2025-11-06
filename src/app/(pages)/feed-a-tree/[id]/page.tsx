"use client";

import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Heart,
  IndianRupee,
  MapPin,
  Shield,
  TreePine,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import type { FeedTree } from "@/types/feed-tree";
import { authStorage } from "@/lib/auth-storage";
import { campaignService } from "@/services/campaign.service";
import type { DirectOrderRequest } from "@/types/campaign.types";

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

const AMOUNT_OPTIONS = [
  { value: "200", label: "₹200" },
  { value: "500", label: "₹500" },
  { value: "1000", label: "₹1000" },
  { value: "2000", label: "₹2000" },
  { value: "5000", label: "₹5000" },
  { value: "custom", label: "Custom" },
] as const;

declare global {
  interface Window {
    Razorpay: any;
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

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
    <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
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
          {formatCurrency(parseFloat(amount))}
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

const ProgressStats = ({
  raised,
  goal,
  daysLeft,
  isExpired,
}: ProgressStatsProps) => {
  const progress = Math.round((raised / goal) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-2">
        <span className="text-sm font-medium">Funding Progress</span>
        <span className="text-lg font-bold text-primary">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="p-3 rounded-lg bg-muted/30 border">
          <div className="text-lg font-bold text-green-600">
            {formatCurrency(raised)}
          </div>
          <div className="text-xs text-muted-foreground">Raised</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/30 border">
          <div className="text-lg font-bold text-blue-600">
            {formatCurrency(goal)}
          </div>
          <div className="text-xs text-muted-foreground">Goal</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status</span>
          <Badge variant={isExpired ? "destructive" : "default"}>
            {isExpired ? "Ended" : "Active"}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Days Left</span>
          <span className="font-medium">{daysLeft}</span>
        </div>
      </div>
    </div>
  );
};

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.body.appendChild(script);
  });
};

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignDetails: any;
  campaignId: string;
}

const PaymentDialog = ({
  open,
  onOpenChange,
  campaignDetails,
  campaignId,
}: PaymentDialogProps) => {
  const [selectedAmount, setSelectedAmount] = useState("500");
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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

  const processDirectPayment = useCallback(
    async (amount: number) => {
      try {
        
        if (!authStorage.isAuthenticated()) {
          window.location.href = "/sign-in";
          return;
        }

        
        await loadRazorpayScript();

        
        const orderRequest: DirectOrderRequest = {
          item_type: 'campaign',
          campaign_id: Number(campaignId),
          amount,
          quantity: 1,
        };

        const { order } = await campaignService.createDirectOrder(orderRequest);

        
        const paymentResponse = await campaignService.initiatePayment(
          order.id.toString(),
          { payment_method: 'razorpay' }
        );

        
        const options = {
          key: paymentResponse.key,
          amount: paymentResponse.amount,
          currency: paymentResponse.currency,
          name: "MyTree Enviros",
          description: `Support: ${campaignDetails.name}`,
          order_id: paymentResponse.razorpay_order_id,
          handler: async (response: any) => {
            try {
              
              await campaignService.verifyPayment(order.id.toString(), {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              alert(`Thank you for your support! Payment of ${formatCurrency(amount)} has been processed successfully.`);
              onOpenChange(false);
              setSelectedAmount("500");
              setCustomAmount("");
              
              
              window.location.href = `/payment/success?order_id=${order.id}`;
            } catch (error) {
              console.error("Payment verification failed:", error);
              alert("Payment verification failed. Please contact support.");
              window.location.href = `/payment/failure?order_id=${order.id}`;
            }
          },
          prefill: {
            name: authStorage.getUser()?.name || "",
            email: authStorage.getUser()?.email || "",
          },
          theme: {
            color: "#16a34a",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();

      } catch (error) {
        console.error("Direct payment error:", error);
        throw error;
      }
    },
    [campaignId, onOpenChange, campaignDetails?.name],
  );

  const handlePayment = useCallback(async () => {
    if (finalAmount <= 0) {
      alert("Please select a valid amount");
      return;
    }

    setIsProcessing(true);
    try {
      await processDirectPayment(finalAmount);
    } catch (error) {
      console.error("Direct payment failed:", error);
      alert("Could not process payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [finalAmount, processDirectPayment]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Support {campaignDetails.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12">
                <Image
                  src={campaignDetails.main_image_url}
                  alt={campaignDetails.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {campaignDetails.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {campaignDetails.area}, {campaignDetails.city.name}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base">Select Amount to Support</Label>

            <RadioGroup
              value={selectedAmount}
              onValueChange={handleAmountSelect}
              className="grid grid-cols-3 gap-3"
            >
              {AMOUNT_OPTIONS.map((option) => (
                <div key={option.value}>
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={option.value}
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <span className="font-semibold">{option.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {selectedAmount === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="custom-amount">Enter Custom Amount</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="custom-amount"
                    type="number"
                    placeholder="Enter amount in INR"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="pl-10"
                    min="1"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Selected Amount</span>
              <span className="font-semibold">
                {formatCurrency(finalAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Platform Fee</span>
              <span className="font-semibold">₹0</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount</span>
              <span className="text-green-600">
                {formatCurrency(finalAmount)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>Your payment is secure and encrypted</span>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={finalAmount <= 0 || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay {formatCurrency(finalAmount)}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Page = () => {
  const params = useParams();
  const id = params.id as string;

  const [campaignData, setCampaignData] = useState<ApiResponse["data"] | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  useEffect(() => {
    const fetchFeedTree = async () => {
      try {
        
        const response = await campaignService.getById(Number(id));
        
        if (response.success && response.data.campaign) {
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
              status: c.status,
              main_image_url: c.thumbnail_url || c.image_urls || "",
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
            pending_amount: c.target_amount ? Number(c.target_amount) - Number(c.raised_amount ?? 0) : 0,
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
            href="/feed-a-tree"
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
              <div
                className="prose prose-lg max-w-none text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: campaign_details.description,
                }}
              />
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Area</span>
                    <span className="font-medium">{campaign_details.area}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">City</span>
                    <span className="font-medium">
                      {campaign_details.city.name}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">State</span>
                    <span className="font-medium">
                      {campaign_details.state.name}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">
                      {formatDate(campaign_details.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="font-medium">
                      {formatDate(campaign_details.updated_at)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-20 border shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <Heart className="h-5 w-5 text-red-500" />
                Support This Tree
              </CardTitle>
              <CardDescription className="text-base">
                Join other supporters in nurturing this tree for a greener
                future.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <ProgressStats
                raised={raised_amount}
                goal={campaignDetails.goalAmount}
                daysLeft={campaignDetails.daysLeft}
                isExpired={campaignDetails.isExpired}
              />

              <Button
                className="w-full"
                size="lg"
                disabled={campaignDetails.isExpired}
                onClick={() => setPaymentDialogOpen(true)}
              >
                {campaignDetails.isExpired
                  ? "Campaign Ended"
                  : "Support This Tree"}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>Secure & encrypted donation process</span>
              </div>

              <Separator />

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

      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        campaignDetails={campaign_details}
        campaignId={id}
      />
    </Section>
  );
};

export default Page;
