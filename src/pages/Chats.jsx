import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../store/AuthContext";

function Chats() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setError("");

      // беремо всі chat_id де я учасник
      const { data: rows, error: e1 } = await supabase
        .from("chat_members")
        .select("chat_id")
        .eq("user_id", user.id);

      if (e1) return setError(e1.message);

      const chatIds = (rows || []).map((r) => r.chat_id);
      if (chatIds.length === 0) return setItems([]);

      // беремо інфу про чати + учасників
      const { data: members, error: e2 } = await supabase
        .from("chat_members")
        .select("chat_id, user_id, profiles(full_name, avatar_url)")
        .in("chat_id", chatIds);

      if (e2) return setError(e2.message);

      // зберемо “іншу людину” для кожного чату
      const map = new Map();
      for (const m of members || []) {
        if (!map.has(m.chat_id)) map.set(m.chat_id, []);
        map.get(m.chat_id).push(m);
      }

      const list = chatIds.map((cid) => {
        const arr = map.get(cid) || [];
        const other = arr.find((x) => x.user_id !== user.id);
        return {
          chatId: cid,
          otherName: other?.profiles?.full_name || "Chat",
          otherAvatar: other?.profiles?.avatar_url || null,
        };
      });

      setItems(list);
    };

    load();
  }, [user?.id]);

  if (!user) return <section className="page">Bitte einloggen.</section>;

  return (
    <section className="page">
      <h2 className="page-title">Chats</h2>
      {error && <p className="error">{error}</p>}

      {items.length === 0 ? (
        <p className="muted">Noch keine Chats. Buche einen Job, dann entsteht automatisch ein Chat.</p>
      ) : (
        <div className="mini-list">
          {items.map((c) => (
            <div
              key={c.chatId}
              className="mini-item"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/chats/${c.chatId}`)}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div className="avatar" style={{ width: 42, height: 42 }}>
                  {c.otherAvatar ? (
                    <img src={c.otherAvatar} alt="avatar" />
                  ) : (
                    <span className="avatar-fallback">{c.otherName.slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <strong>{c.otherName}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Chats;
