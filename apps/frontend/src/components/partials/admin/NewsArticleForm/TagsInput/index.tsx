"use client";

import { Plus, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FormControl, FormControlLabel } from "@/components/ui/FormControl";
import type { NewsFormData } from "../schema";

// Ported from apps/adminpanel's
// news-articles-mutation-page/TagsInput/index.tsx.
type TagsInputProps = {
  name: "tags" | "seo.keywords";
  label: string;
  placeholder: string;
};

const TagsInput = ({ name, label, placeholder }: TagsInputProps) => {
  const { setValue, watch } = useFormContext<NewsFormData>();
  const [inputValue, setInputValue] = useState("");
  const tags = (watch(name as "tags") as string[]) || [];

  const addTag = () => {
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      setValue(name as "tags", [...tags, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue(
      name as "tags",
      tags.filter((tag) => tag !== tagToRemove),
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div>
      <FormControlLabel>{label}</FormControlLabel>
      <div className="mt-1 flex gap-2">
        <FormControl
          value={inputValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInputValue(e.target.value)
          }
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
        />
        <Button type="button" onClick={addTag}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Badge key={index} className="bg-muted-foreground/25 text-foreground">
            {tag}
            <X
              className="ml-1 h-3 w-3 cursor-pointer"
              onClick={() => removeTag(tag)}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default TagsInput;
