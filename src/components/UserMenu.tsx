import { useAuth } from "@/auth/AuthGate";
import { useState } from "react";
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react"; // أو shadcn dropdown
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <Menu isOpen={open} onClose={() => setOpen(false)}>
      <MenuButton onClick={() => setOpen(!open)}>
        <Avatar name={user?.email} className="cursor-pointer" />
      </MenuButton>
      <MenuList className="bg-white shadow-md rounded-lg p-2 w-56">
        <div className="px-3 py-2 border-b border-gray-200">
          <p className="font-semibold text-gray-800">
            {user?.user_metadata?.name || "User"}
          </p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
        <MenuItem as="button" onClick={signOut} className="text-red-600">
          Sign Out
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
