"use client";

import { use, useEffect, useState } from "react";
import TreeDetailsLayout from "@/components/tree/tree-details-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Trees } from "lucide-react";
import { Button } from "@/components/ui/button";
import { treeService } from "@/services/tree.services";
import { Tree } from "@/types/tree.types";

export default function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [tree, setTree] = useState<Tree>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTree = async () => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    try {
      const res = await treeService.get(slug, "adopt");

      if (res.success) {
        setTree(res.data?.tree ?? null);
      } else {
        setError(res.message || "Failed to load tree");
      }
    } catch (e: any) {
      setError(e.message || "Failed to load tree");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTree();
  }, [slug]);

  if (error) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[50vh]">
        <Card className="w-full max-w-md border-destructive/20">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
              <Trees className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-destructive">
              Error Loading Tree
            </h2>
            <p className="text-muted-foreground">
              Unable to load tree details.
            </p>
            <Button onClick={loadTree} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <TreeDetailsLayout tree={tree} isLoading={loading} pageType="adopt" />;
}
