"use client";

import { Markup } from "interweave";
import { Calendar, Leaf, Minus, Plus, Trees, User, Users } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import BreadcrumbNav from "@/components/breadcrumb-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RazorpayButton from "@/components/razorpay-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import type { Tree } from "@/types/tree.types";
import ImageGallery from "./image-gallery";
import { SigninForm } from "./sign-in-form";
import { VerifyOtpForm } from "./verify-otp-form";

const sponsorshipDetailsSchema = z.object( {
  area_id: z.string().min( 1, "Please select an area." ),
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

export default function TreeDetailsLayout( {
  tree,
  isLoading,
  pageType,
}: TreeDetailsLayoutProps ) {
  const [ quantity, setQuantity ] = useState( 1 );
  const [ selectedImage, setSelectedImage ] = useState( 0 );
  const [ selectedYears, setSelectedYears ] = useState( 1 );
  const [ loginOpen, setLoginOpen ] = useState( false );
  const { isAuthenticated } = useAuth();
  const [ otpStep, setOtpStep ] = useState<"signin" | "verify">( "signin" );
  const [ otpCC, setOtpCC ] = useState<string | undefined>( undefined );
  const [ otpPhone, setOtpPhone ] = useState<string | undefined>( undefined );
  const [ isAddingToCart, setIsAddingToCart ] = useState( false );
  const [ showRazorpay, setShowRazorpay ] = useState( false );

  const form = useForm<SponsorshipDetailsValues>( {
    resolver: zodResolver( sponsorshipDetailsSchema ),
    defaultValues: {
      area_id: "",
      name: "",
      occasion: "",
      message: "",
    },
  } );

  /* -------------------------------------------------------------------------- */
  /*                 PLAN OPTIONS — CLEAN & MATCHING YOUR BACKEND               */
  /* -------------------------------------------------------------------------- */

  const planOptions = useMemo( () => {
    if ( !tree?.plan_prices ) return [];

    return tree.plan_prices.map( ( pp ) => ( {
      id: pp.id,
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
      if ( !durations.includes( selectedYears ) ) {
        setSelectedYears( durations.includes( 1 ) ? 1 : Math.min( ...durations ) );
      }
    }
  }, [ planOptions, selectedYears ] );

  const selectedPlan = useMemo(
    () => planOptions.find( ( p ) => p.duration === selectedYears ),
    [ planOptions, selectedYears ]
  );

  const totalPrice = selectedPlan
    ? selectedPlan.price * quantity
    : 0;

  /* -------------------------------------------------------------------------- */

  const onSponsorNow = ( values: SponsorshipDetailsValues ) => {
    if ( !tree || !selectedPlan ) return;
    const details = { ...values, duration: selectedYears, quantity };
    localStorage.setItem( `tree_details_${ tree.id }`, JSON.stringify( details ) );
    if ( isAuthenticated ) {
      setShowRazorpay( true );
    } else {
      setLoginOpen( true );
    }
  };

  const handleLoginSuccess = async () => {
    setLoginOpen( false );
    if ( tree && selectedPlan ) {
      setShowRazorpay( true );
    }
    setOtpStep( "signin" );
  };

  const pageTitle = pageType === "sponsor" ? "Sponsor A Tree" : "Adopt A Tree";

  const breadcrumbItems = [
    { title: "Home", href: "/" },
    { title: pageType === "sponsor" ? "Sponsor A Tree" : "Adopt A Tree", href: `/${ pageType }-a-tree` },
    { title: tree?.name || "Tree Details", href: "" },
  ];

  /* -------------------------------------------------------------------------- */

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl bg-background">
      <BreadcrumbNav items={ breadcrumbItems } className="mb-8" />

      <Form { ...form }>
        <form
          onSubmit={ ( e ) => e.preventDefault() }
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          <div className="space-y-6 lg:sticky top-24 self-start">
            { isLoading ? (
              <Skeleton className="aspect-square rounded-2xl" />
            ) : tree ? (
              <ImageGallery images={ tree.image_urls || [] } name={ tree.name } />
            ) : null }
          </div>

          <div className="space-y-8">
            { isLoading ? (
              <>
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </>
            ) : tree ? (
              <>
                {/* --------------------------------- Title & Age --------------------------------- */ }
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant="outline">
                      <Leaf className="h-3 w-3 mr-1" />
                      { tree.age } years old
                    </Badge>
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight">
                    { tree.name }
                  </h1>
                </div>

                {/* --------------------------------- Plan / Duration --------------------------------- */ }
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Configure Your{ " " }
                      { pageType === "sponsor" ? "Sponsorship" : "Adoption" }
                    </h3>

                    <div className="space-y-6">
                      {/* ---------- Quantity ---------- */ }
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <Trees className="h-4 w-4" />
                            Number of Trees
                          </Label>

                          <div className="flex items-center border rounded-md bg-background justify-between">
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              onClick={ () => setQuantity( Math.max( 1, quantity - 1 ) ) }
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              max="999"
                              value={ quantity }
                              onChange={ ( e ) =>
                                setQuantity( Math.max( 1, Number( e.target.value ) ) )
                              }
                              className="w-16 text-center border-0"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              onClick={ () => setQuantity( Math.min( 999, quantity + 1 ) ) }
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* ---------- Duration Dropdown (NEW) ---------- */ }
                        <div className="space-y-3">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Duration (Years)
                          </Label>

                          <Select
                            value={ String( selectedYears ) }
                            onValueChange={ ( val ) => setSelectedYears( Number( val ) ) }
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 w-full">
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                            </FormControl>

                            <SelectContent>
                              { planOptions.map( ( p ) => (
                                <SelectItem
                                  key={ p.id }
                                  value={ String( p.duration ) }
                                >
                                  { p.durationDisplay }
                                </SelectItem>
                              ) ) }
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* ---------- Total Price ---------- */ }
                      { selectedPlan && (
                        <div className="bg-primary/5 p-4 rounded-md border">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-semibold">
                                Total Contribution
                              </span>
                              <p className="text-sm text-muted-foreground">
                                { quantity } tree{ quantity > 1 ? "s" : "" } ×{ " " }
                                { selectedPlan.duration } year
                                { selectedPlan.duration > 1 ? "s" : "" }
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="text-3xl font-bold text-primary">
                                ₹{ totalPrice.toLocaleString( "en-IN" ) }
                              </span>
                            </div>
                          </div>
                        </div>
                      ) }
                    </div>
                  </CardContent>
                </Card>

                {/* --------------------------------- Form --------------------------------- */ }
                <Card className="border-l-4 border-l-primary mt-8">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-6">Add Your Details</h3>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={ form.control }
                          name="area_id"
                          render={ ( { field } ) => (
                            <FormItem>
                              <FormLabel>Area</FormLabel>
                              <Select
                                onValueChange={ field.onChange }
                                defaultValue={ field.value }
                              >
                                <FormControl>
                                  <SelectTrigger className="h-11 w-full">
                                    <SelectValue placeholder="Select area" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  { ( tree as any )?.locations?.map( ( loc: any ) => (
                                    <SelectItem
                                      key={ loc.id }
                                      value={ String( loc.id ) }
                                    >
                                      { loc.name }
                                    </SelectItem>
                                  ) ) }
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          ) }
                        />

                        <FormField
                          control={ form.control }
                          name="name"
                          render={ ( { field } ) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input
                                  className="h-11 w-full"
                                  placeholder="Name on certificate"
                                  { ...field }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          ) }
                        />

                        <FormField
                          control={ form.control }
                          name="occasion"
                          render={ ( { field } ) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Occasion</FormLabel>
                              <FormControl>
                                <Input
                                  className="h-11 w-full"
                                  placeholder="Birthday, Anniversary, etc."
                                  { ...field }
                                />
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
                                <Textarea
                                  className="w-full resize-none"
                                  rows={ 3 }
                                  placeholder="A message for the certificate"
                                  { ...field }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          ) }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* --------------------------------- Actions --------------------------------- */ }
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 w-full"
                    disabled={ !selectedPlan || isAddingToCart }
                  >
                    Add To Cart
                  </Button>

                  { showRazorpay && isAuthenticated ? (
                    <RazorpayButton
                      type={ 1 }
                      productType={ 1 }
                      cartType={ 2 }
                      label={ `${ pageType === "sponsor" ? "Sponsor" : "Adopt" } Now` }
                      productId={ tree.id }
                      amount={ Number( totalPrice ) }
                      duration={ selectedYears }
                      quantity={ quantity }
                      area_id={ Number( form.getValues( "area_id" ) ) }
                      name={ form.getValues( "name" ) }
                      occasion={ form.getValues( "occasion" ) }
                      message={ form.getValues( "message" ) }
                      tree_instance_id={ tree.id }
                      plan_id={ selectedPlan.id }
                    />
                  ) : (
                    <Button
                      type="button"
                      className="flex-1 w-full"
                      onClick={ form.handleSubmit( onSponsorNow ) }
                      disabled={ !selectedPlan }
                    >
                      { pageType === "sponsor" ? "Sponsor" : "Adopt" } Now
                    </Button>
                  ) }
                </div>

                {/* -------------------------------- Login Modal -------------------------------- */ }
                <Dialog open={ loginOpen } onOpenChange={ setLoginOpen }>
                  <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Login to continue</DialogTitle>
                    </DialogHeader>

                    { otpStep === "signin" ? (
                      <SigninForm
                        onOtpSent={ ( { country_code, phone } ) => {
                          setOtpCC( country_code );
                          setOtpPhone( phone );
                          setOtpStep( "verify" );
                        } }
                      />
                    ) : (
                      <VerifyOtpForm
                        country_code={ otpCC }
                        phone={ otpPhone }
                        onSuccess={ handleLoginSuccess }
                      />
                    ) }
                  </DialogContent>
                </Dialog>
              </>
            ) : null }
          </div>
        </form>
      </Form>

      {/* --------------------------------- Description Section --------------------------------- */ }
      { !isLoading && tree && (
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-1 max-w-md mx-auto mb-8">
              <TabsTrigger value="description">
                About This Tree
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-6">
              <Card className="bg-card">
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
      ) }
    </div>
  );
}