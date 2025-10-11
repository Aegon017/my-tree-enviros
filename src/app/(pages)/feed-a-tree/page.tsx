"use client";

import { Calendar, Heart, MapPin, Target } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { FeedTree } from "@/types/feed-tree";
import { authStorage } from "@/lib/auth-storage";
import { Markup } from "interweave";
import FeedTreeCardSkeleton from "@/components/skeletons/feed-tree-card-skeleton";

const calculateProgress = ( raised: string, goal: string ) => {
  const raisedNum = parseFloat( raised );
  const goalNum = parseFloat( goal );
  return Math.round( ( raisedNum / goalNum ) * 100 );
};

const formatCurrency = ( amount: string ) => {
  return new Intl.NumberFormat( "en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  } ).format( parseFloat( amount ) );
};

const formatDate = ( dateString: string ) => {
  return new Date( dateString ).toLocaleDateString( "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  } );
};

const isExpired = ( expirationDate: string ) => {
  return new Date( expirationDate ) < new Date();
};

const Page = () => {
  const [ feedTrees, setFeedTrees ] = useState<FeedTree[]>( [] );
  const [ loading, setLoading ] = useState( true );
  const [ error, setError ] = useState<string | null>( null );

  useEffect( () => {
    const fetchFeedTrees = async () => {
      try {
        const res = await fetch(
          `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/feed-trees`,
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${ authStorage.getToken() }`,
            },
            cache: "no-store",
          },
        );

        if ( !res.ok ) throw new Error( "Failed to fetch feed trees" );

        const data = await res.json();
        setFeedTrees( data.data || [] );
      } catch ( err ) {
        console.error( "Error fetching feed trees:", err );
        setError( "Failed to load feed trees" );
      } finally {
        setLoading( false );
      }
    };

    fetchFeedTrees();
  }, [] );

  if ( loading ) {
    return (
      <Section>
        <SectionTitle
          title="Feed Tree"
          align="center"
          subtitle="Support our campaign to nourish and sustain trees for a greener future."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          { [ ...Array( 3 ) ].map( ( _, i ) => (
            <FeedTreeCardSkeleton key={ i } />
          ) ) }
        </div>
      </Section>
    );
  }

  if ( error ) {
    return (
      <Section>
        <SectionTitle
          title="Feed Tree"
          align="center"
          subtitle="Support our campaign to nourish and sustain trees for a greener future."
        />
        <div className="flex justify-center items-center py-12">
          <p className="text-destructive">{ error }</p>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <SectionTitle
        title="Feed Tree"
        align="center"
        subtitle="Support our campaign to nourish and sustain trees for a greener future."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
        { feedTrees.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              No feed trees available at the moment.
            </p>
          </div>
        ) : (
          feedTrees.map( ( tree ) => {
            const progress = calculateProgress(
              tree.raised_amount,
              tree.goal_amount,
            );
            const expired = isExpired( tree.expiration_date );

            console.log( tree )

            return (
              <Card
                key={ tree.id }
                className="overflow-hidden hover:shadow-lg transition-shadow pt-0"
              >
                <div className="relative h-48">
                  <Image
                    src={ tree.main_image_url }
                    alt={ tree.name }
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    priority
                  />
                  { expired && (
                    <Badge
                      variant="destructive"
                      className="absolute top-2 right-2"
                    >
                      Expired
                    </Badge>
                  ) }
                </div>

                <CardHeader>
                  <CardTitle className="line-clamp-2">{ tree.name }</CardTitle>
                  <CardDescription>
                    <Markup className="line-clamp-3" content={ tree.description } />
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>
                        { tree.area }, { tree.city.name }
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{ formatDate( tree.expiration_date ) }</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        Goal: { formatCurrency( tree.goal_amount ) }
                      </span>
                      <span className="flex items-center gap-1 text-green-600">
                        <Heart className="h-4 w-4" />
                        Raised: { formatCurrency( tree.raised_amount ) }
                      </span>
                    </div>

                    <Progress value={ progress } className="w-full" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{ progress }% funded</span>
                      <span>
                        { formatCurrency( tree.raised_amount ) } of{ " " }
                        { formatCurrency( tree.goal_amount ) }
                      </span>
                    </div>
                  </div>

                  <Link href={ `feed-a-tree/${ tree.id }` }>
                    <Button className="w-full" disabled={ expired }>
                      { expired ? "Campaign Ended" : "Support This Tree" }
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          } )
        ) }
      </div>
    </Section>
  );
};

export default Page;
