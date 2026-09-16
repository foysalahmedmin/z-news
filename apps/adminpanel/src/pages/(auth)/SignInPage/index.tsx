import SigninForm from "@/components/(auth)/signin-page/SigninForm";

const SignInPage = () => {
  return (
    <main className="max-h-screen max-w-screen overflow-x-hidden">
      <section className="flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-3xl space-y-4">
          <div className="bg-card text-card-foreground grid grid-cols-1 gap-4 rounded-md px-4 py-8 shadow lg:gap-6 lg:px-6">
            <div>
              <SigninForm />
            </div>
            {/* <div>
              <SigninImage />
            </div> */}
          </div>
          <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
            By clicking continue, you agree to our{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </section>
    </main>
  );
};

export default SignInPage;
