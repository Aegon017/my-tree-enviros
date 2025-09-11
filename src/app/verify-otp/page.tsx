'use client'

import { useCallback, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import useSWRMutation from 'swr/mutation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import Section from '@/components/section'
import SectionTitle from '@/components/section-title'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { storage } from '@/lib/storage'

const OtpSchema = z.object( {
    otp: z
        .string()
        .min( 6, 'OTP must be 6 digits' )
        .max( 6, 'OTP must be 6 digits' )
        .regex( /^\d+$/, 'OTP must contain only numbers' ),
} )

type OtpFormData = z.infer<typeof OtpSchema>

const verifyOtp = async ( url: string, { arg }: { arg: { mobile: string; otp: string } } ) => {
    const response = await fetch( url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify( arg ),
    } )

    if ( !response.ok ) {
        const errorData = await response.json()
        throw new Error( errorData.message || 'OTP verification failed' )
    }

    return response.json()
}

const VerifyOtpPage = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const mobile = searchParams.get( 'mobile' )
    const [ isResending, setIsResending ] = useState( false )
    const [ resendTimer, setResendTimer ] = useState( 0 )
    const [ canResend, setCanResend ] = useState( true )

    useEffect( () => {
        const savedTime = storage.getResendTime()
        if ( savedTime ) {
            const timeLeft = Math.max( 0, Math.ceil( ( savedTime - Date.now() ) / 1000 ) )
            setResendTimer( timeLeft )
            setCanResend( timeLeft === 0 )
        }
    }, [] )

    useEffect( () => {
        let timer: NodeJS.Timeout
        if ( resendTimer > 0 ) {
            timer = setTimeout( () => setResendTimer( resendTimer - 1 ), 1000 )
        } else if ( resendTimer === 0 && !canResend ) {
            setCanResend( true )
            storage.clearResendTime()
        }
        return () => clearTimeout( timer )
    }, [ resendTimer, canResend ] )

    const form = useForm<OtpFormData>( {
        resolver: zodResolver( OtpSchema ),
        defaultValues: {
            otp: '',
        },
    } )

    const { trigger, isMutating } = useSWRMutation(
        `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/verify-otp`,
        verifyOtp
    )

    const onSubmit = useCallback(
        async ( data: OtpFormData ) => {
            if ( !mobile ) {
                toast.error( 'Mobile number is missing' )
                return
            }

            try {
                const result = await trigger( { mobile, otp: data.otp } )

                if ( result.token ) {
                    storage.setToken( result.token )
                    storage.clearResendTime()
                    toast.success( result.message || 'OTP verified successfully' )
                    router.push( '/' )
                } else {
                    toast.error( 'Authentication token not received' )
                }
            } catch ( error ) {
                toast.error( error instanceof Error ? error.message : 'An unexpected error occurred' )
            }
        },
        [ trigger, mobile, router ]
    )

    const handleResendOtp = useCallback( async () => {
        if ( !mobile || !canResend ) return

        setIsResending( true )

        try {
            const response = await fetch( `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/resend-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify( { mobile } ),
            } )

            if ( !response.ok ) {
                const errorData = await response.json()
                throw new Error( errorData.message || 'Failed to resend OTP' )
            }

            const result = await response.json()
            const resetTime = Date.now() + 60000
            storage.setResendTime( resetTime )
            setResendTimer( 60 )
            setCanResend( false )
            toast.success( result.message || 'OTP resent successfully' )
        } catch ( error ) {
            toast.error( error instanceof Error ? error.message : 'Failed to resend OTP' )
        } finally {
            setIsResending( false )
        }
    }, [ mobile, canResend ] )

    if ( !mobile ) {
        return (
            <Section>
                <SectionTitle
                    title="Verify OTP"
                    subtitle="Mobile number is missing. Please try again."
                />
                <div className="flex justify-center mt-6">
                    <Button onClick={ () => router.push( '/login' ) }>
                        Back to Login
                    </Button>
                </div>
            </Section>
        )
    }

    return (
        <Section>
            <SectionTitle
                title="Verify OTP"
                subtitle={ `Enter the 6-digit code sent to ${ mobile }` }
            />

            <div className="flex justify-center">
                <Form { ...form }>
                    <form
                        onSubmit={ form.handleSubmit( onSubmit ) }
                        className="w-full max-w-md space-y-6"
                    >
                        <FormField
                            control={ form.control }
                            name="otp"
                            render={ ( { field } ) => (
                                <FormItem>
                                    <FormLabel>Verification Code</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                { ...field }
                                                placeholder="Enter 6-digit code"
                                                maxLength={ 6 }
                                                className="text-center text-xl tracking-widest font-medium pr-10"
                                                onChange={ ( e ) => {
                                                    const value = e.target.value.replace( /\D/g, '' )
                                                    field.onChange( value )
                                                } }
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            ) }
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={ isMutating }
                            size="lg"
                        >
                            { isMutating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Verify Code'
                            ) }
                        </Button>

                        <div className="text-center text-sm text-muted-foreground pt-4">
                            Didn't receive the code?{ ' ' }
                            <button
                                type="button"
                                onClick={ handleResendOtp }
                                disabled={ !canResend || isResending }
                                className="text-primary hover:underline focus:outline-none font-medium disabled:opacity-50"
                            >
                                { isResending ? 'Resending...' :
                                    canResend ? 'Resend OTP' :
                                        `Resend in ${ resendTimer }s` }
                            </button>
                        </div>
                    </form>
                </Form>
            </div>
        </Section>
    )
}

export default VerifyOtpPage