"use client";

import Profile from "@/components/partials/admin/Profile";

// Ported from apps/adminpanel's `/user/profile` route
// (`<ProfilePage />`, any authenticated user's own profile). No `id` param
// on this route, so the shared Profile component falls back to
// `fetchSelf()` internally.
const MyProfilePage = () => {
  return <Profile />;
};

export default MyProfilePage;
