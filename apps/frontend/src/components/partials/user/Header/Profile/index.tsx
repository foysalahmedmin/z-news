"use client";

import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator } from "@/components/ui/Dropdown";
import { URLS } from "@/config";
import useUser from "@/hooks/states/useUser";
import { LogOut, User, UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

// Forked from admin/Header/Profile/index.tsx. Fully generic apart from the
// "My Profile" link, which now points at the plain-user dashboard's own
// profile page (`/user/profile`) instead of the admin one
// (`/admin/user/profile`).
const Profile: React.FC = () => {
  const router = useRouter();
  const { user, clearUser } = useUser();
  const { image: imageFileName, name, email, role } = user?.info || {};

  const image = imageFileName ? URLS.user + "/" + imageFileName : "";

  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = () => {
    clearUser();
    router.replace("/auth/sign-in");
  };

  return (
    <>
      {(user?.isAuthenticated || user?.info?._id) && (
        <div className="h-full">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-2 py-1"
          >
            <div className="hidden text-end md:block">
              <div className="text-sm font-semibold">{name}</div>
              <div className="text-muted-foreground text-xs font-bold capitalize">
                {role}
              </div>
            </div>
            <div className="bg-accent text-accent-foreground flex size-10 items-center justify-center overflow-hidden rounded-md">
              {image ? (
                <img
                  src={image}
                  alt={name}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <UserIcon className="size-6" />
              )}
            </div>
          </button>
          <Dropdown className="" isOpen={isOpen} setIsOpen={setIsOpen}>
            <DropdownContent className="top-4 right-0 w-60">
              <div className="flex items-center gap-2 px-2 py-1">
                <div className="bg-accent text-accent-foreground flex size-10 items-center justify-center overflow-hidden rounded-md">
                  {image ? (
                    <img
                      src={image}
                      alt={name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : (
                    <UserIcon className="size-6" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium">{name}</div>
                  <div className="text-muted-foreground text-xs">{email}</div>
                </div>
              </div>
              <DropdownSeparator />
              <DropdownItem className="hover:bg-muted">
                <Link
                  href="/user/profile"
                  className="flex items-center gap-2"
                >
                  <User className="size-4" />
                  Profile
                </Link>
              </DropdownItem>
              <DropdownItem className="flex cursor-pointer items-center gap-2 text-red-700 hover:bg-red-500/15">
                <div
                  onClick={handleLogout}
                  className="flex size-full items-center gap-2"
                >
                  <LogOut className="size-4" />
                  Sign out
                </div>
              </DropdownItem>
            </DropdownContent>
          </Dropdown>
        </div>
      )}
    </>
  );
};

export default Profile;
