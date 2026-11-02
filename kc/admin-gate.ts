export type AdminGate = { kind: "ok" } | { kind: "redirect"; to: string };

// Where a page request for /admin goes. Server actions keep requireAdminSession's throw.
export const adminPageGate = (user: unknown, isAdmin: boolean): AdminGate => {
  if (!user) return { kind: "redirect", to: `/sign-in?redirect=${encodeURIComponent("/admin")}` };
  if (!isAdmin) return { kind: "redirect", to: "/" };
  return { kind: "ok" };
};
