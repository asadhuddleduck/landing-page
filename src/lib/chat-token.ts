import { createHmac, timingSafeEqual } from "crypto";

const SECRET =
  process.env.CHAT_SESSION_SECRET || process.env.ANTHROPIC_API_KEY || "fallback";

export function generateChatToken(ip: string): string {
  return createHmac("sha256", SECRET)
    .update(`chat-session:${ip}`)
    .digest("hex")
    .slice(0, 32);
}

export function verifyChatToken(ip: string, token: string): boolean {
  const expected = generateChatToken(ip);
  if (typeof token !== "string" || token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}

export function signConversationUrl(conversationId: string): string {
  return createHmac("sha256", SECRET)
    .update(`conversation:${conversationId}`)
    .digest("hex")
    .slice(0, 16);
}

export function verifyConversationSignature(
  conversationId: string,
  sig: string
): boolean {
  const expected = signConversationUrl(conversationId);
  if (typeof sig !== "string" || sig.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
}
