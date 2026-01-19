import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../store/AuthContext";
import { sendMessage } from "../store/chatApi";

function ChatRoom() {
  const { chatId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const bottomRef = useRef(null);

  const load = async () => {
    setError("");
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (error) return setError(error.message);
    setMsgs(data || []);
  };

  useEffect(() => {
    if (!user) return;
    load();

    // realtime: підписка на нові повідомлення
    const channel = supabase
      .channel(`messages:${chatId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  const onSend = async () => {
    if (!user) return navigate("/auth");
    try {
      await sendMessage({ chatId, senderId: user.id, text });
      setText("");
    } catch (e) {
      setError(e.message || "Send failed");
    }
  };

  if (!user) return <section className="page">Bitte einloggen.</section>;

  return (
    <section className="page">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <h2 className="page-title">Chat</h2>
        <button className="btn-secondary" onClick={() => navigate("/chats")}>Zurück</button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="chat-box">
        {msgs.map((m) => {
          const mine = m.sender_id === user.id;
          return (
            <div key={m.id} className={`chat-msg ${mine ? "mine" : ""}`}>
              <div className="bubble">{m.text}</div>
              <div className="muted" style={{ fontSize: 12 }}>
                {new Date(m.created_at).toLocaleString()}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Nachricht..." />
        <button className="btn-primary" onClick={onSend}>Senden</button>
      </div>
    </section>
  );
}

export default ChatRoom;
