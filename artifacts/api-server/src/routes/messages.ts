import { Router, type IRouter } from "express";
import { db, messagesTable, usersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";
import {
  CreateCaseMessageBody,
  CreateCaseMessageParams,
  ListCaseMessagesParams,
  ListCaseMessagesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/cases/:id/messages", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = ListCaseMessagesParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.caseId, params.data.id))
    .orderBy(asc(messagesTable.createdAt));

  res.json(ListCaseMessagesResponse.parse(messages));
});

router.post("/cases/:id/messages", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const pathParams = CreateCaseMessageParams.safeParse({ id: rawId });
  if (!pathParams.success) {
    res.status(400).json({ error: pathParams.error.message });
    return;
  }

  const parsed = CreateCaseMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = req.session?.userId;
  let senderName = "مشتری";
  let senderRole: "admin" | "client" = "client";

  if (userId) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));
    if (user) {
      senderName = user.name;
      senderRole = user.role as "admin" | "client";
    }
  }

  const [message] = await db
    .insert(messagesTable)
    .values({
      caseId: pathParams.data.id,
      senderName,
      senderRole,
      content: parsed.data.content,
    })
    .returning();

  res.status(201).json(message);
});

export default router;
