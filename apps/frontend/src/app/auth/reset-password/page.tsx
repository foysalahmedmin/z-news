"use client";

import { Button } from "@/components/ui/Button";
import { FormControl } from "@/components/ui/FormControl";
import { resetPassword } from "@/services/auth.service";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

// Reads the reset token from the URL. Wrapped in <Suspense> below because
// Next.js requires useSearchParams() to be inside a Suspense boundary for
// static-generation compatibility (the same pattern this codebase already
// uses at the auth-section level in src/app/auth/layout.tsx).
const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>();

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      toast.error("This reset link is missing or invalid.");
      return;
    }

    try {
      await resetPassword({ password: data.password }, token);
      toast.success("Password reset successfully! Please sign in.");
      router.push("/auth/sign-in");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to reset password";
      toast.error(message);
    }
  };

  return (
    <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-6">
        {/* Title */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl font-bold">Reset your password</h1>
          <p className="text-muted-foreground text-balance">
            Enter a new password for your account
          </p>
        </div>

        {!token && (
          <span className="text-center text-sm text-red-500">
            This reset link is missing or invalid. Please request a new one.
          </span>
        )}

        {/* Password */}
        <div className="grid gap-3">
          <label htmlFor="password">New password</label>
          <div className="relative">
            <FormControl
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              className="pr-10"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "At least 8 characters" },
              })}
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
            <span className="text-sm text-red-500">
              {errors.password.message}
            </span>
          )}
        </div>

        {/* Confirm Password */}
        <div className="grid gap-3">
          <label htmlFor="confirmPassword">Confirm password</label>
          <FormControl
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm new password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === watch("password") || "Passwords do not match",
            })}
          />
          {errors.confirmPassword && (
            <span className="text-sm text-red-500">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || !token}
        >
          {isSubmitting ? "Resetting..." : "Reset password"}
        </Button>

        {/* Back to sign in */}
        <div className="text-center text-sm">
          <Link href="/auth/sign-in" className="underline underline-offset-4">
            Back to sign in
          </Link>
        </div>
      </div>
    </form>
  );
};

const ResetPasswordPage = () => {
  return (
    <main className="max-h-screen max-w-screen overflow-x-hidden">
      <section className="flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-3xl space-y-4">
          <div className="bg-card text-card-foreground grid grid-cols-1 gap-4 rounded-md px-4 py-8 shadow lg:gap-6 lg:px-6">
            <div>
              <Suspense fallback={null}>
                <ResetPasswordForm />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ResetPasswordPage;
