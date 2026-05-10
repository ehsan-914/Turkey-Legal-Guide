import { Router, type IRouter } from "express";
import { db, casesTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";
import {
  CreateCaseBody,
  ListCasesQueryParams,
  GetCaseParams,
  UpdateCaseParams,
  UpdateCaseBody,
  ListCasesResponse,
  GetCaseResponse,
  UpdateCaseResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/cases", requireAdmin, async (req, res): Promise<void> => {
  const params = ListCasesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const conditions = [];
  if (params.data.status) conditions.push(eq(casesTable.status, params.data.status));
  if (params.data.serviceType) conditions.push(eq(casesTable.serviceType, params.data.serviceType));

  const results = await db
    .select()
    .from(casesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(casesTable.updatedAt));

  res.json(ListCasesResponse.parse(results));
});

router.post("/cases", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateCaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [newCase] = await db
    .insert(casesTable)
    .values({
      clientName: parsed.data.clientName,
      clientEmail: parsed.data.clientEmail,
      clientPhone: parsed.data.clientPhone,
      serviceType: parsed.data.serviceType,
      priority: parsed.data.priority,
      notes: parsed.data.notes ?? null,
      consultationId: parsed.data.consultationId ?? null,
    })
    .returning();

  res.status(201).json(GetCaseResponse.parse(newCase));
});

router.get("/cases/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetCaseParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [caseItem] = await db
    .select()
    .from(casesTable)
    .where(eq(casesTable.id, params.data.id));

  if (!caseItem) {
    res.status(404).json({ error: "Case not found" });
    return;
  }

  res.json(GetCaseResponse.parse(caseItem));
});

router.patch("/cases/:id", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateCaseParams.safeParse({ id: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.priority !== undefined) updateData.priority = parsed.data.priority;
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;
  if (parsed.data.progressPercent !== undefined) updateData.progressPercent = parsed.data.progressPercent;

  const [updatedCase] = await db
    .update(casesTable)
    .set(updateData)
    .where(eq(casesTable.id, params.data.id))
    .returning();

  if (!updatedCase) {
    res.status(404).json({ error: "Case not found" });
    return;
  }

  res.json(UpdateCaseResponse.parse(updatedCase));
});

export default router;
