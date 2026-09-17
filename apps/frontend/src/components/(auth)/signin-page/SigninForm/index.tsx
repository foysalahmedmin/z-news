"use client";

import { Button } from "@/components/ui/Button";
import { FormControl } from "@/components/ui/FormControl";
import useUser from "@/hooks/states/useUser";
import { googleSignIn, signIn } from "@/services/auth.service";
import type { SignInPayload } from "@/types/auth.type";
import type { CredentialResponse } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import React, { useState } from "react";
import { toast } from "react-toastify";

type SigninFormErrors = Partial<Record<keyof SignInPayload, string>>;

// Only follow `redirect` when it is a same-origin relative path, to guard
// against open-redirect payloads such as `//evil.com` or `https://evil.com`.
const resolveRedirectTarget = (redirect: string | null): string => {
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    return redirect;
  }
  return "/";
};

const SigninForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SignInPayload>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<SigninFormErrors>({});

  const { setUser } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange =
    (field: keyof SignInPayload) => (e: ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const validate = () => {
    const nextErrors: SigninFormErrors = {};
    if (!formData.email) nextErrors.email = "Email is required";
    if (!formData.password) nextErrors.password = "Password is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goToDestination = () => {
    router.push(resolveRedirectTarget(searchParams.get("redirect")));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await signIn(formData);
      if (response?.data?.token && response?.data?.info) {
        setUser({ ...response.data, isAuthenticated: true });
        toast.success("Login successful!");
        goToDestination();
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || "Login failed";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    try {
      if (credentialResponse.credential) {
        const response = await googleSignIn(credentialResponse.credential);
        if (response?.data?.token && response?.data?.info) {
          setUser({ ...response.data, isAuthenticated: true });
          toast.success("Google Login successful!");
          goToDestination();
        }
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Google Login failed";
      toast.error(message);
    }
  };

  return (
    <div>
      <form className="p-6 md:p-8" onSubmit={onSubmit}>
        <div className="flex flex-col gap-6">
          {/* Title */}
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground text-balance">
              Sign in to your z-news account
            </p>
          </div>

          {/* Email */}
          <div className="grid gap-3">
            <label htmlFor="email">Email</label>
            <FormControl
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange("email")}
            />
            {errors.email && (
              <span className="text-sm text-red-500">{errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className="grid gap-3">
            <div className="flex items-center">
              <label htmlFor="password">Password</label>
              <Link
                href="/auth/forgot-password"
                className="ml-auto text-sm underline-offset-2 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
            <div className="relative">
              <FormControl
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange("password")}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <span className="text-sm text-red-500">{errors.password}</span>
            )}
          </div>

          {/* Remember me */}
          <div className="flex items-center gap-2">
            <input
              id="remember"
              type="checkbox"
              className="checkbox cursor-pointer"
              defaultChecked
            />
            <label htmlFor="remember" className="cursor-pointer text-sm">
              Remember me
            </label>
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background text-muted-foreground px-2">
                Or continue with Google
              </span>
            </div>
          </div>

          {/* Google Login */}
          <div className="flex justify-center pt-6 pb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                toast.error("Google Login Failed");
              }}
              useOneTap
              theme="outline"
              size="large"
              width="100%"
            />
          </div>

          {/* Signup link */}
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/sign-up"
              className="underline underline-offset-4"
            >
              Signup
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SigninForm;
