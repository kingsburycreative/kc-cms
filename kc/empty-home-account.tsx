"use client";

// Under "No repositories yet": who is signed in, and a Sign out button, so
// someone who used the wrong address can fix it without the avatar menu.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { EmptyContent } from "@/components/ui/empty";
import { EMPTY_HOME_HINT, EMPTY_HOME_SIGN_OUT, signedInAsLine } from "./empty-home-copy.ts";

export function EmptyHomeAccount() {
  const { user } = useUser();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const line = signedInAsLine(user);

  return (
    <EmptyContent>
      {line && <p className="text-sm font-medium break-all">{line}</p>}
      <p className="text-sm text-muted-foreground">{EMPTY_HOME_HINT}</p>
      <Button
        disabled={pending}
        onClick={async () => {
          setPending(true);
          try {
            await signOut();
            router.push("/sign-in");
            router.refresh();
          } catch {
            setPending(false);
          }
        }}
      >
        {EMPTY_HOME_SIGN_OUT}
        {pending && <Loader className="size-4 animate-spin" />}
      </Button>
    </EmptyContent>
  );
}
