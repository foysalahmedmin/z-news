import { Button } from "@/components/ui/Button";
import { FormControl } from "@/components/ui/FormControl";
import useUser from "@/hooks/states/useUser";
import { googleSignIn, signUp } from "@/services/auth.service";
import type { SignUpPayload } from "@/types/auth.type";
import type { CredentialResponse } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, Plus, User } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";

const SignupForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { setUser } = useUser();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpPayload & { confirmPassword: string }>();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (
    data: SignUpPayload & { confirmPassword: string },
  ) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        image: imageFile || null,
      };

      const response = await signUp(payload);
      if (response?.data?.token && response?.data?.info) {
        setUser({ ...response.data, is_authenticated: true });
        toast.success("Account created successfully!");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Signup failed");
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    try {
      if (credentialResponse.credential) {
        const response = await googleSignIn(credentialResponse.credential);
        if (response?.data?.token && response?.data?.info) {
          setUser({ ...response.data, is_authenticated: true });
          toast.success("Google Login successful!");
          navigate("/");
        }
      }
    } catch (error) {
      const message =
        (error as any)?.response?.data?.message || "Google Login failed";
      toast.error(message);
    }
  };

  return (
    <div>
      <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
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
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <span className="text-sm text-red-500">
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="grid gap-3">
            <label htmlFor="email">Email</label>
            <FormControl
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <span className="text-sm text-red-500">
                {errors.email.message}
              </span>
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
                {...register("password", { required: "Password is required" })}
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
              <span className="text-sm text-red-500">
                {errors.password.message}
              </span>
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
                {...register("confirmPassword", {
                  required: "Confirm password is required",
                })}
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
                {errors.confirmPassword.message}
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
            <Link to="/auth/signin" className="underline underline-offset-4">
              Signin
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;
