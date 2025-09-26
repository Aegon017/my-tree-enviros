import {
    ArrowLeft,
    BarChart3,
    Calendar,
    Clock,
    Eye,
    Heart,
    MapPin,
    Share2,
    Shield,
    Target,
    TreePine,
    Users
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import AppLayout from "@/components/app-layout"
import Section from "@/components/section"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { FeedTree } from "@/types/feed-tree"

interface ApiResponse {
    status: boolean
    message: string
    data: {
        campaign_id: number
        title: string
        campaign_details: FeedTree
        raised_amount: number
        pending_amount: number
        target_amount: number | null
        donors: Array<{
            donor_name: string
            amount: string
        }>
    }
}

async function getFeedTree( id: string ): Promise<ApiResponse> {
    const res = await fetch( `http://localhost:8000/api/feed-tree/${ id }`, {
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer 427|4LYUrw0XklOJYQdQc5Oku41MweEjXO5EmLuKPfM97e99fba9',
            'X-CSRF-TOKEN': '',
        },
        cache: 'no-store'
    } )

    if ( !res.ok ) {
        throw new Error( 'Failed to fetch feed tree details' )
    }

    return res.json()
}

interface PageProps {
    params: {
        id: string
    }
}

const Page = async ( { params }: PageProps ) => {
    let campaignData: ApiResponse[ 'data' ] | null = null

    try {
        const data = await getFeedTree( params.id )
        campaignData = data.data
    } catch ( error ) {
        return (
            <AppLayout>
                <Section>
                    <div className="text-center py-12">
                        <h1 className="text-2xl font-bold text-destructive">Error Loading Campaign</h1>
                        <p className="text-muted-foreground mt-2">Failed to load campaign details. Please try again later.</p>
                        <Link href="/feed-trees" className="mt-4 inline-flex items-center gap-2 text-primary">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Campaigns
                        </Link>
                    </div>
                </Section>
            </AppLayout>
        )
    }

    if ( !campaignData ) {
        return (
            <AppLayout>
                <Section>
                    <div className="text-center py-12">
                        <h1 className="text-2xl font-bold">Campaign Not Found</h1>
                        <p className="text-muted-foreground mt-2">The campaign you're looking for doesn't exist.</p>
                        <Link href="/feed-trees" className="mt-4 inline-flex items-center gap-2 text-primary">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Campaigns
                        </Link>
                    </div>
                </Section>
            </AppLayout>
        )
    }

    const { campaign_details, raised_amount, pending_amount, donors } = campaignData
    const goalAmount = parseFloat( campaign_details.goal_amount )
    const progress = Math.round( ( raised_amount / goalAmount ) * 100 )
    const isExpired = new Date( campaign_details.expiration_date ) < new Date()
    const daysLeft = isExpired ? 0 : Math.ceil(
        ( new Date( campaign_details.expiration_date ).getTime() - Date.now() ) / ( 1000 * 60 * 60 * 24 )
    )

    const formatCurrency = ( amount: string | number ) => {
        return new Intl.NumberFormat( 'en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        } ).format( typeof amount === 'string' ? parseFloat( amount ) : amount )
    }

    const formatDate = ( dateString: string ) => {
        return new Date( dateString ).toLocaleDateString( 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        } )
    }

    const getInitials = ( name: string ) => {
        return name.split( ' ' ).map( part => part[ 0 ] ).join( '' ).toUpperCase().slice( 0, 2 )
    }

    const StatsCard = ( { icon: Icon, label, value, description }: { icon: any, label: string, value: string, description?: string } ) => (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{ value }</p>
                        <p className="text-sm font-medium text-muted-foreground">{ label }</p>
                        { description && <p className="text-xs text-muted-foreground mt-1">{ description }</p> }
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <AppLayout>
            <Section>
                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="overflow-hidden pt-0">
                            <div className="relative h-80">
                                <Image
                                    src={ campaign_details.main_image_url }
                                    alt={ campaign_details.name }
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                                <div className="absolute top-4 left-4 flex gap-2">
                                    { isExpired ? (
                                        <Badge variant="destructive" className="backdrop-blur-sm">
                                            Expired
                                        </Badge>
                                    ) : (
                                        <Badge variant="default" className="bg-green-500/90 backdrop-blur-sm">
                                            Active
                                        </Badge>
                                    ) }
                                </div>
                            </div>

                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-3xl lg:text-4xl leading-tight">
                                            { campaign_details.name }
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-4 text-base mt-2">
                                            <span className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                { campaign_details.area }, { campaign_details.city.name }
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                Ends { formatDate( campaign_details.expiration_date ) }
                                            </span>
                                        </CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Share2 className="h-4 w-4" />
                                        Share
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <StatsCard
                                        icon={ Target }
                                        label="Raised Amount"
                                        value={ formatCurrency( raised_amount ) }
                                        description={ `${ progress }% of goal` }
                                    />
                                    <StatsCard
                                        icon={ Clock }
                                        label="Days Left"
                                        value={ daysLeft.toString() }
                                        description={ isExpired ? "Campaign ended" : "Remaining time" }
                                    />
                                    <StatsCard
                                        icon={ Users }
                                        label="Total Donors"
                                        value={ donors.length.toLocaleString() }
                                        description="Supporters"
                                    />
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5" />
                                            Funding Progress
                                        </h3>
                                        <span className="text-2xl font-bold text-primary">{ progress }%</span>
                                    </div>

                                    <Progress value={ progress } className="h-3" />

                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="space-y-1">
                                            <div className="text-2xl font-bold text-green-600">{ formatCurrency( raised_amount ) }</div>
                                            <div className="text-xs text-muted-foreground">Raised</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-2xl font-bold text-orange-600">{ formatCurrency( pending_amount ) }</div>
                                            <div className="text-xs text-muted-foreground">To Go</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-2xl font-bold text-blue-600">{ formatCurrency( goalAmount ) }</div>
                                            <div className="text-xs text-muted-foreground">Goal</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Tabs defaultValue="about" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="about">About Campaign</TabsTrigger>
                                <TabsTrigger value="donors">Donors ({ donors.length })</TabsTrigger>
                                <TabsTrigger value="updates">Updates</TabsTrigger>
                            </TabsList>

                            <TabsContent value="about" className="space-y-4 pt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TreePine className="h-5 w-5" />
                                            Campaign Story
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div
                                            className="prose prose-lg max-w-none text-muted-foreground"
                                            dangerouslySetInnerHTML={ { __html: campaign_details.description } }
                                        />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Location Details</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Area</span>
                                                    <span className="font-medium">{ campaign_details.area }</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">City</span>
                                                    <span className="font-medium">{ campaign_details.city.name }</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">State</span>
                                                    <span className="font-medium">{ campaign_details.state.name }</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Created</span>
                                                    <span className="font-medium">{ formatDate( campaign_details.created_at ) }</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Last Updated</span>
                                                    <span className="font-medium">{ formatDate( campaign_details.updated_at ) }</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="donors" className="pt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Supporters ({ donors.length })
                                        </CardTitle>
                                        <CardDescription>
                                            People who have contributed to this campaign
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        { donors.length > 0 ? (
                                            <ScrollArea className="h-96">
                                                <div className="space-y-3">
                                                    { donors.map( ( donor, index ) => (
                                                        <div
                                                            key={ `${ donor.donor_name }-${ donor.amount }-${ index }` }
                                                            className="flex items-center justify-between p-4 rounded-lg border"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-10 w-10">
                                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                                        { getInitials( donor.donor_name ) }
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="font-medium">{ donor.donor_name }</p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        { formatDate( campaign_details.donations[ index ]?.created_at || new Date().toISOString() ) }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-semibold text-green-600 text-lg">
                                                                    { formatCurrency( donor.amount ) }
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">Donation</p>
                                                            </div>
                                                        </div>
                                                    ) ) }
                                                </div>
                                            </ScrollArea>
                                        ) : (
                                            <div className="text-center py-8">
                                                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                <p className="text-muted-foreground">No donations yet. Be the first to support!</p>
                                            </div>
                                        ) }
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="updates" className="pt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Campaign Updates</CardTitle>
                                        <CardDescription>
                                            Latest news and progress reports
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-8">
                                            <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-muted-foreground">No updates available yet.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="space-y-6">
                        <Card className="top-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Heart className="h-5 w-5 text-red-500" />
                                    Support This Tree
                                </CardTitle>
                                <CardDescription className="text-base">
                                    Your contribution helps nourish and sustain this tree for a greener future.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm font-medium">Progress</span>
                                        <span className="text-lg font-bold text-primary">{ progress }%</span>
                                    </div>
                                    <Progress value={ progress } className="h-2" />

                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div className="p-3 rounded-lg bg-muted/50">
                                            <div className="text-lg font-bold text-green-600">{ formatCurrency( raised_amount ) }</div>
                                            <div className="text-xs text-muted-foreground">Raised</div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-muted/50">
                                            <div className="text-lg font-bold text-blue-600">{ formatCurrency( goalAmount ) }</div>
                                            <div className="text-xs text-muted-foreground">Goal</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Status</span>
                                        <Badge variant={ isExpired ? "destructive" : "default" }>
                                            { isExpired ? "Ended" : "Active" }
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Donors</span>
                                        <span className="font-medium">{ donors.length.toLocaleString() }</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Days Remaining</span>
                                        <span className="font-medium">{ daysLeft }</span>
                                    </div>
                                </div>

                                <Button className="w-full" size="lg" disabled={ isExpired }>
                                    { isExpired ? 'Campaign Ended' : `Donate ${ formatCurrency( goalAmount - raised_amount ) }` }
                                </Button>

                                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                    <Shield className="h-3 w-3" />
                                    <span>Secure & encrypted donation process</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <span className="text-sm font-medium">Average Donation</span>
                                    <span className="font-bold">
                                        { donors.length > 0 ? formatCurrency( raised_amount / donors.length ) : formatCurrency( 0 ) }
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <span className="text-sm font-medium">Funding Needed</span>
                                    <span className="font-bold text-orange-600">{ formatCurrency( pending_amount ) }</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <span className="text-sm font-medium">Campaign Duration</span>
                                    <span className="font-bold">
                                        { Math.ceil( ( new Date( campaign_details.expiration_date ).getTime() - new Date( campaign_details.created_at ).getTime() ) / ( 1000 * 60 * 60 * 24 ) ) } days
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Share Campaign</CardTitle>
                                <CardDescription>
                                    Help spread the word about this important cause
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <span>Twitter</span>
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <span>Facebook</span>
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <span>WhatsApp</span>
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <span>Email</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Section>
        </AppLayout>
    )
}

export default Page