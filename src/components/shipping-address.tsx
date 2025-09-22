'use client';

import { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Plus, Edit, Trash2, MapPin, CheckCircle2 } from 'lucide-react';
import { ShippingAddress } from '@/types/shipping-address';
import { toast } from 'sonner';
import { storage } from '@/lib/storage';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import RazorpayButton from './razorpay-button';

const formSchema = z.object( {
    name: z.string().min( 2, { message: 'Name must be at least 2 characters.' } ),
    address: z.string().min( 5, { message: 'Address must be at least 5 characters.' } ),
    city: z.string().min( 2, { message: 'City must be at least 2 characters.' } ),
    area: z.string().min( 2, { message: 'Area must be at least 2 characters.' } ),
    pincode: z.string().regex( /^\d{5,6}$/, { message: 'Pincode must be 5-6 digits.' } ),
    mobile_number: z.string().regex( /^\d{10}$/, { message: 'Mobile number must be 10 digits.' } ),
    default: z.boolean().default( false ),
} );

type FormValues = z.infer<typeof formSchema>;

interface ShippingAddressesProps {
    onSelect?: ( shipping_address_id: number | null ) => void;
    selectedAddressId?: number | null;
}

const fetcher = ( url: string ) =>
    fetch( url, {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${ storage.getToken() }`,
        },
    } ).then( res => res.json() );

export default function ShippingAddresses( { onSelect, selectedAddressId: externalSelectedId }: ShippingAddressesProps ) {
    const [ isDialogOpen, setIsDialogOpen ] = useState( false );
    const [ editingAddress, setEditingAddress ] = useState<ShippingAddress | null>( null );
    const [ isSubmitting, setIsSubmitting ] = useState( false );
    const [ internalSelectedId, setInternalSelectedId ] = useState<number | null>( null );
    const [ deleteId, setDeleteId ] = useState<number | null>( null );

    const selectedAddressId = externalSelectedId !== undefined ? externalSelectedId : internalSelectedId;

    const { data, error, isLoading } = useSWR<{
        status: boolean;
        message: string;
        data: ShippingAddress[]
    }>( `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/shipping-addresses`, fetcher );

    const form = useForm<FormValues>( {
        resolver: zodResolver( formSchema ),
        defaultValues: {
            name: '',
            address: '',
            city: '',
            area: '',
            pincode: '',
            mobile_number: '',
            default: false,
        },
    } );

    useEffect( () => {
        if ( data?.data ) {
            const defaultAddress = data.data.find( addr => addr.default === 1 );
            if ( defaultAddress && selectedAddressId === null ) {
                const newSelectedId = defaultAddress.id;
                setInternalSelectedId( newSelectedId );
                onSelect && onSelect( newSelectedId );
            }
        }
    }, [ data, onSelect, selectedAddressId ] );

    const resetForm = () => {
        form.reset();
        setEditingAddress( null );
    };

    const handleEdit = ( address: ShippingAddress ) => {
        setEditingAddress( address );
        form.reset( {
            name: address.name,
            address: address.address,
            city: address.city,
            area: address.area,
            pincode: address.pincode,
            mobile_number: address.mobile_number,
            default: address.default === 1,
        } );
        setIsDialogOpen( true );
    };

    const handleDelete = async ( id: number ) => {
        try {
            const response = await fetch( `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/shipping-address/${ id }`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${ storage.getToken() }`,
                },
            } );

            if ( response.ok ) {
                toast.success( 'Address deleted successfully.' );
                mutate( `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/shipping-addresses` );
                if ( selectedAddressId === id ) {
                    const newSelectedId = null;
                    setInternalSelectedId( newSelectedId );
                    onSelect && onSelect( newSelectedId );
                }
            } else {
                throw new Error( 'Failed to delete address' );
            }
        } catch ( error ) {
            toast.error( 'Failed to delete address.' );
        } finally {
            setDeleteId( null );
        }
    };

    const handleSelectAddress = ( id: number ) => {
        setInternalSelectedId( id );
        onSelect && onSelect( id );
    };

    const onSubmit = async ( values: FormValues ) => {
        setIsSubmitting( true );
        try {
            const url = editingAddress
                ? `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/shipping-address/${ editingAddress.id }`
                : `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/shipping-address`;

            const method = editingAddress ? 'PUT' : 'POST';

            const response = await fetch( url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${ storage.getToken() }`,
                },
                body: JSON.stringify( values ),
            } );

            const result = await response.json();

            if ( response.ok ) {
                toast.success( editingAddress ? 'Address updated successfully.' : 'Address added successfully.' );
                setIsDialogOpen( false );
                resetForm();
                mutate( `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/shipping-addresses` );
            } else {
                throw new Error( result.message || 'Operation failed' );
            }
        } catch ( error ) {
            toast.error( 'Something went wrong. Please try again.' );
        } finally {
            setIsSubmitting( false );
        }
    };

    if ( isLoading ) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if ( error ) {
        return (
            <div className="text-center py-12">
                <p className="text-destructive">Failed to load addresses. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Shipping Addresses</h1>
                <Dialog open={ isDialogOpen } onOpenChange={ ( open ) => {
                    setIsDialogOpen( open );
                    if ( !open ) resetForm();
                } }>
                    <Button onClick={ () => setIsDialogOpen( true ) }>
                        <Plus className="mr-2 h-4 w-4" /> Add New Address
                    </Button>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>
                                { editingAddress ? 'Edit Address' : 'Add New Address' }
                            </DialogTitle>
                            <DialogDescription>
                                { editingAddress
                                    ? 'Update your shipping address details.'
                                    : 'Add a new shipping address for delivery.'
                                }
                            </DialogDescription>
                        </DialogHeader>

                        <Form { ...form }>
                            <form onSubmit={ form.handleSubmit( onSubmit ) } className="space-y-4">
                                <FormField
                                    control={ form.control }
                                    name="name"
                                    render={ ( { field } ) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter your full name" { ...field } />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    ) }
                                />

                                <FormField
                                    control={ form.control }
                                    name="address"
                                    render={ ( { field } ) => (
                                        <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter your street address" { ...field } />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    ) }
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={ form.control }
                                        name="city"
                                        render={ ( { field } ) => (
                                            <FormItem>
                                                <FormLabel>City</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="City" { ...field } />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        ) }
                                    />

                                    <FormField
                                        control={ form.control }
                                        name="area"
                                        render={ ( { field } ) => (
                                            <FormItem>
                                                <FormLabel>Area/State</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Area or State" { ...field } />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        ) }
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={ form.control }
                                        name="pincode"
                                        render={ ( { field } ) => (
                                            <FormItem>
                                                <FormLabel>Pincode</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Pincode" { ...field } />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        ) }
                                    />

                                    <FormField
                                        control={ form.control }
                                        name="mobile_number"
                                        render={ ( { field } ) => (
                                            <FormItem>
                                                <FormLabel>Mobile Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="10-digit mobile number" { ...field } />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        ) }
                                    />
                                </div>

                                <FormField
                                    control={ form.control }
                                    name="default"
                                    render={ ( { field } ) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox
                                                    checked={ field.value }
                                                    onCheckedChange={ field.onChange }
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Set as default address</FormLabel>
                                                <FormDescription>
                                                    This will be your primary shipping address for orders.
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    ) }
                                />

                                <div className="flex justify-end space-x-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={ () => {
                                            setIsDialogOpen( false );
                                            resetForm();
                                        } }
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={ isSubmitting }>
                                        { isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" /> }
                                        { editingAddress ? 'Update Address' : 'Add Address' }
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            { data?.data && data.data.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-1">
                    { data.data.map( ( address ) => (
                        <Card
                            key={ address.id }
                            className={ `cursor-pointer transition-all ${ selectedAddressId === address.id ? 'border-primary border-2' : 'hover:border-primary/50' }` }
                            onClick={ () => handleSelectAddress( address.id ) }
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    { address.name }
                                    { selectedAddressId === address.id && (
                                        <CheckCircle2 className="h-5 w-5 text-primary" />
                                    ) }
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    { address.default === 1 && (
                                        <span className="inline-flex items-center rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                                            Default
                                        </span>
                                    ) }
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-start space-x-2 text-sm mb-4">
                                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    <div>
                                        <p>{ address.address }</p>
                                        <p>
                                            { address.city }, { address.area } { address.pincode }
                                        </p>
                                        <p>{ address.mobile_number }</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={ ( e ) => {
                                            e.stopPropagation();
                                            handleEdit( address );
                                        } }
                                    >
                                        <Edit className="h-4 w-4 mr-1" /> Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={ ( e ) => {
                                            e.stopPropagation();
                                            setDeleteId( address.id );
                                        } }
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) ) }
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>No shipping addresses</CardTitle>
                        <CardDescription>
                            You haven't added any shipping addresses yet.
                        </CardDescription>
                    </CardHeader>
                </Card>
            ) }

            <AlertDialog open={ !!deleteId } onOpenChange={ () => setDeleteId( null ) }>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this address.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={ () => deleteId && handleDelete( deleteId ) }>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}