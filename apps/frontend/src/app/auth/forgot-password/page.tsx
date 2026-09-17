"use client";

import { Button } from "@/components/ui/Button";
import { FormControl } from "@/components/ui/FormControl";
import { forgetPassword } from "@/services/auth.service";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

type ForgotPasswordFormValues = {
  email: string;
};

const ForgotPasswordPage = () => {
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>();

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      await forgetPassword({ email: data.email });
      // Don't reveal whether the email exists — the backend already returns
      // the same success response either way.
      setIsSent(true);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to send reset link";
      toast.error(message);
    }
  };

  return (
    <main className="max-h-screen max-w-screen overflow-x-hidden">
      <section className="flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-3xl space-y-4">
          <div className="bg-card text-card-foreground grid grid-cols-1 gap-4 rounded-md px-4 py-8 shadow lg:gap-6 lg:px-6">
            <div>
              {isSent ? (
                <div className="p-6 md:p-8">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center text-center">
                      <h1 className="text-2xl font-bold">Check your email</h1>
                      <p className="text-muted-foreground text-balance">
                        If an account exists for that email, we&apos;ve sent a
                        link to reset your password.
                      </p>
                    </div>

                    <div className="text-center text-sm">
                      <Link
                        href="/auth/sign-in"
                        className="underline underline-offset-4"
                      >
                        Back to sign in
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <form
                  className="p-6 md:p-8"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <div className="flex flex-col gap-6">
                    {/* Title */}
                    <div className="flex flex-col items-center text-center">
                      <h1 className="text-2xl font-bold">
                        Forgot your password?
                      </h1>
                      <p className="text-muted-foreground text-balance">
                        Enter your email and we&apos;ll send you a reset link
                      </p>
                    </div>

                    {/* Email */}
                    <div className="grid gap-3">
                      <label htmlFor="email">Email</label>
                      <FormControl
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Enter a valid email",
                          },
                        })}
                      />
                      {errors.email && (
                        <span className="text-sm text-red-500">
                          {errors.email.message}
                        </span>
                      )}
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send reset link"}
                    </Button>

                    {/* Back to sign in */}
                    <div className="text-center text-sm">
                      <Link
                        href="/auth/sign-in"
                        className="underline underline-offset-4"
                      >
                        Back to sign in
                      </Link>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ForgotPasswordPage;
