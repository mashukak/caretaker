const CHATS_KEY = "caretaker_chats";

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getChats() {
  return readJSON(CHATS_KEY, {});
}

export function getChat(chatId) {
  const chats = getChats();
  return chats[chatId] || { id: chatId, messages: [] };
}

export function sendMessage(chatId, message) {
  const chats = getChats();
  const chat = chats[chatId] || { id: chatId, messages: [] };

  const newMsg = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...message, // {fromId, fromName, text}
  };

  chat.messages.push(newMsg);
  chats[chatId] = chat;
  writeJSON(CHATS_KEY, chats);
  return newMsg;
}
