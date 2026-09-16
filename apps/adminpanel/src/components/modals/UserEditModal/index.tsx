import { Button } from "@/components/ui/Button";
import { FormControl } from "@/components/ui/FormControl";
import { Modal } from "@/components/ui/Modal";
import { updateUser } from "@/services/user.service";
import type { ErrorResponse } from "@/types/response.type";
import type { TUser } from "@/types/user.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

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
      <Modal.Backdrop>
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>Edit User</Modal.Title>
            <Modal.Close />
          </Modal.Header>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Modal.Body className="grid gap-4">
              <div>
                <FormControl.Label>Name</FormControl.Label>
                <FormControl
                  type="text"
                  placeholder="User name"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <FormControl.Error>{errors.name.message}</FormControl.Error>
                )}
              </div>

              <div>
                <FormControl.Label>Email</FormControl.Label>
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
                  <FormControl.Error>{errors.email.message}</FormControl.Error>
                )}
              </div>

              <div>
                <FormControl.Label>Status</FormControl.Label>
                <FormControl
                  as="select"
                  className="border-input bg-card w-full rounded-md border px-3 py-2 text-sm"
                  {...register("status", { required: "Status is required" })}
                >
                  <option value="in-progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                </FormControl>
                {errors.status && (
                  <FormControl.Error>{errors.status.message}</FormControl.Error>
                )}
              </div>

              <div>
                <FormControl.Label>Role</FormControl.Label>
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
                  <FormControl.Error>{errors.role.message}</FormControl.Error>
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
            </Modal.Body>

            <Modal.Footer>
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
            </Modal.Footer>
          </form>
        </Modal.Content>
      </Modal.Backdrop>
    </Modal>
  );
};

export default UserEditModal;
