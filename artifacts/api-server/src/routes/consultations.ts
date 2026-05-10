import { Router, type IRouter } from "express";
import { db, consultationsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";
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

router.get("/consultations", requireAdmin, async (req, res): Promise<void> => {
  const params = ListConsultationsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const conditions = [];
  if (params.data.status) conditions.push(eq(consultationsTable.status, params.data.status));
  if (params.data.serviceType) conditions.push(eq(consultationsTable.serviceType, params.data.serviceType));

  const results = await db
    .select()
    .from(consultationsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(consultationsTable.createdAt));

  res.json(ListConsultationsResponse.parse(results));
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

router.get("/consultations/:id", requireAdmin, async (req, res): Promise<void> => {
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

router.patch("/consultations/:id", requireAdmin, async (req, res): Promise<void> => {
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
