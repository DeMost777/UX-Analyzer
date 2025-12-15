"use client"

import { LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserMenuProps {
  user: {
    user_id: string
    email: string
    name?: string
    avatar_url?: string
  }
  onLogout: () => void
  onSettings?: () => void
}

export function UserMenu({ user, onLogout, onSettings }: UserMenuProps) {
  const getInitials = () => {
    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return user.email[0].toUpperCase()
  }

  const handleLogout = async () => {
    try {
      const { logoutUser } = await import("@/lib/firebase/auth")
      await logoutUser()
      onLogout()
    } catch (error) {
      console.error("Logout error:", error)
      onLogout() // Still logout on client side
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatar_url} alt={user.name || user.email} />
            <AvatarFallback className="bg-[#4F7CFF] text-white">{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-[#111111] border-[#1A1A1A]">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium text-white">{user.name || "User"}</p>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator className="bg-[#1A1A1A]" />
        <DropdownMenuItem 
          onClick={onSettings}
          className="text-white hover:bg-[#1A1A1A] cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[#1A1A1A]" />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-400 hover:bg-red-500/10 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

