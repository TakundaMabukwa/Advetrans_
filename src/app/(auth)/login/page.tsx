"use client";

import React, { FormEvent, useState, useTransition } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { login } from "@/lib/action/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // const handleSubmit = (formData: FormData) => {
  //   setError(null);
  //   startTransition(async () => {
  //     try {
  //       await login(formData);
  //     } catch (err: any) {
  //       console.error(err);
  //     }
  //   });
  // };

  const handleSubmit = (formData: FormData) => {
    setError(null);
    setIsLoading(true);

    startTransition(async () => {
      try {
        const result = await login(formData);

        if (!result.success) {
          setError(result.message ?? "An unknown error occurred."); // ✅ Show error in UI
          setIsLoading(false);
          return;
        }

        // ✅ Redirect only on success
        router.push("/");
      } catch (err: any) {
        console.error("Unexpected error:", err);
        setError("Something went wrong. Please try again. " + err);
      } finally {
        setIsLoading(false);
      }
    });
  };

  return (
    // <>
    //   <CardHeader className="text-center">
    //     <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
    //     <p className="text-gray-600 mt-2">Sign in to your account</p>
    //   </CardHeader>

    //   <form action={handleSubmit}>
    //     <CardContent className="space-y-4">
    //       <div>
    //         <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
    //           Email address
    //         </label>
    //         <Input
    //           id="email"
    //           name="email"
    //           type="email"
    //           placeholder="Enter your email"
    //           required
    //           className="w-full"
    //           value={email}
    //           onChange={(e) => setEmail(e.target.value)}
    //         />
    //       </div>

    //       <div className="mb-4">
    //         <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
    //           Password
    //         </label>
    //         <Input
    //           id="password"
    //           name="password"
    //           type="password"
    //           placeholder="Enter your password"
    //           required
    //           className="w-full"
    //           value={password}
    //           onChange={(e) => setPassword(e.target.value)}
    //         />
    //       </div>

    //       {error && <p className="text-red-500 text-sm">{error}</p>}
    //     </CardContent>

    //     <CardFooter className="flex flex-col items-center">
    //       <Button
    //         type="submit"
    //         disabled={isPending}
    //         className={`w-full bg-blue-600 hover:bg-blue-700 ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
    //       >
    //         {isPending ? "Signing in..." : "Sign in"}
    //       </Button>
    //     </CardFooter>
    //   </form >
    // </>
    <>
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold text-[#1A245E]">
          Welcome Back
        </CardTitle>
        <p className="text-gray-600 text-sm">
          Sign in to access your EPS Dashboard
        </p>
      </CardHeader>

      <form action={handleSubmit}>
        <CardContent className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@adv.co.za"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-gray-300 focus:ring-2 focus:ring-[#1A245E] focus:border-[#1A245E] rounded-md"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-gray-300 focus:ring-2 focus:ring-[#1A245E] focus:border-[#1A245E] rounded-md"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            disabled={isPending}
            className={`w-full py-2 font-semibold text-white rounded-md transition-all duration-300 bg-blue-500 hover:opacity-90 ${
              isPending ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isPending ? "Signing in..." : "Sign in"}
          </Button>

          {/* <p className="text-sm text-gray-600 text-center">
            Forgot your password?{" "}
            <span className="text-[#C7322F] font-medium hover:underline cursor-pointer">
              Reset here
            </span>
          </p> */}
        </CardFooter>
      </form>
    </>
  );
}
