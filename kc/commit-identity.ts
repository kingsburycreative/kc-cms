export const KC_DEFAULT_COMMIT_IDENTITY = "user";

export const kcCommitIdentity = (configured: unknown): "app" | "user" => {
  if (configured === "app") return "app";
  if (configured === "user") return "user";
  return KC_DEFAULT_COMMIT_IDENTITY;
};
