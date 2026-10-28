// One wording for every spot where a feature is missing from a site's config.
export const NOT_SET_UP = "Not set up yet";

// True when the config lists no media folder, in either the navigation or the media list.
export function mediaNotSetUp(object: any): boolean {
  const nav = object?.navigation?.media;
  if (Array.isArray(nav)) return nav.length === 0;
  const media = object?.media;
  return !Array.isArray(media) || media.length === 0;
}

// The Site group shows the not-set-up line only when no insights entry exists.
// Configured but no access stays hidden, so this takes the configured flag alone.
export function insightsNotSetUp(configured: boolean): boolean {
  return !configured;
}
