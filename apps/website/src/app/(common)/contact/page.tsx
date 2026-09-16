"use client";

import { Button } from "@/components/ui/Button";
import { FormControl } from "@/components/ui/FormControl";
import { submitContact } from "@/services/contact.service";
import type { TContactPayload } from "@/types/contact.type";
import React from "react";

const ContactPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [status, setStatus] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const payload: TContactPayload = {
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        message: String(formData.get("message") || "").trim(),
      };

      // Validation
      if (!payload.name || !payload.email || !payload.message) {
        setStatus({
          type: "error",
          message: "সব ঘর পূরণ করুন।",
        });
        setIsSubmitting(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payload.email)) {
        setStatus({
          type: "error",
          message: "সঠিক ইমেইল ঠিকানা দিন।",
        });
        setIsSubmitting(false);
        return;
      }

      // Submit to backend
      const response = await submitContact(payload);

      if (response.success) {
        (e.target as HTMLFormElement).reset();
        setStatus({
          type: "success",
          message: response.message || "বার্তা সফলভাবে পাঠানো হয়েছে!",
        });
      } else {
        throw new Error(response.message || "বার্তা পাঠাতে ব্যর্থ হয়েছে");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "বার্তা পাঠাতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।";
      setStatus({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="container mx-auto px-4 py-10 md:py-16">
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
        <div className="space-y-6">
          <header className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              যোগাযোগ
            </h1>
            <p className="text-muted-foreground">
              মতামত, পরামর্শ বা তথ্যের জন্য নিচের ফর্মটি পূরণ করুন।
            </p>
          </header>

          <div className="space-y-4">
            <p>
              ইমেইল:{" "}
              <a
                className="text-foreground hover:text-primary transition-colors"
                href="mailto:news@z-news.com"
              >
                news@z-news.com
              </a>
            </p>
            <p>
              মোবাইল:{" "}
              <a
                className="text-foreground hover:text-primary transition-colors"
                href="tel:+8801893044041"
              >
                +880 1893-044041
              </a>
            </p>
            <p className="text-muted-foreground text-sm">
              ঠিকানা:{" "}
              <a
                className="text-foreground hover:text-primary transition-colors"
                href="https://www.google.com/maps?q=ভিশন+২০২১+টাওয়ার,+সফটওয়্যার+টেকনোলজি+পার্ক,১০ম+তলা,+কারওয়ান+বাজার,+ঢাকা-১২১৫"
                target="_blank"
                rel="noopener noreferrer"
              >
                ভিশন ২০২১ টাওয়ার, সফটওয়্যার টেকনোলজি পার্ক, ১০ম তলা, কারওয়ান
                বাজার, ঢাকা-১২১৫
              </a>
            </p>
            <p>সময়: প্রতিদিন সকাল ৯টা — রাত ৯টা</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <FormControl.Label htmlFor="name">নাম</FormControl.Label>
            <FormControl
              id="name"
              name="name"
              placeholder="আপনার নাম"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <FormControl.Label htmlFor="email">ইমেইল</FormControl.Label>
            <FormControl
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <FormControl.Label htmlFor="message">বার্তা</FormControl.Label>
            <FormControl
              as="textarea"
              id="message"
              name="message"
              className="h-40 py-2"
              placeholder="আপনার বার্তা লিখুন"
              required
              disabled={isSubmitting}
            />
          </div>

          {status && (
            <div
              className={`text-sm ${
                status.type === "success"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {status.message}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            className="w-full md:w-auto"
          >
            পাঠান
          </Button>
        </form>
      </div>
    </section>
  );
};

export default ContactPage;
