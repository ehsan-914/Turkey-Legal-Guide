import { Router, type IRouter } from "express";
import { db, chatThreadsTable, chatMessagesTable, usersTable } from "@workspace/db";
import { eq, asc, desc } from "drizzle-orm";
import { z } from "zod";
import crypto from "crypto";

const router: IRouter = Router();

const CreateThreadBody = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().default(""),
  message: z.string().min(1),
});

const AddMessageBody = z.object({
  content: z.string().min(1),
  token: z.string(),
});

const AdminReplyBody = z.object({
  content: z.string().min(1),
});

// Public: start a new chat thread
router.post("/chat", async (req, res): Promise<void> => {
  const parsed = CreateThreadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const token = crypto.randomBytes(24).toString("hex");

  const [thread] = await db
    .insert(chatThreadsTable)
    .values({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      token,
    })
    .returning();

  await db.insert(chatMessagesTable).values({
    threadId: thread.id,
    senderRole: "client",
    senderName: parsed.data.name,
    content: parsed.data.message,
  });

  res.status(201).json({ threadId: thread.id, token });
});

// Public: get messages for a thread (client uses token)
router.get("/chat/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const token = req.query.token as string;

  if (!id || !token) {
    res.status(400).json({ error: "Missing id or token" });
    return;
  }

  const [thread] = await db
    .select()
    .from(chatThreadsTable)
    .where(eq(chatThreadsTable.id, id));

  if (!thread || thread.token !== token) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const messages = await db
    .select()
    .from(chatMessagesTable)
    .where(eq(chatMessagesTable.threadId, id))
    .orderBy(asc(chatMessagesTable.createdAt));

  res.json({ thread, messages });
});

// Public: client sends a follow-up message
router.post("/chat/:id/message", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const parsed = AddMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [thread] = await db
    .select()
    .from(chatThreadsTable)
    .where(eq(chatThreadsTable.id, id));

  if (!thread || thread.token !== parsed.data.token) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [msg] = await db
    .insert(chatMessagesTable)
    .values({
      threadId: id,
      senderRole: "client",
      senderName: thread.name,
      content: parsed.data.content,
    })
    .returning();

  res.status(201).json(msg);
});

// Admin: list all threads
router.get("/admin/chat", async (req, res): Promise<void> => {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const threads = await db
    .select()
    .from(chatThreadsTable)
    .orderBy(desc(chatThreadsTable.createdAt));

  res.json(threads);
});

// Admin: get a thread with messages
router.get("/admin/chat/:id", async (req, res): Promise<void> => {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = parseInt(req.params.id, 10);

  const [thread] = await db
    .select()
    .from(chatThreadsTable)
    .where(eq(chatThreadsTable.id, id));

  if (!thread) {
    res.status(404).json({ error: "Thread not found" });
    return;
  }

  const messages = await db
    .select()
    .from(chatMessagesTable)
    .where(eq(chatMessagesTable.threadId, id))
    .orderBy(asc(chatMessagesTable.createdAt));

  res.json({ thread, messages });
});

// Admin: reply to a thread
router.post("/admin/chat/:id/reply", async (req, res): Promise<void> => {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = parseInt(req.params.id, 10);
  const parsed = AdminReplyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.session.userId));

  const [msg] = await db
    .insert(chatMessagesTable)
    .values({
      threadId: id,
      senderRole: "admin",
      senderName: user?.name ?? "مدیریت",
      content: parsed.data.content,
    })
    .returning();

  res.status(201).json(msg);
});

// Admin: close/open a thread
router.patch("/admin/chat/:id", async (req, res): Promise<void> => {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = parseInt(req.params.id, 10);
  const { status } = req.body as { status: "open" | "closed" };

  const [thread] = await db
    .update(chatThreadsTable)
    .set({ status })
    .where(eq(chatThreadsTable.id, id))
    .returning();

  res.json(thread);
});

export default router;
