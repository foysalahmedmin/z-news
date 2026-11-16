"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";

// Root error boundary (e.g. the API is down for a page that isn't cached yet).
const ErrorPage = ({ reset }: { reset: () => void }) => {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center gap-4 py-16 text-center">
      <h1 className="text-2xl font-bold md:text-3xl">কিছু একটা সমস্যা হয়েছে</h1>
      <p className="text-muted-foreground max-w-md">
        পৃষ্ঠাটি এই মুহূর্তে লোড করা যাচ্ছে না। একটু পরে আবার চেষ্টা করুন।
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>আবার চেষ্টা করুন</Button>
        <Link href="/">
          <Button asChild variant="outline">
            প্রথম পাতায় ফিরুন
          </Button>
        </Link>
      </div>
    </main>
  );
};

export default ErrorPage;
