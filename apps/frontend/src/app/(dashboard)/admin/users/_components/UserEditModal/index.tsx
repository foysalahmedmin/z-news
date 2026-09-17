"use client";

import { Button } from "@/components/ui/Button";
import {
  FormControl,
  FormControlError,
  FormControlLabel,
} from "@/components/ui/FormControl";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseTrigger,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import { updateUser } from "@/services/admin-user.service";
import type { ErrorResponse } from "@/types/response.type";
import type { TUser } from "@/types/admin-user.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

// Ported from apps/adminpanel's `components/modals/UserEditModal`. Compound
// `Modal.X` / `FormControl.X` dot-notation swapped for the flat named
// exports used in apps/frontend's UI kit, and the CRUD service swapped from
// `user.service` (public, read-only in apps/frontend) to
// `admin-user.service` (authenticated admin CRUD) — same pattern as the
// already-ported EventEditModal.
type UserEditModalProps = {
  default: Partial<TUser>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  className?: string;
  mutationKey?: string[];
};

const UserEditModal: React.FC<UserEditModalProps> = ({
  isOpen,
  setIsOpen,
  default: user,
  mutationKey: key = ["users"],
}) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      status: user?.status || "in-progress",
      role: user?.role || "user",
      is_verified: user?.is_verified || false,
    },
  });

  React.useEffect(() => {
    reset({
      name: user?.name || "",
      email: user?.email || "",
      status: user?.status || "in-progress",
      role: user?.role || "user",
      is_verified: user?.is_verified || false,
    });
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof updateUser>[1]) =>
      updateUser(user._id!, data),
    onSuccess: (data) => {
      toast.success(data?.message || "User updated successfully!");
      queryClient.invalidateQueries({ queryKey: key || [] });
      setIsOpen(false);
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to update user");
      console.error("Update User Error:", error);
    },
  });

  const onSubmit = (data: any) => {
    const updatedFields = Object.entries(data).reduce<
      Partial<Parameters<typeof updateUser>[1]>
    >((acc, [key, value]) => {
      const fieldKey = key as keyof typeof data;

      // Compare with current user value
      if (value !== user[fieldKey as keyof TUser]) {
        (acc as any)[fieldKey] = value;
      }

      return acc;
    }, {});

    if (Object.keys(updatedFields).length === 0) {
      toast.info("No changes detected");
      return;
    }

    mutation.mutate(updatedFields);
  };

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <ModalBackdrop>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Edit User</ModalTitle>
            <ModalCloseTrigger />
          </ModalHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody className="grid gap-4">
              <div>
                <FormControlLabel>Name</FormControlLabel>
                <FormControl
                  type="text"
                  placeholder="User name"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <FormControlError>{errors.name.message}</FormControlError>
                )}
              </div>

              <div>
                <FormControlLabel>Email</FormControlLabel>
                <FormControl
                  type="email"
                  placeholder="user@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <FormControlError>{errors.email.message}</FormControlError>
                )}
              </div>

              <div>
                <FormControlLabel>Status</FormControlLabel>
                <FormControl
                  as="select"
                  className="border-input bg-card w-full rounded-md border px-3 py-2 text-sm"
                  {...register("status", { required: "Status is required" })}
                >
                  <option value="in-progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                </FormControl>
                {errors.status && (
                  <FormControlError>{errors.status.message}</FormControlError>
                )}
              </div>

              <div>
                <FormControlLabel>Role</FormControlLabel>
                <FormControl
                  as="select"
                  className="border-input bg-card w-full rounded-md border px-3 py-2 text-sm"
                  {...register("role", { required: "Role is required" })}
                >
                  <option value="user">User</option>
                  <option value="subscriber">Subscriber</option>
                  <option value="contributor">Contributor</option>
                  <option value="author">Author</option>
                  <option value="editor">Editor</option>
                </FormControl>
                {errors.role && (
                  <FormControlError>{errors.role.message}</FormControlError>
                )}
              </div>

              <div>
                <label className="inline-flex items-center gap-2">
                  <input
                    className="accent-accent size-5"
                    type="checkbox"
                    id="is_verified"
                    {...register("is_verified")}
                  />
                  <span className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Verified
                  </span>
                </label>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </ModalBackdrop>
    </Modal>
  );
};

export default UserEditModal;
