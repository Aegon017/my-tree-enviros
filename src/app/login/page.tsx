'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js/mobile'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import useSWRMutation from 'swr/mutation'
import { z } from 'zod'
import { PhoneInput } from '@/components/phone-input'
import Section from '@/components/section'
import SectionTitle from '@/components/section-title'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { storage } from '@/lib/storage'

const LoginSchema = z.object( {
    mobile: z
        .string()
        .min( 1, 'Phone number is required' )
        .refine( ( value ) => isValidPhoneNumber( value ), {
            message: 'Please enter a valid phone number',
        } ),
} )

type LoginFormData = z.infer<typeof LoginSchema>

const authenticateUser = async ( url: string, { arg }: { arg: { mobile: string } } ) => {
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
        throw new Error( errorData.message || 'Authentication failed' )
    }

    return response.json()
}

const LoginPage = () => {
    const router = useRouter()
    const form = useForm<LoginFormData>( {
        resolver: zodResolver( LoginSchema ),
        defaultValues: {
            mobile: '',
        },
    } )

    const { trigger, isMutating } = useSWRMutation(
        `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/signin`,
        authenticateUser
    )

    const onSubmit = useCallback(
        async ( data: LoginFormData ) => {
            try {
                const phoneNumber = parsePhoneNumberFromString( data.mobile )
                if ( !phoneNumber ) {
                    toast.error( 'Invalid phone number format' )
                    return
                }

                const nationalNumber = phoneNumber.nationalNumber

                const result = await trigger( { mobile: nationalNumber } )

                if ( result.status === true ) {
                    const resetTime = Date.now() + 60000
                    storage.setResendTime( resetTime )

                    toast.success( result.message || 'Verification code sent successfully' )
                    router.push( `/verify-otp?mobile=${ encodeURIComponent( nationalNumber ) }` )
                } else {
                    toast.error( result.message || 'Failed to send verification code' )
                }
            } catch ( error ) {
                toast.error( error instanceof Error ? error.message : 'An unexpected error occurred' )
            }
        },
        [ trigger, router ]
    )

    return (
        <Section>
            <SectionTitle
                title="Sign In"
                subtitle="Enter your phone number to receive a verification code"
            />

            <div className="flex justify-center">
                <Form { ...form }>
                    <form
                        onSubmit={ form.handleSubmit( onSubmit ) }
                        className="w-full max-w-md space-y-6"
                    >
                        <FormField
                            control={ form.control }
                            name="mobile"
                            render={ ( { field } ) => (
                                <FormItem>
                                    <FormLabel>Mobile Number</FormLabel>
                                    <FormControl>
                                        <PhoneInput
                                            value={ field.value }
                                            onChange={ field.onChange }
                                            defaultCountry="IN"
                                            international
                                            placeholder="Enter your phone number"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        We'll send a verification code to this number
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            ) }
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={ isMutating }
                        >
                            { isMutating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending Code...
                                </>
                            ) : (
                                'Send Verification Code'
                            ) }
                        </Button>
                    </form>
                </Form>
            </div>
        </Section>
    )
}

export default LoginPage