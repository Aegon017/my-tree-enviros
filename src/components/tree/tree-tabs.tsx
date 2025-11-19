"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Markup } from "interweave";

export default function TreeTabs( { description }: { description?: string | null } ) {
    return (
        <Tabs defaultValue="description">
            <TabsList className="grid w-full grid-cols-1 max-w-md mx-auto mb-8">
                <TabsTrigger value="description">About This Tree</TabsTrigger>
            </TabsList>

            <TabsContent value="description">
                <Card>
                    <CardContent className="p-8">
                        <Markup className="prose max-w-none dark:prose-invert" content={ description || "" } />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}