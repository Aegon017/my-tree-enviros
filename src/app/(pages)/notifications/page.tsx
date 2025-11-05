"use client";

import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import { notificationService } from "@/services/notification.service";
import type { Notification, ApiResponse } from "@/types/notification.types";

const fetcher = async (url: string) => {
  const response = await notificationService.getAll();
  return {
    status: response.status,
    message: response.message,
    data: response.data,
  };
};

const Page = () => {
  const { data, error, isLoading } = useSWR<ApiResponse>(
    "notifications",
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    },
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-destructive">
            <CardContent className="p-6 text-center">
              <p className="text-destructive">Error loading notifications</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const notifications = data?.data || [];

  return (
    <Section>
      <SectionTitle
        title="Notifications"
        align="center"
        subtitle={`You have ${notifications.length} notification${notifications.length !== 1 ? "s" : ""}`}
      />
      <div className="space-y-4">
        {isLoading
          ? ["skel-1", "skel-2", "skel-3"].map((skelKey) => (
              <Card key={skelKey} className="border-border">
                <CardContent className="p-6">
                  <Skeleton className="h-5 w-1/4 mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))
          : notifications.map((notification: Notification) => (
              <Card
                key={notification.id}
                className="border-border hover:border-primary/50 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-foreground">
                      {notification.title}
                    </CardTitle>
                    <Badge
                      variant={
                        notification.send_to === "all" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {notification.send_to}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-foreground mb-3">{notification.message}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(notification.created_at)}
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>
      {!isLoading && notifications.length === 0 && (
        <Card className="text-center py-12 border-border">
          <CardContent>
            <p className="text-muted-foreground">No notifications found</p>
          </CardContent>
        </Card>
      )}
    </Section>
  );
};

export default Page;
