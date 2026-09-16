import { Button } from "@/components/ui/Button";
import { FormControl } from "@/components/ui/FormControl";
import useUser from "@/hooks/states/useUser";
import { googleSignIn, signIn } from "@/services/auth.service";
import type { SignInPayload } from "@/types/auth.type";
import type { CredentialResponse } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";

const SigninForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useUser();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInPayload>();

  const onSubmit = async (data: SignInPayload) => {
    try {
      const response = await signIn(data);
      if (response?.data?.token && response?.data?.info) {
        setUser({ ...response.data, is_authenticated: true });
        toast.success("Login successful!");
        navigate("/");
      }
    } catch (error) {
      const message = (error as any)?.response?.data?.message || "Login failed";
      toast.error(message);
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
            <div className="flex items-center">
              <label htmlFor="password">Password</label>
              <a
                href="#"
                className="ml-auto text-sm underline-offset-2 hover:underline"
              >
                Forgot your password?
              </a>
            </div>
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
            <Link to="/auth/signup" className="underline underline-offset-4">
              Signup
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SigninForm;
