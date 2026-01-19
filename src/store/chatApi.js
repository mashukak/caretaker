import { supabase } from "../lib/supabase";

/**
 * Create chat for booking (or return existing one)
 */
export async function getOrCreateChatForBooking({ bookingId, userA, userB }) {
  // 1) try find existing
  const { data: existing, error: e1 } = await supabase
    .from("chats")
    .select("id")
    .eq("booking_id", bookingId)
    .maybeSingle();

  if (e1) throw e1;
  if (existing?.id) return existing.id;

  // 2) create chat
  const { data: created, error: e2 } = await supabase
    .from("chats")
    .insert({ booking_id: bookingId })
    .select("id")
    .single();

  if (e2) throw e2;

  // 3) add members
  const members = [
    { chat_id: created.id, user_id: userA },
    { chat_id: created.id, user_id: userB },
  ];

  const { error: e3 } = await supabase.from("chat_members").insert(members);
  if (e3) throw e3;

  return created.id;
}

export async function sendMessage({ chatId, senderId, text }) {
  const t = (text || "").trim();
  if (!t) return;

  const { error } = await supabase.from("messages").insert({
    chat_id: chatId,
    sender_id: senderId,
    text: t,
  });

  if (error) throw error;
}
