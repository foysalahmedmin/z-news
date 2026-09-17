"use client";

import Profile from "@/components/partials/admin/Profile";

// Ported from apps/adminpanel's `/users/:id` route
// (`<ProfilePage isUserView={true} />`, super-admin/admin only — enforced by
// the parent `/admin/*` middleware + admin-menu-items.ts's `roles` on the
// "Users" menu entry). The shared Profile component reads the `id` off
// `useParams()` itself, so this page just flips `isUserView` on.
const AdminUserProfilePage = () => {
  return <Profile isUserView />;
};

export default AdminUserProfilePage;
