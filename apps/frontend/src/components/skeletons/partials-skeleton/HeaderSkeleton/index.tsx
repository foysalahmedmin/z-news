const HeaderSkeleton = () => {
  return (
    <>
      {/* TopHeader Skeleton */}
      <div className="bg-card text-card-foreground sticky top-0 z-50 animate-pulse overflow-hidden shadow md:static md:z-auto md:shadow-none">
        <div className="container grid h-16 w-full grid-cols-3 items-center justify-between px-4">
          {/* Left: ButtonMenu & Date */}
          <div className="flex items-center justify-start gap-4">
            <div className="bg-muted h-8 w-8 rounded" />
            <div className="bg-muted hidden h-5 w-40 rounded md:block" />
          </div>

          {/* Center: Logo */}
          <div className="flex justify-center">
            <div className="bg-muted h-16 w-24 rounded" />
          </div>

          {/* Right: Button and Search */}
          <div className="flex items-center justify-end gap-4">
            {/* Button */}
            <div className="border-muted bg-muted hidden h-8 w-24 rounded border md:block" />
            {/* Mobile Search icon */}
            <div className="bg-muted h-6 w-6 rounded md:hidden" />
          </div>
        </div>
      </div>

      {/* Navigation Skeleton */}
      <nav className="bg-card text-card-foreground sticky top-0 z-50 hidden animate-pulse shadow md:block">
        <div className="container h-16 px-4">
          <div className="relative flex h-full items-center gap-4">
            {/* Logo */}
            <div className="w-16">
              <div className="bg-muted h-8 w-16 rounded" />
            </div>

            {/* Categories */}
            <div className="flex flex-1 items-center justify-center">
              <div className="bg-muted mx-auto flex w-11/12 gap-4" />
            </div>

            {/* Search Icon */}
            <div className="flex w-16 items-center justify-end gap-4">
              <div className="bg-muted h-6 w-6 rounded" />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default HeaderSkeleton;
