
'use client';

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, LocateFixed } from "lucide-react";

interface UserListProps {
  users: { clientId: string, email: string }[];
  onFollow: (clientId: string) => void;
}

export default function UserList({ users, onFollow }: UserListProps) {
  return (
    <TooltipProvider>
      <div className="flex flex-col p-4">
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <Users className="mr-2 h-5 w-5" />
          Online Users ({users.length})
        </h3>
        <ScrollArea className="h-32">
          <div className="space-y-1">
            {users.map((user) => (
              <div key={user.clientId} className="flex items-center justify-between gap-2 group">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{user.email.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground truncate">{user.email}</span>
                  </div>
                   <Tooltip>
                      <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => onFollow(user.clientId)}>
                            <LocateFixed className="h-4 w-4" />
                          </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Locate {user.email}</p>
                      </TooltipContent>
                    </Tooltip>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}
