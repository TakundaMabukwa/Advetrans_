'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import Hero_bg from '@/assets/motion_hero.jpg'
import Image from 'next/image'
import { useAuth } from '@/context/auth-context/context'
import { useToast } from '@/hooks/use-toast'

const SignInForm = () => {
  const { login } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      // router.push('/') // or dashboard
    } catch (err) {
      setError('Invalid email or password.')
      toast({
        title: 'Invalid email or password.',
        description: 'Please enter valid email and password.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen justify-center items-center space-y-7">
      <div className="flex flex-col space-y-2 text-center z-10">
        <h1 className="text-4xl font-bold text-white tracking-tight sm:text-5xl">
          Sign in to your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className=" z-10">
        <Card className="min-w-[500px]">
          <CardHeader>
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>
              Access the fleet management dashboard to manage your vehicles,
              drivers, and trips.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-sm text-blue-600 hover:underline"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </label>
            </div>
            {error && (
              <p className="text-sm text-red-600 font-medium">{error}</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <div className="text-center text-sm z-10 text-[#fafafa]">
        Don&apos;t have an account?{' '}
        <Link href="/sign-up" className="text-blue-600 hover:text-blue-800 ">
          Sign up
        </Link>
      </div>

      <Image
        alt="motion-live-bg"
        src={Hero_bg}
        placeholder="blur"
        quality={100}
        fill
        sizes="100vw"
        style={{
          objectFit: 'cover',
          zIndex: -1,
        }}
      />
      <div className="absolute top-0 right-0 h-full w-full bg-black/70 z-0"></div>
    </div>
  )
}

export default SignInForm
