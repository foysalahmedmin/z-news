"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  FormControl,
  FormControlError,
  FormControlHelper,
  FormControlLabel,
} from "@/components/ui/FormControl";
import { getMyProfile, updateMyProfile } from "@/services/user-profile.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

// Edit-my-profile form for the `/user/profile` dashboard route. Avatar is
// intentionally not editable here (out of scope — see the Phase E plan).
const PROFILE_QUERY_KEY = ["my-profile"];

// Applied only via react-hook-form's `pattern` rule, which (per RHF's
// built-in validation) is skipped entirely for empty values — so these
// optional fields validate only once the user actually types something.
const URL_PATTERN = {
  value: /^https?:\/\/.+/i,
  message: "Must be a valid URL starting with http:// or https://",
};

type TProfileFormValues = {
  bio: string;
  location: string;
  website: string;
  social_links: {
    twitter: string;
    facebook: string;
    linkedin: string;
    instagram: string;
  };
};

const EMPTY_VALUES: TProfileFormValues = {
  bio: "",
  location: "",
  website: "",
  social_links: { twitter: "", facebook: "", linkedin: "", instagram: "" },
};

export default function UserProfilePage() {
  const queryClient = useQueryClient();

  const {
    data: profileResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: getMyProfile,
  });

  const profile = profileResponse?.data;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TProfileFormValues>({
    defaultValues: EMPTY_VALUES,
    // Reactively re-syncs the form whenever the query's data changes
    // (initial load, and again after a successful save + invalidate) —
    // RHF deep-compares before resetting, so this doesn't fight user input.
    values: profile
      ? {
          bio: profile.bio || "",
          location: profile.location || "",
          website: profile.website || "",
          social_links: {
            twitter: profile.social_links?.twitter || "",
            facebook: profile.social_links?.facebook || "",
            linkedin: profile.social_links?.linkedin || "",
            instagram: profile.social_links?.instagram || "",
          },
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (data) => {
      if (data?.success === false) {
        toast.error(data?.message || "Failed to update profile");
        return;
      }
      toast.success(data?.message || "Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  const onSubmit = (data: TProfileFormValues) => {
    mutation.mutate({
      bio: data.bio,
      location: data.location,
      website: data.website,
      social_links: {
        twitter: data.social_links.twitter,
        facebook: data.social_links.facebook,
        linkedin: data.social_links.linkedin,
        instagram: data.social_links.instagram,
      },
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-foreground text-2xl font-semibold">My Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Update your bio, location, and social links.
        </p>
      </header>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : isError ? (
            <p className="text-muted-foreground text-sm">
              Failed to load your profile. Please try again later.
            </p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <FormControlLabel>Bio</FormControlLabel>
                <FormControl
                  as="textarea"
                  className="h-auto min-h-24 py-2"
                  placeholder="Tell readers a bit about yourself"
                  {...register("bio")}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <FormControlLabel>Location</FormControlLabel>
                  <FormControl
                    type="text"
                    placeholder="City, Country"
                    {...register("location")}
                  />
                </div>
                <div>
                  <FormControlLabel>Website</FormControlLabel>
                  <FormControl
                    type="text"
                    placeholder="https://example.com"
                    {...register("website", { pattern: URL_PATTERN })}
                  />
                  {errors.website && (
                    <FormControlError>{errors.website.message}</FormControlError>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-foreground text-sm font-semibold">
                  Social Links
                </h3>
                <FormControlHelper className="mt-0">
                  Optional — shown on your public profile.
                </FormControlHelper>

                <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <FormControlLabel>Twitter</FormControlLabel>
                    <FormControl
                      type="text"
                      placeholder="https://twitter.com/username"
                      {...register("social_links.twitter", {
                        pattern: URL_PATTERN,
                      })}
                    />
                    {errors.social_links?.twitter && (
                      <FormControlError>
                        {errors.social_links.twitter.message}
                      </FormControlError>
                    )}
                  </div>
                  <div>
                    <FormControlLabel>Facebook</FormControlLabel>
                    <FormControl
                      type="text"
                      placeholder="https://facebook.com/username"
                      {...register("social_links.facebook", {
                        pattern: URL_PATTERN,
                      })}
                    />
                    {errors.social_links?.facebook && (
                      <FormControlError>
                        {errors.social_links.facebook.message}
                      </FormControlError>
                    )}
                  </div>
                  <div>
                    <FormControlLabel>LinkedIn</FormControlLabel>
                    <FormControl
                      type="text"
                      placeholder="https://linkedin.com/in/username"
                      {...register("social_links.linkedin", {
                        pattern: URL_PATTERN,
                      })}
                    />
                    {errors.social_links?.linkedin && (
                      <FormControlError>
                        {errors.social_links.linkedin.message}
                      </FormControlError>
                    )}
                  </div>
                  <div>
                    <FormControlLabel>Instagram</FormControlLabel>
                    <FormControl
                      type="text"
                      placeholder="https://instagram.com/username"
                      {...register("social_links.instagram", {
                        pattern: URL_PATTERN,
                      })}
                    />
                    {errors.social_links?.instagram && (
                      <FormControlError>
                        {errors.social_links.instagram.message}
                      </FormControlError>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
