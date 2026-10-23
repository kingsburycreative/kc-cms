export type SignInMethod = "email" | "github";

// Clients only ever see email sign-in. GitHub shows at /sign-in?staff=1.
export function signInMethods(a: { staff: boolean }): SignInMethod[] {
  return a.staff ? ["email", "github"] : ["email"];
}

export function isStaffParam(params: { get(name: string): string | null }): boolean {
  return params.get("staff") === "1";
}
