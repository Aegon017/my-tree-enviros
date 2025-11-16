"use client";

import { Markup } from "interweave";
import { Calendar, Leaf, Minus, Plus, Trees } from "lucide-react";
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
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import type { Tree } from "@/types/tree.types";
import ImageGallery from "./image-gallery";
import AddToCartButton from "./add-to-cart-button";

const sponsorshipDetailsSchema = z.object( {
  name: z.string().min( 1, "Name is required." ),
  occasion: z.string().min( 1, "Occasion is required." ),
  message: z.string().min( 1, "Message is required." ),
} );

type SponsorshipDetailsValues = z.infer<typeof sponsorshipDetailsSchema>;

interface TreeDetailsLayoutProps {
  tree: Tree | undefined;
  isLoading: boolean;
  pageType: "sponsor" | "adopt";
}

export default function TreeDetailsLayout( { tree, isLoading, pageType }: TreeDetailsLayoutProps ) {
  const [ quantity, setQuantity ] = useState( 1 );
  const [ selectedYears, setSelectedYears ] = useState<number>( 1 );
  const [ startPayment, setStartPayment ] = useState( false );

  const form = useForm<SponsorshipDetailsValues>( {
    resolver: zodResolver( sponsorshipDetailsSchema ),
    defaultValues: {
      name: "",
      occasion: "",
      message: "",
    },
  } );

  const planOptions = useMemo( () => {
    if ( !tree?.plan_prices ) return [];

    return tree.plan_prices.map( pp => ( {
      planPriceId: pp.id,
      planId: pp.plan?.id,
      duration: pp.plan.duration,
      durationDisplay:
        pp.plan.duration > 1
          ? `${ pp.plan.duration } Years`
          : `${ pp.plan.duration } Year`,
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

  const selectedPlan = planOptions.find( p => p.duration === selectedYears );
  const totalPrice = selectedPlan ? selectedPlan.price * quantity : 0;

  const handleSponsorNow = ( values: SponsorshipDetailsValues ) => {
    if ( !tree || !selectedPlan ) return;
    const details = { ...values, duration: selectedYears, quantity, price: selectedPlan.price };
    localStorage.setItem( `tree_details_${ tree.id }`, JSON.stringify( details ) );
    setStartPayment( true );
  };

  const breadcrumbItems = [
    { title: "Home", href: "/" },
    { title: pageType === "sponsor" ? "Sponsor A Tree" : "Adopt A Tree", href: `/${ pageType }-a-tree` },
    { title: tree?.name || "Tree Details", href: "" },
  ];

  const adoptableLimit: number = pageType === "adopt"
    ? ( tree?.adoptable_count ?? 0 )
    : Infinity;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl bg-background">
      <BreadcrumbNav items={ breadcrumbItems } className="mb-8" />

      <Form { ...form }>
        <form onSubmit={ ( e ) => e.preventDefault() } className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6 lg:sticky top-24 self-start">
            { isLoading ? <Skeleton className="aspect-square rounded-2xl" /> : tree ? <ImageGallery images={ tree.image_urls || [] } name={ tree.name } /> : null }
          </div>

          <div className="space-y-8">
            { !isLoading && tree && (
              <>
                <div className="space-y-4">
                  <Badge variant="outline">
                    <Leaf className="h-3 w-3 mr-1" />
                    { tree.age ?? 0 } years old
                  </Badge>
                  <h1 className="text-4xl font-bold tracking-tight">{ tree.name }</h1>
                </div>

                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Configure Your { pageType === "sponsor" ? "Sponsorship" : "Adoption" }
                    </h3>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <Trees className="h-4 w-4" />
                            Number of Trees
                          </Label>

                          <div className="flex items-center border rounded-md bg-background justify-between">
                            <Button variant="ghost" size="icon" type="button" onClick={ () => setQuantity( Math.max( 1, quantity - 1 ) ) }>
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              min={ 1 }
                              max={ 999 }
                              value={ quantity }
                              onChange={ ( e ) => setQuantity( Math.max( 1, Number( e.target.value || 1 ) ) ) }
                              className="w-16 text-center border-0"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              onClick={ () => {
                                if ( pageType === "adopt" && adoptableLimit !== null ) {
                                  setQuantity( Math.min( adoptableLimit, quantity + 1 ) );
                                } else {
                                  setQuantity( Math.min( 999, quantity + 1 ) );
                                }
                              } }
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          { pageType === "adopt" && (
                            adoptableLimit > 0 ? (
                              <p className="text-sm text-green-600 font-medium">
                                { adoptableLimit } tree{ adoptableLimit > 1 ? "s" : "" } available for adoption
                              </p>
                            ) : (
                              <p className="text-sm text-red-600 font-medium">
                                No trees available for adoption right now
                              </p>
                            )
                          ) }
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Duration
                          </Label>

                          <Select value={ String( selectedYears ) } onValueChange={ ( val ) => setSelectedYears( Number( val ) ) }>
                            <FormControl>
                              <SelectTrigger className="h-11 w-full">
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              { planOptions.map( ( p ) => (
                                <SelectItem key={ p.planId } value={ String( p.duration ) }>
                                  { p.durationDisplay }
                                </SelectItem>
                              ) ) }
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      { selectedPlan && (
                        <div className="bg-primary/5 p-4 rounded-md border">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-semibold">Total Contribution</span>
                              <p className="text-sm text-muted-foreground">
                                { quantity } tree{ quantity > 1 ? "s" : "" } × { selectedPlan.duration } year{ selectedPlan.duration > 1 ? "s" : "" }
                              </p>
                            </div>
                            <span className="text-3xl font-bold text-primary">₹{ totalPrice.toLocaleString( "en-IN" ) }</span>
                          </div>
                        </div>
                      ) }
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-primary mt-8">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-6">Add Your Details</h3>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <AddToCartButton
                    type={ pageType }
                    treeId={ tree.id }
                    planId={ selectedPlan?.planId }
                    planPriceId={ selectedPlan?.planPriceId }
                    quantity={ quantity }
                    dedication={ {
                      name: form.getValues( "name" ),
                      occasion: form.getValues( "occasion" ),
                      message: form.getValues( "message" ),
                    } }
                    disabled={ pageType === "adopt" && adoptableLimit === 0 }
                  />


                  <div className="flex-1 w-full">
                    <form
                      onSubmit={ ( e ) => {
                        e.preventDefault();
                        form.handleSubmit( ( vals ) => {
                          handleSponsorNow( vals );
                        } )();
                      } }
                    >
                      <Button type="submit" className="w-full" disabled={ !selectedPlan }>
                        { pageType === "sponsor" ? "Sponsor" : "Adopt" } Now
                      </Button>
                    </form>
                  </div>
                </div>

                { startPayment && selectedPlan && tree && (
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
                      name={ form.getValues( "name" ) }
                      occasion={ form.getValues( "occasion" ) }
                      message={ form.getValues( "message" ) }
                      tree_instance_id={ tree.id }
                    />
                  </div>
                ) }
              </>
            ) }
          </div>
        </form>
      </Form>

      { !isLoading && tree && (
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-1 max-w-md mx-auto mb-8">
              <TabsTrigger value="description">About This Tree</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-6">
              <Card className="bg-card">
                <CardContent className="p-8">
                  <Markup className="prose max-w-none dark:prose-invert" content={ tree.description } />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) }
    </div>
  );
}