'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js/mobile'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import useSWRMutation from 'swr/mutation'
import { z } from 'zod'
import { PhoneInput } from '@/components/phone-input'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { storage } from '@/lib/storage'

const FormSchema = z.object({
  mobile: z
    .string()
    .min(1, 'Phone number is required')
    .refine((value) => isValidPhoneNumber(value), {
      message: 'Please enter a valid phone number',
    }),
})

type FormData = z.infer<typeof FormSchema>

const authenticateUser = async (url: string, { arg }: { arg: { mobile: string } }) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(arg),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Authentication failed')
  }

  return response.json()
}

const Page = () => {
  const router = useRouter()
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      mobile: '',
    },
  })

  const { trigger, isMutating } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/signin`,
    authenticateUser
  )

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        const phoneNumber = parsePhoneNumberFromString(data.mobile)
        if (!phoneNumber) {
          toast.error('Invalid phone number format')
          return
        }

        const nationalNumber = phoneNumber.nationalNumber

        const result = await trigger({ mobile: nationalNumber })

        if (result.status === true) {
          const resetTime = Date.now() + 60000
          storage.setResendTime(resetTime)

          toast.success(result.message || 'Verification code sent successfully')
          router.push(`/verify-otp?mobile=${encodeURIComponent(nationalNumber)}`)
        } else {
          toast.error(result.message || 'Failed to send verification code')
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'An unexpected error occurred')
      }
    },
    [trigger, router]
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your phone number to receive a verification code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <PhoneInput
                        value={field.value}
                        onChange={field.onChange}
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
                )}
              />

              <Button type="submit" className="w-full" disabled={isMutating} size="lg">
                {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isMutating ? 'Sending Code...' : 'Send Verification Code'}
              </Button>
              
              <p className="text-sm text-center text-muted-foreground">
                Don't have an account?{' '}
                <Link
                  href="/sign-up"
                  className="text-primary font-medium hover:underline"
                >
                  Sign up here
                </Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Page