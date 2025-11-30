'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
// import Contact_bg from '@/assets/contact.jpg'
import Image from 'next/image'

const NotFound = () => {
  return (
    <div className="relative flex flex-col h-screen justify-center items-center space-y-7">
      <div className="flex flex-col space-y-2 text-center z-10">
        <h1 className="text-4xl font-bold text-white tracking-tight sm:text-5xl">
          Page Not Found
        </h1>
        <p className="text-sm text-muted-foreground">
          The page you're looking for doesn't exist
        </p>
      </div>

      <div className="z-10">
        <Card className="min-w-[500px]">
          <CardHeader>
            <CardTitle className="text-xl">404 - Not Found</CardTitle>
            <CardDescription>
              The cost centres page you're looking for could not be found. It
              may have been moved, deleted, or you entered the wrong URL.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please check the URL and try again, or navigate back to the
              dashboard.
            </p>
          </CardContent>
          <CardContent className="flex justify-center">
            <Button asChild className="w-full">
              <Link href="/">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* <Image
        alt="contact-bg"
        src={Contact_bg}
        placeholder="blur"
        quality={100}
        fill
        sizes="100vw"
        style={{
          objectFit: 'cover',
          zIndex: -1,
        }}
      /> */}
      <div className="absolute top-0 right-0 h-full w-full bg-black/70 z-0"></div>
    </div>
  )
}

export default NotFound
