const FooterSkeleton = () => {
  return (
    <footer className="dark bg-background text-foreground animate-pulse">
      <div className="container">
        <div className="py-6 md:py-10">
          {/* Top Section */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Logo & About */}
            <div>
              <div className="bg-muted h-8 w-40 rounded" />
              <div className="mt-3 space-y-2">
                <div className="bg-muted h-4 w-full max-w-[220px] rounded" />
                <div className="bg-muted h-4 w-full max-w-[180px] rounded" />
                <div className="bg-muted h-4 w-full max-w-[200px] rounded" />
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <div className="bg-muted mb-4 h-6 w-32 rounded" />
              <ul className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <li key={i}>
                    <div className="bg-muted h-4 w-24 rounded" />
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Social */}
            <div>
              <div className="bg-muted mb-4 h-6 w-24 rounded" />
              <div className="bg-muted mb-4 h-4 w-36 rounded" />
              <div className="flex space-x-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-muted h-6 w-6 rounded-full"
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>
          </div>

          <hr className="border-muted/30 my-6" />

          {/* Bottom Section */}
          <div className="flex flex-col items-center justify-center text-sm sm:flex-row">
            <div className="bg-muted h-4 w-48 rounded" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSkeleton;
