"use client";

import { useOthers, useSelf } from "@liveblocks/react/suspense";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Avatars() {
  const others = useOthers();
  const self = useSelf();

  const allUsers = [self, ...others];

  return (
    <div className="flex gap-2 items-center">
      <p className="font-light text-sm">Users currently editing this page</p>
      <div className="flex -space-x-5">
        {allUsers.map((user, index) => {
          const key = `${user?.id || "self"}-${index}`;
          const isSelf = self?.id === user?.id;
          const name = isSelf ? "You" : user?.info.name;

          return (
            <TooltipProvider key={key}>
              <Tooltip>
                <TooltipTrigger>
                  <Avatar className="border-2 hover:z-50">
                    <AvatarImage src={user?.info.avatar} />
                    <AvatarFallback>{user?.info.name}</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
}
