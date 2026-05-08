import { Router, type IRouter } from "express";
import { db, casesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
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

router.get("/cases", async (req, res): Promise<void> => {
  const params = ListCasesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const results = await db
    .select()
    .from(casesTable)
    .orderBy(desc(casesTable.updatedAt));

  const filtered = results.filter((c) => {
    if (params.data.status && c.status !== params.data.status) return false;
    if (params.data.serviceType && c.serviceType !== params.data.serviceType) return false;
    return true;
  });

  res.json(ListCasesResponse.parse(filtered));
});

router.post("/cases", async (req, res): Promise<void> => {
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

router.get("/cases/:id", async (req, res): Promise<void> => {
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

router.patch("/cases/:id", async (req, res): Promise<void> => {
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
