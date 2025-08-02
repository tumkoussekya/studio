
'use client';

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users } from "lucide-react";

interface UserListProps {
  users: string[];
}

export default function UserList({ users }: UserListProps) {
  return (
    <div className="flex flex-col p-4">
      <h3 className="text-lg font-semibold mb-2 flex items-center">
        <Users className="mr-2 h-5 w-5" />
        Online Users ({users.length})
      </h3>
      <ScrollArea className="h-32">
        <div className="space-y-2">
          {users.map((email, index) => (
            <div key={index} className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                    <AvatarFallback>{email.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{email}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
