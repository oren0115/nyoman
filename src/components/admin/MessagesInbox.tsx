import * as React from "react";
import { adminApi } from "@/lib/api";
import type { ContactMessage } from "@/lib/api";
import { useToast } from "./AdminShell";

export function MessagesInbox() {
  const { addToast } = useToast();
  const [messages, setMessages] = React.useState<ContactMessage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = React.useState<number | null>(null);
  const [filter, setFilter] = React.useState<"all" | "unread" | "read">("all");
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);

  async function load(p = 1) {
    setLoading(true);
    try {
      const params: { page: number; is_read?: boolean } = { page: p };
      if (filter === "unread") params.is_read = false;
      if (filter === "read") params.is_read = true;
      const res = await adminApi.getMessages(params);
      if (res.success && res.data) {
        setMessages(res.data);
        setTotal(res.meta?.total || 0);
      }
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(1); setPage(1); }, [filter]);

  async function handleMarkRead(msg: ContactMessage) {
    if (msg.is_read) return;
    await adminApi.markRead(msg.id);
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m))
    );
    if (selected?.id === msg.id) {
      setSelected({ ...msg, is_read: true });
    }
  }

  async function handleDelete(id: number) {
    setDeleting(id);
    try {
      const res = await adminApi.deleteMessage(id);
      if (res.success) {
        addToast("success", "Message deleted");
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (selected?.id === id) setSelected(null);
      } else {
        addToast("error", "Failed to delete message");
      }
    } finally {
      setDeleting(null);
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Messages Inbox</h1>
        <p className="text-muted-foreground">
          {total} messages{unreadCount > 0 && ` · ${unreadCount} unread`}
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(["all", "unread", "read"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
              filter === f ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            }`}>
            {f}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* List */}
        <div className="w-full space-y-2 lg:max-w-sm xl:max-w-md">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
            ))
          ) : messages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <p className="text-muted-foreground">No messages found.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => { setSelected(msg); handleMarkRead(msg); }}
                className={`w-full rounded-xl border p-4 text-left transition-all hover:border-primary/30 ${
                  selected?.id === msg.id
                    ? "border-primary/40 bg-primary/10"
                    : msg.is_read
                    ? "border-border bg-card/50"
                    : "border-border bg-card/80 ring-1 ring-primary/20"
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className={`text-sm font-semibold ${msg.is_read ? "text-foreground" : "text-primary"}`}>
                    {msg.name}
                  </span>
                  {!msg.is_read && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{msg.email}</p>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{msg.message}</p>
                <p className="mt-1 text-xs text-muted-foreground/60">{formatDate(msg.created_at)}</p>
              </button>
            ))
          )}
        </div>

        {/* Detail */}
        <div className="flex-1">
          {selected ? (
            <div className="rounded-2xl border border-border bg-card/50 p-6">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{selected.name}</h2>
                  <a href={`mailto:${selected.email}`}
                    className="text-sm text-primary hover:underline">
                    {selected.email}
                  </a>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(selected.created_at)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent("Re: Portfolio Contact")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary/20 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/30"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    Reply via email
                  </a>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(selected.email);
                        addToast("success", "Email address copied to clipboard");
                      } catch {
                        addToast("error", "Could not copy");
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-white/5"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h2m8 0h2a2 2 0 012 2v2m2 4a2 2 0 01-2 2h-8a2 2 0 01-2-2v-8a2 2 0 012-2h2" />
                    </svg>
                    Copy email
                  </button>
                  <button onClick={() => handleDelete(selected.id)} disabled={deleting === selected.id}
                    className="rounded-lg border border-red-500/20 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50">
                    {deleting === selected.id ? "..." : "Delete"}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-white/5 p-5">
                <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                  {selected.message}
                </p>
              </div>

              {!selected.is_read && (
                <p className="mt-4 text-xs text-muted-foreground">
                  ✓ Marked as read
                </p>
              )}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-border">
              <p className="text-sm text-muted-foreground">Select a message to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
