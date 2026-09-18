const LeaderboardLoading = () => {
  return (
    <main className="container mx-auto max-w-4xl animate-pulse px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="bg-muted h-12 w-12 rounded-xl" />
        <div>
          <div className="bg-muted mb-2 h-6 w-40 rounded" />
          <div className="bg-muted h-4 w-56 rounded" />
        </div>
      </div>

      <ul className="space-y-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <li
            key={index}
            className="bg-card flex items-center gap-4 rounded-2xl border p-4 shadow-sm"
          >
            <div className="bg-muted h-10 w-10 flex-shrink-0 rounded-full" />
            <div className="bg-muted h-11 w-11 flex-shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <div className="bg-muted mb-2 h-4 w-32 rounded" />
              <div className="bg-muted h-3 w-20 rounded" />
            </div>
            <div className="bg-muted h-16 w-16 flex-shrink-0 rounded-xl" />
          </li>
        ))}
      </ul>
    </main>
  );
};

export default LeaderboardLoading;
