"use client";

import { Calendar, Heart, MapPin, Target, Filter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import FeedTreeCardSkeleton from "@/components/skeletons/feed-tree-card-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import PaginationWrapper from "@/components/pagination-wrapper";
import type { Campaign } from "@/types/campaign.types";
import type { BaseMeta } from "@/types/common.types";
import { campaignService } from "@/services/campaign.services";

const calculateProgress = (raised: number, goal: number) => {
  if (!goal || goal <= 0) return 0;
  return Math.round((raised / goal) * 100);
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const isExpired = (expirationDate: string) => {
  return new Date(expirationDate) < new Date();
};

const getSearchParams = () =>
  typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();

const Page = () => {
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [meta, setMeta] = useState<BaseMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState(() => {
    const v = getSearchParams().get("search");
    return v && v !== "undefined" ? v : "";
  });

  const getFilters = () => {
    const params = getSearchParams();
    const pageRaw = params.get("page");
    const sortByRaw = params.get("sort_by");
    const sortOrderRaw = params.get("sort_order");
    const searchRaw = params.get("search");

    return {
      page: pageRaw ? Number(pageRaw) : 1,
      per_page: 12,
      sort_by: sortByRaw || "created_at",
      sort_order: sortOrderRaw || "desc",
      search: searchRaw && searchRaw !== "undefined" ? searchRaw : undefined,
    };
  };

  const cleanParams = (obj: Record<string, any>) =>
    Object.fromEntries(
      Object.entries(obj).filter(
        ([_, v]) =>
          v !== undefined &&
          v !== null &&
          v !== "" &&
          v !== "all" &&
          v !== "undefined",
      ),
    );

  const updateURL = async (updates: Record<string, any>) => {
    const params = getSearchParams();
    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        value === "all"
      ) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    const qs = params.toString();
    await router.push(qs ? `?${qs}` : "/the-green-alliance", { scroll: false });
    fetchCampaigns();
  };

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const f = cleanParams(getFilters());
      const response = await campaignService.getAll(f);
      setCampaigns(response.data?.campaigns || []);
      setMeta(response.data?.meta || null);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      setError("Failed to load campaigns");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [search]);

  const changePage = (p: number) => updateURL({ page: p });

  if (error && campaigns.length === 0) {
    return (
      <Section>
        <SectionTitle
          title="The Green Alliance"
          align="center"
          subtitle="Support our campaigns to nourish and sustain trees for a greener future."
        />
        <div className="flex justify-center items-center py-12">
          <p className="text-destructive">{error}</p>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <SectionTitle
        title="The Green Alliance"
        align="center"
        subtitle="Support our campaigns to nourish and sustain trees for a greener future."
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mt-8">
        <Input
          className="w-full sm:w-72"
          placeholder="Search campaigns..."
          value={search}
          onChange={(e) => {
            const v = e.target.value;
            setSearch(v);
            updateURL({ search: v || undefined, page: 1 });
          }}
        />

        <Sheet>
          <SheetTrigger asChild>
            <Button className="flex gap-2">
              <Filter className="h-4 w-4" />
              Sort
            </Button>
          </SheetTrigger>

          <SheetContent className="w-[380px] p-6">
            <SheetHeader>
              <SheetTitle className="text-lg font-semibold">
                Sort Options
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <div>
                <label className="text-sm font-medium">Sort By</label>
                <Select
                  value={`${getFilters().sort_by}-${getFilters().sort_order}`}
                  onValueChange={(val) => {
                    const [by, order] = val.split("-");
                    updateURL({ sort_by: by, sort_order: order, page: 1 });
                  }}
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at-desc">
                      Newest First
                    </SelectItem>
                    <SelectItem value="created_at-asc">Oldest First</SelectItem>
                    <SelectItem value="name-asc">Name (A → Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z → A)</SelectItem>
                    <SelectItem value="start_date-desc">
                      Start Date (Newest)
                    </SelectItem>
                    <SelectItem value="end_date-asc">Ending Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  updateURL({
                    search: undefined,
                    sort_by: undefined,
                    sort_order: undefined,
                    page: 1,
                  });
                  setSearch("");
                }}
              >
                Reset Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
        {loading && campaigns.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => (
            <FeedTreeCardSkeleton key={i} />
          ))
        ) : campaigns.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              No campaigns available at the moment.
            </p>
          </div>
        ) : (
          campaigns.map((campaign) => {
            const targetAmount = campaign.target_amount ?? 0;
            const raisedAmount = campaign.raised_amount ?? 0;
            const progress = calculateProgress(raisedAmount, targetAmount);
            const expired = isExpired(
              campaign.end_date ?? new Date().toISOString(),
            );

            return (
              <Card
                key={campaign.id}
                className="overflow-hidden hover:shadow-lg transition-shadow pt-0"
              >
                <div className="relative h-48">
                  <Image
                    src={campaign.thumbnail_url ?? "/placeholder.svg"}
                    alt={campaign.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    priority
                  />
                  {expired && (
                    <Badge
                      variant="destructive"
                      className="absolute top-2 right-2"
                    >
                      Expired
                    </Badge>
                  )}
                </div>

                <CardHeader>
                  <CardTitle className="line-clamp-2">
                    {campaign.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{campaign.location?.name ?? "—"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {campaign.end_date
                          ? formatDate(campaign.end_date)
                          : "No end date"}
                      </span>
                    </div>
                  </div>

                  {/* <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        Goal: {formatCurrency(targetAmount)}
                      </span>
                      <span className="flex items-center gap-1 text-green-600">
                        <Heart className="h-4 w-4" />
                        Raised: {formatCurrency(raisedAmount)}
                      </span>
                    </div>

                    <Progress value={progress} className="w-full" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{progress}% funded</span>
                      <span>
                        {formatCurrency(raisedAmount)} of{" "}
                        {formatCurrency(targetAmount)}
                      </span>
                    </div>
                  </div> */}

                  <Link href={`the-green-alliance/${campaign.id}`}>
                    <Button className="w-full" disabled={expired}>
                      {expired ? "Campaign Ended" : "Buy Credits"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {meta && meta.last_page > 1 && (
        <div className="flex justify-center mt-10">
          <PaginationWrapper meta={meta} onPageChange={changePage} />
        </div>
      )}
    </Section>
  );
};

export default Page;
