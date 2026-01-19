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

      // 1) мої chat_ids
      const { data: my, error: e1 } = await supabase
        .from("chat_members")
        .select("chat_id")
        .eq("user_id", user.id);

      if (e1) return setError(e1.message);

      const chatIds = (my || []).map((r) => r.chat_id);
      if (chatIds.length === 0) return setItems([]);

      // 2) чати + booking_id
      const { data: chats, error: e2 } = await supabase
        .from("chats")
        .select("id, booking_id")
        .in("id", chatIds);

      if (e2) return setError(e2.message);

      // 3) booking + job + owner profile
      const bookingIds = chats.map((c) => c.booking_id).filter(Boolean);

      const { data: books, error: e3 } = await supabase
        .from("bookings")
        .select("id, client_id, jobs(owner_id, title, profiles:owner_id(full_name, avatar_url))")
        .in("id", bookingIds);

      if (e3) return setError(e3.message);

      // items
      const list = (chats || []).map((c) => {
        const b = (books || []).find((x) => x.id === c.booking_id);
        const ownerProfile = b?.jobs?.profiles;
        const ownerId = b?.jobs?.owner_id;
        const clientId = b?.client_id;

        const otherIsOwner = user.id === clientId; // якщо я клієнт → інший власник
        const otherName = otherIsOwner ? (ownerProfile?.full_name || "Owner") : "Client";
        const otherAvatar = otherIsOwner ? (ownerProfile?.avatar_url || null) : null;

        return {
          chatId: c.id,
          title: b?.jobs?.title || "Chat",
          otherName,
          otherAvatar,
          otherId: otherIsOwner ? ownerId : clientId,
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
                <div style={{ display: "grid" }}>
                  <strong>{c.otherName}</strong>
                  <span className="muted">{c.title}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Chats;
