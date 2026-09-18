"use client";

import { Button } from "@/components/ui/Button";
import {
  FormControl,
  FormControlHelper,
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
import { createReadingList } from "@/services/bookmark.service";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import type React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

// Reduced-field-count sibling of
// apps/frontend/src/app/(dashboard)/admin/categories/_components/CategoryAddModal:
// same Modal/FormControl + react-hook-form + useMutation/toast/invalidateQueries
// shape, just three fields (name/description/is_public) instead of
// category's full set, and always a create — reading lists have no
// separate "edit" modal, editing happens inline on the detail page.
type TReadingListCreatePayload = Parameters<typeof createReadingList>[0];

type ReadingListAddModalProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  mutationKey?: string[];
};

const ReadingListAddModal: React.FC<ReadingListAddModalProps> = ({
  isOpen,
  setIsOpen,
  mutationKey: key = ["my-reading-lists"],
}) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TReadingListCreatePayload>({
    defaultValues: {
      name: "",
      description: "",
      is_public: false,
    },
  });

  const mutation = useMutation({
    mutationFn: createReadingList,
    onSuccess: (data) => {
      if (data?.success === false) {
        toast.error(data?.message || "Failed to create reading list");
        return;
      }
      toast.success(data?.message || "Reading list created successfully!");
      queryClient.invalidateQueries({ queryKey: key });
      reset();
      setIsOpen(false);
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(
        error.response?.data?.message || "Failed to create reading list",
      );
      console.error("Create Reading List Error:", error);
    },
  });

  const onSubmit = (data: TReadingListCreatePayload) => {
    mutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <ModalBackdrop>
        <ModalContent size="sm">
          <ModalHeader>
            <ModalTitle>Create Reading List</ModalTitle>
            <ModalCloseTrigger />
          </ModalHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody className="grid gap-4">
              {/* Name */}
              <div>
                <FormControlLabel>Name</FormControlLabel>
                <FormControl
                  type="text"
                  placeholder="e.g. Weekend Reads"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Description (Optional) */}
              <div>
                <FormControlLabel>Description (Optional)</FormControlLabel>
                <FormControl
                  as="textarea"
                  className="h-auto min-h-20 py-2"
                  placeholder="What's this list about?"
                  {...register("description")}
                />
              </div>

              {/* Public */}
              <div>
                <label className="inline-flex items-center gap-2">
                  <input
                    className="accent-accent size-5"
                    type="checkbox"
                    id="is_public"
                    {...register("is_public")}
                  />
                  <span className="text-sm leading-none font-medium">
                    Make this list public
                  </span>
                </label>
                <FormControlHelper>
                  Public lists can be viewed and followed by other users.
                </FormControlHelper>
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
                Create
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </ModalBackdrop>
    </Modal>
  );
};

export default ReadingListAddModal;
