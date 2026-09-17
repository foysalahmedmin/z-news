"use client";

import { Button } from "@/components/ui/Button";
import { emailVerification } from "@/services/auth.service";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Status = "verifying" | "success" | "error";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<Status>(() =>
    token ? "verifying" : "error",
  );

  useEffect(() => {
    if (!token) return;

    emailVerification(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <main className="max-h-screen max-w-screen overflow-x-hidden">
      <section className="flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-3xl space-y-4">
          <div className="bg-card text-card-foreground grid grid-cols-1 gap-4 rounded-md px-4 py-8 shadow lg:gap-6 lg:px-6">
            <div className="p-6 md:p-8">
              <div className="flex flex-col items-center gap-3 text-center">
                {status === "verifying" && (
                  <p className="text-muted-foreground text-balance">
                    Verifying your email...
                  </p>
                )}
                {status === "success" && (
                  <>
                    <h1 className="text-2xl font-bold">Email verified!</h1>
                    <p className="text-muted-foreground text-balance">
                      Your email has been verified successfully.
                    </p>
                  </>
                )}
                {status === "error" && (
                  <>
                    <h1 className="text-2xl font-bold">Verification failed</h1>
                    <p className="text-muted-foreground text-balance">
                      This link is invalid or has expired.
                    </p>
                  </>
                )}
                <Button asChild className="mt-2">
                  <Link href="/auth/sign-in">Back to sign in</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailInner />
    </Suspense>
  );
}
