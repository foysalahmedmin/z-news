import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "পৃষ্ঠাটি পাওয়া যায়নি - Z-News" };

// 404 for unknown URLs. Kept free of the site header: whatever this imports
// ships with the root layout, i.e. on every page (auth and admin included).
// app/(primary)/not-found.tsx reuses it inside the public header/footer.
const NotFound = () => (
  <main className="container flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center gap-4 py-16 text-center">
    <p className="text-muted-foreground text-6xl font-bold">৪০৪</p>
    <h1 className="text-2xl font-bold md:text-3xl">পৃষ্ঠাটি পাওয়া যায়নি</h1>
    <p className="text-muted-foreground max-w-md">
      আপনি যে সংবাদ বা পৃষ্ঠাটি খুঁজছেন সেটি সরিয়ে ফেলা হয়েছে অথবা ঠিকানাটি
      ভুল।
    </p>
    <Link href="/">
      <Button asChild>প্রথম পাতায় ফিরুন</Button>
    </Link>
  </main>
);

export default NotFound;
