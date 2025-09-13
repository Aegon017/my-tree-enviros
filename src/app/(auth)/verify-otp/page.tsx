'use client'

import { useCallback, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import useSWRMutation from 'swr/mutation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const OtpSchema = z.object({
  otp: z
    .string()
    .min(6, 'OTP must be 6 digits')
    .max(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
})

type OtpFormData = z.infer<typeof OtpSchema>

const verifyOtp = async (url: string, { arg }: { arg: { mobile: string; otp: string } }) => {
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
    throw new Error(errorData.message || 'OTP verification failed')
  }

  return response.json()
}

const VerifyOtpPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mobile = searchParams.get('mobile')
  const [isResending, setIsResending] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  useEffect(() => {
    const savedTime = storage.getResendTime()
    if (savedTime) {
      const timeLeft = Math.max(0, Math.ceil((savedTime - Date.now()) / 1000))
      setResendTimer(timeLeft)
    }
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [resendTimer])

  const form = useForm<OtpFormData>({
    resolver: zodResolver(OtpSchema),
    defaultValues: {
      otp: '',
    },
  })

  const { trigger, isMutating } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/verify-otp`,
    verifyOtp
  )

  const onSubmit = useCallback(
    async (data: OtpFormData) => {
      if (!mobile) {
        toast.error('Mobile number is missing')
        return
      }

      try {
        const result = await trigger({ mobile, otp: data.otp })
        storage.setToken(result.data)
        storage.clearResendTime()
        toast.success('OTP verified successfully')
        router.push('/')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'An unexpected error occurred')
      }
    },
    [trigger, mobile, router]
  )

  const handleResendOtp = useCallback(async () => {
    if (!mobile || resendTimer > 0) return

    setIsResending(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ mobile }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to resend OTP')
      }

      const resetTime = Date.now() + 60000
      storage.setResendTime(resetTime)
      setResendTimer(60)
      toast.success('OTP resent successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to resend OTP')
    } finally {
      setIsResending(false)
    }
  }, [mobile, resendTimer])

  if (!mobile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Verify OTP</CardTitle>
            <CardDescription>Mobile number is missing. Please try again.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/sign-in')} className="w-full">
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="bg-background py-16">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Verify OTP</CardTitle>
          <CardDescription>
            Enter the verification code sent to {mobile}
          </CardDescription>
          <Button
            variant="link"
            size="sm"
            onClick={() => router.back()}
            className="w-fit h-auto p-0 text-primary"
          >
            Edit mobile number
          </Button>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <div className="flex justify-center">
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </FormControl>
                    <FormDescription className="text-center">
                      Please enter the 6-digit code sent to your phone
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isMutating} className="w-full" size="lg">
                {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isMutating ? 'Verifying...' : 'Verify Code'}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || isResending}
                  className="text-primary hover:underline font-medium disabled:opacity-50"
                >
                  {isResending ? 'Resending...' : resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default VerifyOtpPage