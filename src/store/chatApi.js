import { supabase } from "../lib/supabase";

export async function getOrCreateChatForBooking({ bookingId }) {
  const { data, error } = await supabase.rpc("get_or_create_chat_for_booking", {
    p_booking_id: bookingId,
  });

  if (error) throw error;
  return data; // chat_id
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
