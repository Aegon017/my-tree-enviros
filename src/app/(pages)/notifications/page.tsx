"use client";

import useSWR from "swr";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import { notificationService } from "@/services/notification.services";
import type { Notification, ApiResponse } from "@/types/notification.types";
import {
  Check,
  ExternalLink,
  CircleDot,
} from "lucide-react";

const fetcher = async () => {
  const response = await notificationService.getAll();
  return response;
};

const groupByDate = (items: Notification[]) => {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const groups: any = { Today: [], Yesterday: [], Older: [] };

  items.forEach((n) => {
    const date = new Date(n.created_at).toDateString();
    if (date === today) groups.Today.push(n);
    else if (date === yesterday) groups.Yesterday.push(n);
    else groups.Older.push(n);
  });

  return groups;
};

const Page = () => {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
    "notifications",
    fetcher,
  );

  const notifications = data?.data ?? [];
  const grouped = groupByDate(notifications);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      mutate();
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Section>
      <SectionTitle
        title="Notifications"
        align="center"
        subtitle={`${notifications.length} total`}
      />

      <div className="max-w-5xl mx-auto space-y-4">
        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            You're all caught up
          </p>
        )}

        {!isLoading && notifications.length > 0 && (
          <Accordion
            type="single"
            collapsible
            defaultValue={String(notifications[0]?.id)}
          >
            {(["Today", "Yesterday", "Older"] as const).map((section) => (
              grouped[section].length > 0 && (
                <div key={section}>
                  {/* SECTION HEADER */}
                  <div className="text-xs font-semibold uppercase text-muted-foreground px-4 py-2 bg-background border-b">
                    {section}
                  </div>

                  {/* SECTION ITEMS */}
                  {grouped[section].map((n: Notification) => (
                    <AccordionItem
                      key={n.id}
                      value={String(n.id)}
                      className="border-none"
                    >
                      <AccordionTrigger className="flex items-center gap-3 px-4 py-3 hover:bg-accent/20 transition">
                        {!n.read_at && (
                          <CircleDot className="h-4 w-4 text-primary shrink-0" />
                        )}
                        <span className="flex-1 text-sm font-medium text-foreground line-clamp-1">
                          {n.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(n.created_at)}
                        </span>
                      </AccordionTrigger>

                      <AccordionContent className="px-4 pb-4 pt-2 space-y-2">
                        <div
                          className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert"
                          dangerouslySetInnerHTML={{ __html: n.message }}
                        />

                        <div className="flex items-center gap-3">
                          {/* Mark as read */}
                          {!n.read_at && (
                            <button
                              onClick={() => handleMarkAsRead(n.id)}
                              className="flex items-center gap-1 text-xs text-success hover:underline"
                            >
                              <Check className="h-3 w-3" />
                              Mark as read
                            </button>
                          )}
                          {/* Link action */}
                          {n.link && (
                            <a
                              href={n.link}
                              target="_blank"
                              className="flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View
                            </a>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </div>
              )
            ))}
          </Accordion>
        )}
      </div>
    </Section>
  );
};

export default Page;
