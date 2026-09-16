"use client";

import { Dropdown } from "@/components/ui/Dropdown";
import { URLS } from "@/config";
import useUser from "@/hooks/states/useUser";
import { LogOut, User, UserIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

const Profile: React.FC = () => {
  const { user, clearUser } = useUser();
  const { image: imageFileName, name, email, role } = user?.info || {};

  const image = imageFileName ? URLS.user + "/" + imageFileName : "";

  const [isOpen, setIsOpen] = React.useState(false);

  return (
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
      <Dropdown
        className=""
        side={"left"}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      >
        <Dropdown.Content className="top-2 right-0 w-60">
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
          <Dropdown.Separator />
          <Dropdown.Item>
            <Link href="/profile" className="flex items-center gap-2">
              <User className="size-4" />
              Profile
            </Link>
          </Dropdown.Item>
          <Dropdown.Item
            onClick={clearUser}
            className="flex items-center gap-2 text-red-600 hover:bg-red-50"
          >
            <LogOut className="size-4" />
            Sign out
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>
    </div>
  );
};

export default Profile;
