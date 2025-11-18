"use client";

import { Markup } from "interweave";
import { Calendar, Leaf, Minus, Plus } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import BreadcrumbNav from "@/components/breadcrumb-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RazorpayButton from "@/components/razorpay-button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import type { Tree } from "@/types/tree.types";
import ImageGallery from "./image-gallery";
import AddToCartButton from "./add-to-cart-button";

const dedicationSchema = z.object( {
  name: z.string().min( 1, "Name is required." ),
  occasion: z.string().min( 1, "Occasion is required." ),
  message: z.string().min( 1, "Message is required." ),
} );

type DedicationValues = z.infer<typeof dedicationSchema>;

interface TreeDetailsLayoutProps {
  tree: Tree | undefined;
  isLoading: boolean;
  pageType: "sponsor" | "adopt";
}

export default function TreeDetailsLayout( {
  tree,
  isLoading,
  pageType,
}: TreeDetailsLayoutProps ) {
  const [ quantity, setQuantity ] = useState( 1 );
  const [ selectedYears, setSelectedYears ] = useState<number>( 1 );
  const [ startPayment, setStartPayment ] = useState( false );

  // FORM IS NOW USED FOR BOTH ACTIONS
  const form = useForm<DedicationValues>( {
    resolver: zodResolver( dedicationSchema ),
    mode: "onChange",
    defaultValues: { name: "", occasion: "", message: "" },
  } );

  const watchName = form.watch( "name" );
  const watchOccasion = form.watch( "occasion" );
  const watchMessage = form.watch( "message" );

  const planOptions = useMemo( () => {
    if ( !tree?.plan_prices ) return [];
    return tree.plan_prices.map( ( pp ) => ( {
      planPriceId: pp.id,
      planId: pp.plan?.id,
      duration: pp.plan.duration,
      durationDisplay:
        pp.plan.duration > 1 ? `${ pp.plan.duration } Years` : `${ pp.plan.duration } Year`,
      price: Number( pp.price.replace( /,/g, "" ) ),
    } ) );
  }, [ tree?.plan_prices ] );

  useEffect( () => {
    if ( planOptions.length > 0 ) {
      const durations = planOptions.map( ( p ) => p.duration );
      const defaultDuration = durations.includes( 1 ) ? 1 : Math.min( ...durations );
      setSelectedYears( ( prev ) => ( durations.includes( prev ) ? prev : defaultDuration ) );
    }
  }, [ planOptions ] );

  const selectedPlan = planOptions.find( ( p ) => p.duration === selectedYears );
  const totalPrice = selectedPlan ? selectedPlan.price * quantity : 0;

  const handleSponsorNow = ( values: DedicationValues ) => {
    if ( !tree || !selectedPlan ) return;

    const details = {
      ...values,
      duration: selectedYears,
      quantity,
      price: selectedPlan.price,
    };

    localStorage.setItem( `tree_details_${ tree.id }`, JSON.stringify( details ) );
    setStartPayment( true );
  };

  const adoptableLimit: number =
    pageType === "adopt" ? tree?.adoptable_count ?? 0 : Infinity;

  if ( isLoading || !tree ) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Skeleton className="w-full h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl bg-background">
      <BreadcrumbNav
        items={ [
          { title: "Home", href: "/" },
          {
            title: pageType === "sponsor" ? "Sponsor A Tree" : "Adopt A Tree",
            href: `/${ pageType }-a-tree`,
          },
          { title: tree.name, href: "" },
        ] }
        className="mb-8"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* LEFT */ }
        <div className="space-y-6 lg:sticky top-24 self-start">
          <ImageGallery images={ tree.image_urls || [] } name={ tree.name } />
        </div>

        {/* RIGHT */ }
        <div className="space-y-8">
          {/* Title */ }
          <div className="space-y-4">
            <Badge variant="outline">
              <Leaf className="h-3 w-3 mr-1" />
              { tree.age ?? 0 } years old
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight">{ tree.name }</h1>
          </div>

          {/* Contribution Config */ }
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Configure Your { pageType === "sponsor" ? "Sponsorship" : "Adoption" }
              </h3>

              <div className="space-y-6">
                {/* Quantity + Duration */ }
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* QUANTITY */ }
                  <div className="space-y-3">
                    <Label>Number of Trees</Label>

                    <div className="flex items-center border rounded-md bg-background justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={ () => setQuantity( Math.max( 1, quantity - 1 ) ) }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>

                      <Input
                        type="number"
                        min={ 1 }
                        max={ 999 }
                        value={ quantity }
                        onChange={ ( e ) =>
                          setQuantity( Math.max( 1, Number( e.target.value || 1 ) ) )
                        }
                        className="w-16 text-center border-0"
                      />

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={ () =>
                          setQuantity(
                            pageType === "adopt"
                              ? Math.min( adoptableLimit, quantity + 1 )
                              : quantity + 1
                          )
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    { pageType === "adopt" &&
                      ( adoptableLimit > 0 ? (
                        <p className="text-sm text-green-600">{ adoptableLimit } available</p>
                      ) : (
                        <p className="text-sm text-red-600">No trees available</p>
                      ) ) }
                  </div>

                  {/* DURATION */ }
                  <div className="space-y-3">
                    <Label>Duration</Label>
                    <Select
                      value={ String( selectedYears ) }
                      onValueChange={ ( val ) => setSelectedYears( Number( val ) ) }
                    >
                      <SelectTrigger className="h-11 w-full">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>

                      <SelectContent>
                        { planOptions.map( ( p ) => (
                          <SelectItem key={ p.planPriceId } value={ String( p.duration ) }>
                            { p.durationDisplay }
                          </SelectItem>
                        ) ) }
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* TOTAL */ }
                { selectedPlan && (
                  <div className="bg-primary/5 p-4 rounded-md border">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold">Total Contribution</span>
                        <p className="text-sm text-muted-foreground">
                          { quantity } × { selectedPlan.duration } year(s)
                        </p>
                      </div>

                      <span className="text-3xl font-bold text-primary">
                        ₹{ totalPrice.toLocaleString( "en-IN" ) }
                      </span>
                    </div>
                  </div>
                ) }
              </div>
            </CardContent>
          </Card>

          {/* FORM */ }
          <Form { ...form }>
            <form className="space-y-6">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-6">Add Your Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* NAME */ }
                    <FormField
                      control={ form.control }
                      name="name"
                      render={ ( { field } ) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Name on certificate" { ...field } />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      ) }
                    />

                    {/* OCCASION */ }
                    <FormField
                      control={ form.control }
                      name="occasion"
                      render={ ( { field } ) => (
                        <FormItem>
                          <FormLabel>Occasion</FormLabel>
                          <FormControl>
                            <Input placeholder="Birthday, Anniversary, etc." { ...field } />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      ) }
                    />

                    {/* MESSAGE */ }
                    <FormField
                      control={ form.control }
                      name="message"
                      render={ ( { field } ) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Special Message</FormLabel>
                          <FormControl>
                            <Textarea rows={ 3 } placeholder="A message for the certificate" { ...field } />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      ) }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* ACTION BUTTONS */ }
              <div className="flex gap-3">
                {/* ADD TO CART must validate dedication */ }
                <AddToCartButton
                  type={ pageType }
                  treeId={ tree.id }
                  planId={ selectedPlan?.planId }
                  planPriceId={ selectedPlan?.planPriceId }
                  quantity={ quantity }
                  dedication={ {
                    name: watchName,
                    occasion: watchOccasion,
                    message: watchMessage,
                  } }
                  validateDedication={ () => form.trigger() } // 🔥 validate before API call
                  disabled={ pageType === "adopt" && adoptableLimit === 0 }
                />

                {/* SPONSOR NOW (ZOD VALIDATED) */ }
                <Button
                  className="flex-1"
                  disabled={ !selectedPlan }
                  onClick={ form.handleSubmit( handleSponsorNow ) }
                >
                  { pageType === "sponsor" ? "Sponsor" : "Adopt" } Now
                </Button>
              </div>
            </form>
          </Form>

          {/* RAZORPAY */ }
          { startPayment && selectedPlan && (
            <div className="mt-4">
              <RazorpayButton
                type={ 1 }
                productType={ 1 }
                cartType={ 2 }
                label={ `${ pageType === "sponsor" ? "Sponsor" : "Adopt" } Now` }
                productId={ tree.id }
                amount={ Number( totalPrice ) }
                duration={ selectedYears }
                quantity={ quantity }
                name={ watchName }
                occasion={ watchOccasion }
                message={ watchMessage }
                tree_instance_id={ tree.id }
              />
            </div>
          ) }
        </div>
      </div>

      {/* DESCRIPTION */ }
      <div className="mt-16">
        <Tabs defaultValue="description">
          <TabsList className="grid w-full grid-cols-1 max-w-md mx-auto mb-8">
            <TabsTrigger value="description">About This Tree</TabsTrigger>
          </TabsList>

          <TabsContent value="description">
            <Card>
              <CardContent className="p-8">
                <Markup
                  className="prose max-w-none dark:prose-invert"
                  content={ tree.description }
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}