import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { baseURL, secretKey } from "../../../util/config";
import { useSelector } from "react-redux";

// Live customer-support inbox. Self-contained — manages its own state
// outside Redux because there's no other view that needs to read these
// conversations. Two columns:
//   left:  paginated conversation list (filterable open/closed/all)
//   right: selected conversation thread + composer
//
// The list updates live: we open a socket connection, join the
// `supportInbox` room, and apply incremental `supportInboxUpdated`
// events to the local list so admins see new messages stream in
// without polling. The selected conversation's thread also live-
// updates via `supportMessage` events on the per-conversation room.

const headers = {
  key: secretKey,
  "Content-Type": "application/json",
};

const SupportInbox = () => {
  // The admin reducer stores the JWT-decoded payload as `state.admin.admin`
  // (see Component/store/admin/admin.reducer.js — `admin: decode`). Token
  // payloads here typically include the admin's `_id` plus role; we
  // surface a friendly name fallback.
  const adminInfo = useSelector((s) => s.admin && s.admin.admin) || {};
  const adminId = adminInfo._id || adminInfo.id;
  const adminName =
    `${adminInfo.firstName || ""} ${adminInfo.lastName || ""}`.trim() ||
    adminInfo.name ||
    "Support";

  const [statusFilter, setStatusFilter] = useState("open"); // open | closed | all
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [totalOpen, setTotalOpen] = useState(0);
  const [activeId, setActiveId] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [composerText, setComposerText] = useState("");
  const [sending, setSending] = useState(false);
  const socketRef = useRef(null);
  const threadEndRef = useRef(null);

  // ── Inbox list fetch ───────────────────────────────────────────────
  const fetchInbox = async () => {
    try {
      const params = new URLSearchParams({
        start: 1,
        limit: 50,
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(search && { search }),
      });
      const res = await axios.get(`${baseURL}support/admin/inbox?${params}`, {
        headers,
      });
      if (res.data && res.data.status) {
        setConversations(res.data.conversations || []);
        setTotalUnread(res.data.totalUnreadMessages || 0);
        setTotalOpen(res.data.totalOpen || 0);
      }
    } catch (err) {
      console.error("SupportInbox fetchInbox error:", err);
    }
  };

  // ── Active conversation fetch ──────────────────────────────────────
  const fetchConversation = async (conversationId) => {
    if (!conversationId) return;
    try {
      const res = await axios.get(
        `${baseURL}support/admin/conversation/${conversationId}`,
        { headers }
      );
      if (res.data && res.data.status) {
        setActiveConversation(res.data.conversation);
        // Joining the per-conversation socket room so live messages stream in.
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit(
            "supportJoin",
            JSON.stringify({ conversationId })
          );
        }
        scrollThreadToBottom();
      }
    } catch (err) {
      console.error("SupportInbox fetchConversation error:", err);
    }
  };

  // ── Send admin reply ───────────────────────────────────────────────
  const sendReply = async () => {
    const text = composerText.trim();
    if (!text || !activeId || !adminId || sending) return;
    setSending(true);
    try {
      const res = await axios.post(
        `${baseURL}support/admin/sendMessage`,
        { conversationId: activeId, adminId, text },
        { headers }
      );
      if (res.data && res.data.status) {
        // The socket broadcast will append the message; we just clear
        // the input and the inbox row will reorder via the
        // supportInboxUpdated event.
        setComposerText("");
      }
    } catch (err) {
      console.error("SupportInbox sendReply error:", err);
    } finally {
      setSending(false);
    }
  };

  const closeConversation = async () => {
    if (!activeId) return;
    try {
      await axios.post(
        `${baseURL}support/admin/close`,
        { conversationId: activeId },
        { headers }
      );
      fetchInbox();
      setActiveConversation((prev) => prev && { ...prev, status: "closed" });
    } catch (err) {
      console.error("SupportInbox closeConversation error:", err);
    }
  };

  // ── Socket lifecycle ───────────────────────────────────────────────
  useEffect(() => {
    // Connect once. The `liveRoom` query parameter is a per-admin namespace
    // we reuse from the user-side flow — the backend's connect handler
    // joins this room for direct emits.
    const sock = io(baseURL.replace(/\/$/, ""), {
      transports: ["websocket"],
      query: { liveRoom: `liveRoom:admin:${adminId || "anon"}` },
    });
    socketRef.current = sock;

    sock.on("connect", () => {
      sock.emit("supportInboxJoin");
    });

    // Inbox-wide event: a new message arrived in some conversation.
    // Patch the matching row in-place (or refetch if it's not in the
    // current page).
    sock.on("supportInboxUpdated", (payload) => {
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c._id === payload.conversationId);
        if (idx === -1) {
          // Not in current page — schedule a refetch on next tick to
          // reflect a brand-new conversation or one that fell off the page.
          setTimeout(fetchInbox, 0);
          return prev;
        }
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          unreadByAdmin:
            payload.unreadByAdmin !== undefined
              ? payload.unreadByAdmin
              : next[idx].unreadByAdmin,
          unreadByUser:
            payload.unreadByUser !== undefined
              ? payload.unreadByUser
              : next[idx].unreadByUser,
          lastActivityAt: payload.lastActivityAt || next[idx].lastActivityAt,
          status: payload.status || next[idx].status,
          lastMessage: payload.lastMessage
            ? {
                senderType: payload.senderType,
                text: payload.lastMessage,
                createdAt: payload.lastActivityAt,
              }
            : next[idx].lastMessage,
        };
        // Re-sort so the most recently active is on top.
        next.sort(
          (a, b) =>
            new Date(b.lastActivityAt).getTime() -
            new Date(a.lastActivityAt).getTime()
        );
        return next;
      });
    });

    // Per-conversation event: a new message in the thread we're viewing.
    sock.on("supportMessage", (raw) => {
      try {
        const msg = typeof raw === "string" ? JSON.parse(raw) : raw;
        setActiveConversation((prev) => {
          if (!prev) return prev;
          // De-dupe by id.
          if ((prev.messages || []).some((m) => m._id === msg._id)) return prev;
          return { ...prev, messages: [...(prev.messages || []), msg] };
        });
        scrollThreadToBottom();
      } catch (err) {
        console.error("supportMessage parse error:", err);
      }
    });

    return () => {
      sock.emit("supportInboxLeave");
      sock.disconnect();
      socketRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminId]);

  // ── Filter / search effects ────────────────────────────────────────
  useEffect(() => {
    fetchInbox();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    if (activeId) fetchConversation(activeId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // Debounced search.
  useEffect(() => {
    const t = setTimeout(() => fetchInbox(), 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const scrollThreadToBottom = () => {
    setTimeout(() => {
      if (threadEndRef.current) {
        threadEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 50);
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString();
  };

  const inboxList = useMemo(
    () =>
      conversations.map((c) => {
        const u = c.userId || {};
        const userLabel =
          `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
          u.email ||
          u.mobileNumber ||
          "Unknown";
        const isActive = c._id === activeId;
        return (
          <div
            key={c._id}
            onClick={() => setActiveId(c._id)}
            style={{
              padding: 12,
              borderBottom: "1px solid #eee",
              background: isActive ? "#eef6ff" : "white",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{userLabel}</strong>
              {c.unreadByAdmin > 0 && (
                <span
                  style={{
                    background: "#ef4444",
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                >
                  {c.unreadByAdmin}
                </span>
              )}
            </div>
            <div
              style={{
                color: "#666",
                fontSize: 13,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                marginTop: 4,
              }}
            >
              {c.lastMessage
                ? `${c.lastMessage.senderType === "admin" ? "You: " : ""}${c.lastMessage.text}`
                : "No messages yet"}
            </div>
            <div style={{ color: "#999", fontSize: 11, marginTop: 4 }}>
              {formatTime(c.lastActivityAt)}{" "}
              {c.status === "closed" && (
                <span style={{ color: "#999" }}> · closed</span>
              )}
            </div>
          </div>
        );
      }),
    [conversations, activeId]
  );

  return (
    <div style={{ display: "flex", height: "calc(100vh - 80px)", background: "white" }}>
      {/* Left: inbox list */}
      <div
        style={{
          width: 360,
          borderRight: "1px solid #eee",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: 12, borderBottom: "1px solid #eee" }}>
          <h4 style={{ margin: 0, marginBottom: 8 }}>
            Support Inbox{" "}
            <small style={{ color: "#999" }}>
              ({totalOpen} open · {totalUnread} unread)
            </small>
          </h4>
          <input
            placeholder="Search by name / email / phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: 6,
              border: "1px solid #ddd",
              borderRadius: 4,
              marginBottom: 8,
            }}
          />
          <div style={{ display: "flex", gap: 4 }}>
            {["open", "closed", "all"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: "4px 10px",
                  border: "1px solid #ddd",
                  background: statusFilter === s ? "#3b82f6" : "white",
                  color: statusFilter === s ? "white" : "#333",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 12,
                  textTransform: "capitalize",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {inboxList.length === 0 ? (
            <div style={{ padding: 24, color: "#999", textAlign: "center" }}>
              No conversations.
            </div>
          ) : (
            inboxList
          )}
        </div>
      </div>

      {/* Right: thread + composer */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {!activeConversation ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
            }}
          >
            Select a conversation to view it.
          </div>
        ) : (
          <>
            <div
              style={{
                padding: 12,
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong>
                  {activeConversation.userId
                    ? `${activeConversation.userId.firstName || ""} ${activeConversation.userId.lastName || ""}`.trim() ||
                      activeConversation.userId.email ||
                      activeConversation.userId.mobileNumber
                    : ""}
                </strong>
                <div style={{ color: "#666", fontSize: 12 }}>
                  {activeConversation.userId &&
                    (activeConversation.userId.email || activeConversation.userId.mobileNumber)}{" "}
                  · status: {activeConversation.status}
                </div>
              </div>
              {activeConversation.status === "open" && (
                <button
                  onClick={closeConversation}
                  style={{
                    padding: "6px 12px",
                    border: "1px solid #ddd",
                    background: "white",
                    cursor: "pointer",
                    borderRadius: 4,
                  }}
                >
                  Close ticket
                </button>
              )}
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 16,
                background: "#fafafa",
              }}
            >
              {(activeConversation.messages || []).map((m, i) => {
                const fromAdmin = m.senderType === "admin";
                return (
                  <div
                    key={m._id || i}
                    style={{
                      display: "flex",
                      justifyContent: fromAdmin ? "flex-end" : "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "70%",
                        background: fromAdmin ? "#3b82f6" : "white",
                        color: fromAdmin ? "white" : "#222",
                        padding: "8px 12px",
                        borderRadius: 12,
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                      }}
                    >
                      {!fromAdmin && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "#888",
                            marginBottom: 2,
                          }}
                        >
                          {m.senderName}
                        </div>
                      )}
                      <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
                      <div
                        style={{
                          fontSize: 10,
                          opacity: 0.7,
                          marginTop: 4,
                          textAlign: fromAdmin ? "right" : "left",
                        }}
                      >
                        {formatTime(m.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={threadEndRef} />
            </div>

            <div
              style={{
                padding: 12,
                borderTop: "1px solid #eee",
                display: "flex",
                gap: 8,
              }}
            >
              <textarea
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                placeholder={`Reply as ${adminName}…`}
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendReply();
                  }
                }}
                style={{
                  flex: 1,
                  padding: 8,
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  resize: "none",
                  fontFamily: "inherit",
                }}
              />
              <button
                onClick={sendReply}
                disabled={sending || !composerText.trim()}
                style={{
                  padding: "0 20px",
                  background: sending ? "#94a3b8" : "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: sending ? "not-allowed" : "pointer",
                }}
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SupportInbox;
