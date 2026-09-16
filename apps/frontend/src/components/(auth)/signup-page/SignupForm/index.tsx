"use client";

import { Button } from "@/components/ui/Button";
import { FormControl } from "@/components/ui/FormControl";
import useUser from "@/hooks/states/useUser";
import { googleSignIn, signUp } from "@/services/auth.service";
import type { SignUpPayload } from "@/types/auth.type";
import type { CredentialResponse } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, Plus, User } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import React, { useState } from "react";
import { toast } from "react-toastify";

type SignupFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type SignupFormErrors = Partial<Record<keyof SignupFormValues, string>>;

// Only follow `redirect` when it is a same-origin relative path, to guard
// against open-redirect payloads such as `//evil.com` or `https://evil.com`.
const resolveRedirectTarget = (redirect: string | null): string => {
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    return redirect;
  }
  return "/";
};

const SignupForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SignupFormValues>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<SignupFormErrors>({});

  const { setUser } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange =
    (field: keyof SignupFormValues) => (e: ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const nextErrors: SignupFormErrors = {};
    if (!formData.name) nextErrors.name = "Name is required";
    if (!formData.email) nextErrors.email = "Email is required";
    if (!formData.password) nextErrors.password = "Password is required";
    if (!formData.confirmPassword)
      nextErrors.confirmPassword = "Confirm password is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goToDestination = () => {
    router.push(resolveRedirectTarget(searchParams.get("redirect")));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: SignUpPayload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        image: imageFile || null,
      };

      const response = await signUp(payload);
      if (response?.data?.token && response?.data?.info) {
        setUser({ ...response.data, isAuthenticated: true });
        toast.success("Account created successfully!");
        goToDestination();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Signup failed");
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
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="text-muted-foreground text-balance">
              Sign up for your z-news account
            </p>
          </div>

          {/* Image Upload */}
          <div className="flex justify-center">
            <div className="relative">
              <input
                id="image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <label
                htmlFor="image"
                className="group bg-muted hover:border-accent relative flex size-24 cursor-pointer items-center justify-center rounded-full border border-dashed border-gray-300"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <User className="text-muted-foreground h-10 w-10" />
                )}
                <span className="bg-accent border-accent-foreground text-accent-foreground absolute right-0 bottom-0 flex h-6 w-6 items-center justify-center rounded-full">
                  <Plus className="h-4 w-4" />
                </span>
              </label>
            </div>
          </div>

          {/* Name */}
          <div className="grid gap-3">
            <label htmlFor="name">Name</label>
            <FormControl
              id="name"
              type="text"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange("name")}
            />
            {errors.name && (
              <span className="text-sm text-red-500">{errors.name}</span>
            )}
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
            <label htmlFor="password">Password</label>
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

          {/* Confirm Password */}
          <div className="grid gap-3">
            <label htmlFor="confirm-password">Confirm Password</label>
            <div className="relative">
              <FormControl
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange("confirmPassword")}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="text-sm text-red-500">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Sign Up"}
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

          {/* Signin link */}
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/auth/sign-in"
              className="underline underline-offset-4"
            >
              Signin
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;
