const SENDER_NAME = "Kingsbury Creative";

// A bare address gets the Kingsbury Creative display name; a From that already has one is left alone.
export function withSenderName(from: string): string {
  const value = from.trim();
  return value.includes("<") ? value : `${SENDER_NAME} <${value}>`;
}

export function inviteSubject(client: string): string {
  return `You're invited to edit ${client}`;
}

export function addedSubject(client: string): string {
  return `You now have access to ${client}`;
}
