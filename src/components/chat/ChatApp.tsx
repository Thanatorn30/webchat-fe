"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type {
  Admin,
  Contact,
  Conversation,
  ConversationStatus,
  Message,
} from "@/types/chat";
import { listAdmins } from "@/lib/api/admins";
import { ApiError } from "@/lib/api/client";
import {
  deleteConversation,
  listConversations,
  markConversationRead,
  updateConversation,
  type UpdateConversationInput,
} from "@/lib/api/conversations";
import { listMessages, retryMessage, sendMessage } from "@/lib/api/messages";
import { getSocket } from "@/lib/realtime";
import { ConversationList } from "./ConversationList";
import { ChatWindow } from "./ChatWindow";
import { ContactPanel } from "./ContactPanel";
import { DbAsleepDialog } from "./DbAsleepDialog";


const noopSubscribe = () => () => {};

/** รอข้อมูลนานเกินนี้ → ถือว่า DB หลับอยู่ ให้ผู้ใช้กดรีเฟรช */
const FETCH_TIMEOUT_MS = 15_000;

class FetchTimeoutError extends Error {
  constructor() {
    super("fetch timeout");
    this.name = "FetchTimeoutError";
  }
}

/** reject ถ้า promise ไม่เสร็จภายใน ms */
function withTimeout<T>(promise: Promise<T>, ms = FETCH_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new FetchTimeoutError()), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}


export function ChatApp() {
  const isClient = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  if (!isClient) {
    return (
      <div className="flex h-dvh items-center justify-center text-sm text-zinc-400">
        กำลังโหลด…
      </div>
    );
  }
  return <ChatAppInner />;
}

function ChatAppInner() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // โหลดข้อมูลไม่สำเร็จ / timeout / นานเกิน 15 วิ → แสดง popup ให้รีเฟรช
  const [dbAsleep, setDbAsleep] = useState(false);
  // ข้อความแยกตามห้อง — ดึงจาก GET /api/conversations/:id/messages ตอนเปิดห้องครั้งแรก
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  // cursor สำหรับโหลดข้อความเก่ากว่า (null = หมดแล้ว)
  const [nextBefore, setNextBefore] = useState<Record<string, string | null>>({});
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  // ห้องที่เปิดอยู่ — ใช้ใน handler ของ socket (ไม่ต้อง subscribe ใหม่ทุกครั้งที่เปลี่ยนห้อง)
  const selectedIdRef = useRef<string | null>(null);
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const loadConversations = useCallback(async () => {
    const page = await listConversations({ limit: 100 });
    setConversations(page.items);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [page, adminList] = await withTimeout(
          Promise.all([listConversations({ limit: 100 }), listAdmins()]),
        );
        if (cancelled) return;
        setConversations(page.items);
        setAdmins(adminList);
      } catch (err) {
        if (cancelled) return;
        if (isAuthError(err)) setError(errorMessage(err));
        else setDbAsleep(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /** ใส่ข้อความลงห้อง — มี id นี้แล้วให้แทนที่ (กันเบิ้ลระหว่าง response กับ socket) */
  const upsertMessage = useCallback((convId: string, message: Message, appendIfMissing = true) => {
    setMessages((all) => {
      const list = all[convId];
      if (!list) return all; // ยังไม่เคยเปิดห้องนี้ → โหลดเองตอนเปิด
      if (list.some((m) => m.id === message.id)) {
        return { ...all, [convId]: list.map((m) => (m.id === message.id ? message : m)) };
      }
      return appendIfMissing ? { ...all, [convId]: [...list, message] } : all;
    });
  }, []);

  // ───── realtime ─────
  useEffect(() => {
    const socket = getSocket();

    const onMessageCreated = ({ conversationId, message }: { conversationId: string; message: Message }) =>
      upsertMessage(conversationId, message);

    const onMessageUpdated = ({ conversationId, message }: { conversationId: string; message: Message }) =>
      upsertMessage(conversationId, message, false);

    const onMessageDeleted = ({ conversationId, messageId }: { conversationId: string; messageId: string }) =>
      setMessages((all) => {
        const list = all[conversationId];
        if (!list) return all;
        return { ...all, [conversationId]: list.filter((m) => m.id !== messageId) };
      });

    const onConversationUpdated = ({ conversation }: { conversation: Conversation }) => {
      // ห้องที่เปิดดูอยู่แล้วมีข้อความเข้ามา → ถือว่าอ่านแล้ว
      if (conversation.id === selectedIdRef.current && conversation.unreadCount > 0) {
        conversation = { ...conversation, unreadCount: 0 };
        markConversationRead(conversation.id).catch(() => {});
      }
      setConversations((list) => [conversation, ...list.filter((c) => c.id !== conversation.id)]);
    };

    const onContactUpdated = ({ contact }: { contact: Contact }) =>
      setConversations((list) => list.map((c) => (c.contact.id === contact.id ? { ...c, contact } : c)));

    // หลุดแล้วต่อใหม่ → อาจพลาด event ระหว่างนั้น → โหลดรายการห้องใหม่
    const onReconnect = () => {
      loadConversations().catch((err) => setError(errorMessage(err)));
    };
    const onConnectError = (err: Error) => console.warn("[realtime]", err.message);

    socket.on("message.created", onMessageCreated);
    socket.on("message.updated", onMessageUpdated);
    socket.on("message.deleted", onMessageDeleted);
    socket.on("conversation.updated", onConversationUpdated);
    socket.on("contact.updated", onContactUpdated);
    socket.on("connect_error", onConnectError);
    socket.io.on("reconnect", onReconnect);
    socket.connect();

    return () => {
      socket.off("message.created", onMessageCreated);
      socket.off("message.updated", onMessageUpdated);
      socket.off("message.deleted", onMessageDeleted);
      socket.off("conversation.updated", onConversationUpdated);
      socket.off("contact.updated", onContactUpdated);
      socket.off("connect_error", onConnectError);
      socket.io.off("reconnect", onReconnect);
      socket.disconnect();
    };
  }, [upsertMessage, loadConversations]);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  const fetchMessages = async (convId: string, before?: string) => {
    setLoadingMessages(true);
    try {
      const page = await withTimeout(listMessages(convId, { before }));
      setMessages((all) => ({
        ...all,
        [convId]: before ? [...page.items, ...(all[convId] ?? [])] : page.items,
      }));
      setNextBefore((all) => ({ ...all, [convId]: page.nextBefore }));
    } catch (err) {
      if (isAuthError(err)) setError(errorMessage(err));
      else setDbAsleep(true);
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadOlder = () => {
    if (!selectedId || loadingMessages) return;
    const before = nextBefore[selectedId];
    if (before) fetchMessages(selectedId, before);
  };

  const patchConversation = (id: string, patch: Partial<Conversation>) =>
    setConversations((list) =>
      list.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );

  const select = async (id: string) => {
    setSelectedId(id);
    if (!(id in messages)) fetchMessages(id); // โหลดครั้งแรกที่เปิดห้อง
    const conv = conversations.find((c) => c.id === id);
    if (!conv || conv.unreadCount === 0) return;
    patchConversation(id, { unreadCount: 0 });
    try {
      await markConversationRead(id);
    } catch (err) {
      patchConversation(id, { unreadCount: conv.unreadCount });
      setError(errorMessage(err));
    }
  };

  /** DELETE /api/conversations/:id — ลบห้อง + ข้อความทั้งหมด (owner เท่านั้น) */
  const removeConversation = async (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    const name = conv?.contact.displayName ?? "ไม่ทราบชื่อ";
    if (!window.confirm(`ลบห้องแชตของ "${name}" และข้อความทั้งหมด?\nลบแล้วกู้คืนไม่ได้`)) return;
    try {
      await deleteConversation(id);
      setConversations((list) => list.filter((c) => c.id !== id));
      setMessages((all) => omit(all, id));
      setNextBefore((all) => omit(all, id));
      if (selectedId === id) {
        setSelectedId(null);
        setShowInfo(false);
      }
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  // อัปเดตบนจอทันที แล้วค่อยยิง PATCH — ถ้าพังให้ย้อนค่าเดิม
  const saveConversation = async (input: UpdateConversationInput) => {
    if (!selected) return;
    const { id } = selected;
    const prev: UpdateConversationInput = {
      status: selected.status,
      assignedAdminId: selected.assignedAdminId,
    };
    patchConversation(id, input);
    try {
      await updateConversation(id, input);
    } catch (err) {
      patchConversation(id, prev);
      setError(errorMessage(err));
    }
  };

  // ข้อความ (queued) เข้ามาทาง socket ก่อน แล้ว response คือผลสุดท้าย (sent / failed) → upsert ด้วย id
  const send = async (text: string) => {
    if (!selected) return;
    const convId = selected.id;
    try {
      const message = await sendMessage(convId, text);
      upsertMessage(convId, message);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const retry = async (msgId: string) => {
    if (!selected) return;
    const convId = selected.id;
    try {
      const message = await retryMessage(msgId);
      upsertMessage(convId, message, false);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const setStatus = (status: ConversationStatus) =>
    saveConversation({ status });

  const assign = (adminId: string | null) =>
    saveConversation({ assignedAdminId: adminId });

  if (loading || (dbAsleep && conversations.length === 0)) {
    return (
      <>
        <div className="flex h-dvh flex-col items-center justify-center gap-3 text-sm text-zinc-400">
          {!dbAsleep && (
            <span
              aria-hidden
              className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-500"
            />
          )}
          {dbAsleep ? "โหลดรายการแชตไม่สำเร็จ" : "กำลังโหลดรายการแชต…"}
        </div>
        {dbAsleep && <DbAsleepDialog />}
      </>
    );
  }

  return (
    <>
   
      {dbAsleep && <DbAsleepDialog onClose={() => setDbAsleep(false)} />}
      {error && (
        <div
          role="alert"
          className="fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-3 bg-red-600 px-4 py-2 text-sm text-white"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="font-medium underline"
          >
            ปิด
          </button>
        </div>
      )}
      <div className="grid h-dvh grid-cols-1 overflow-hidden md:grid-cols-[340px_1fr] xl:grid-cols-[340px_1fr_auto]">
        <div className={`min-h-0 ${selected ? "hidden md:block" : "block"}`}>
          <ConversationList
            conversations={conversations}
            selectedId={selectedId}
            onSelect={select}
            onDelete={removeConversation}
          />
        </div>

        <div className={`min-h-0 ${selected ? "block" : "hidden md:block"}`}>
          {selected ? (
            <ChatWindow
              conversation={selected}
              messages={messages[selected.id] ?? []}
              loadingMessages={loadingMessages}
              hasOlder={Boolean(nextBefore[selected.id])}
              onLoadOlder={loadOlder}
              admins={admins}
              onBack={() => setSelectedId(null)}
              onSend={send}
              onRetry={retry}
              onStatusChange={setStatus}
              onAssign={assign}
              onToggleInfo={() => setShowInfo((v) => !v)}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-zinc-50 text-sm text-zinc-400">
              เลือกห้องแชตทางซ้ายเพื่อเริ่มคุย
            </div>
          )}
        </div>

        {selected && showInfo && (
          <div className="fixed inset-y-0 right-0 z-20 w-80 max-w-full shadow-xl xl:static xl:shadow-none">
            <ContactPanel
              conversation={selected}
              onClose={() => setShowInfo(false)}
            />
          </div>
        )}
      </div>
    </>
  );
}

/** 401/403 ไม่ใช่ DB หลับ — ให้ AuthGuard / แบนเนอร์ error จัดการตามเดิม */
function isAuthError(err: unknown): boolean {
  return err instanceof ApiError && (err.status === 401 || err.status === 403);
}

/** คืน object ใหม่ที่ไม่มี key นี้ */
function omit<T>(obj: Record<string, T>, key: string): Record<string, T> {
  const next = { ...obj };
  delete next[key];
  return next;
}

function errorMessage(err: unknown): string {
  if (err instanceof ApiError)
    return `เกิดข้อผิดพลาด (${err.status}): ${err.message}`;
  return "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ลองใหม่อีกครั้ง";
}
