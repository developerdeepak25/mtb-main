"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAxiosErrorMessage } from "@/utils/ax";
import { SigninFormType, signinSchema } from "@/schema/zodSchema";
import { signIn } from "next-auth/react";

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormType>({
    resolver: zodResolver(signinSchema),
  });
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  // Show a toast or error message when the page loads if there's a specific error
  useEffect(() => {
    console.log(error); //?dev
    if (error === "account-exists-with-credentials") {
      console.log("here");
      setTimeout(() => {
        toast.error(
          "An account with this email already exists. Please sign in with your password."
        );
        router.push("/signin");
      }, 100);
    } else if (error) {
      setTimeout(() => {
        toast.error(error);
      }, 100);
    }
  }, [error,router]);

  const onSubmit = async (data: SigninFormType) => {
    console.log("siginin form data", data);
    setIsLoading(true);
    try {
      // const res = await axios.post("/api/auth/signin", data);
      const res = await signIn("credentials", {
        // callbackUrl: "/dashboard",
        redirect: false,
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });
      console.log("res", res); //?dev
      if (res?.ok) {
        router.push("/dashboard");
        toast.success("Signed in successfully");
        return;
      }
      if (res?.error) {
        console.log("error", res.error);
        toast.error(res.error ?? "Sign in failed. Please try again later.");
      }
    } catch (error) {
      console.error("Signin error:", error);
      toast.error(
        getAxiosErrorMessage(error, "Sign in failed. Please try again later.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: false,
      });
      console.log(result);
      if (result?.error) {
        console.log("error", result.error);
        toast.error("Google Sign failed. Please try again later.");
      }
    } catch (error) {
      console.error("Error signing in", error); //?dev
      toast.error(
        getAxiosErrorMessage(
          error,
          "Google Sign failed. Please try again later."
        )
      );
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Email"
            {...register("email")}
            className={`h-12 ${errors.email ? "border-red-500" : ""}`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Input
            type="password"
            placeholder="Password"
            {...register("password")}
            className={`h-12 ${errors.password ? "border-red-500" : ""}`}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded border-gray-300"
              {...register("rememberMe")}
            />
            <span>Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-[#1E2875] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-[16px]"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">or</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full h-12 text-[16px] flex items-center justify-center space-x-2"
        onClick={handleGoogleLogin}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span>Sign in with Google</span>
      </Button>

      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-[#1E2875] hover:underline font-medium"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
