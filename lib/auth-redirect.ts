import { isSameOriginPath } from "../kc/safe-redirect";

const getSafeRedirect = (redirectTo?: string) => {
  if (!redirectTo) return "/";
  return isSameOriginPath(redirectTo) ? redirectTo : "/";
};

const getAuthCallbackURL = (redirectTo?: string) => {
  const safeRedirect = getSafeRedirect(redirectTo);
  return safeRedirect === "/"
    ? "/"
    : `/auth/redirect?to=${encodeURIComponent(safeRedirect)}`;
};

export { getAuthCallbackURL, getSafeRedirect };
