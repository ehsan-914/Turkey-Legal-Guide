import { Router, type IRouter } from "express";
import { db, consultationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  CreateConsultationBody,
  ListConsultationsQueryParams,
  GetConsultationParams,
  UpdateConsultationParams,
  UpdateConsultationBody,
  ListConsultationsResponse,
  GetConsultationResponse,
  UpdateConsultationResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/consultations", async (req, res): Promise<void> => {
  const params = ListConsultationsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let query = db
    .select()
    .from(consultationsTable)
    .orderBy(desc(consultationsTable.createdAt))
    .$dynamic();

  const results = await query;

  const filtered = results.filter((c) => {
    if (params.data.status && c.status !== params.data.status) return false;
    if (params.data.serviceType && c.serviceType !== params.data.serviceType) return false;
    return true;
  });

  res.json(ListConsultationsResponse.parse(filtered));
});

router.post("/consultations", async (req, res): Promise<void> => {
  const parsed = CreateConsultationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [consultation] = await db
    .insert(consultationsTable)
    .values({
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      serviceType: parsed.data.serviceType,
      message: parsed.data.message,
    })
    .returning();

  res.status(201).json(GetConsultationResponse.parse(consultation));
});

router.get("/consultations/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetConsultationParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [consultation] = await db
    .select()
    .from(consultationsTable)
    .where(eq(consultationsTable.id, params.data.id));

  if (!consultation) {
    res.status(404).json({ error: "Consultation not found" });
    return;
  }

  res.json(GetConsultationResponse.parse(consultation));
});

router.patch("/consultations/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateConsultationParams.safeParse({ id: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateConsultationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.adminNotes !== undefined) updateData.adminNotes = parsed.data.adminNotes;

  const [consultation] = await db
    .update(consultationsTable)
    .set(updateData)
    .where(eq(consultationsTable.id, params.data.id))
    .returning();

  if (!consultation) {
    res.status(404).json({ error: "Consultation not found" });
    return;
  }

  res.json(UpdateConsultationResponse.parse(consultation));
});

export default router;
