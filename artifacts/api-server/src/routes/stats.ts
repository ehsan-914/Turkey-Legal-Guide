import { Router, type IRouter } from "express";
import { db, consultationsTable, casesTable } from "@workspace/db";
import { eq, gte, count, sql } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";
import {
  GetAdminStatsResponse,
  GetRecentActivityResponse,
  GetCasesByServiceResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats/admin", requireAdmin, async (_req, res): Promise<void> => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    [{ totalConsultations }],
    [{ pendingConsultations }],
    [{ totalCases }],
    [{ activeCases }],
    [{ completedCases }],
    [{ consultationsThisMonth }],
    [{ casesThisMonth }],
  ] = await Promise.all([
    db.select({ totalConsultations: count() }).from(consultationsTable),
    db.select({ pendingConsultations: count() }).from(consultationsTable).where(eq(consultationsTable.status, "pending")),
    db.select({ totalCases: count() }).from(casesTable),
    db.select({ activeCases: count() }).from(casesTable).where(sql`${casesTable.status} IN ('active', 'pending_documents', 'in_review')`),
    db.select({ completedCases: count() }).from(casesTable).where(eq(casesTable.status, "completed")),
    db.select({ consultationsThisMonth: count() }).from(consultationsTable).where(gte(consultationsTable.createdAt, startOfMonth)),
    db.select({ casesThisMonth: count() }).from(casesTable).where(gte(casesTable.createdAt, startOfMonth)),
  ]);

  res.json(
    GetAdminStatsResponse.parse({
      totalConsultations,
      pendingConsultations,
      totalCases,
      activeCases,
      completedCases,
      consultationsThisMonth,
      casesThisMonth,
    })
  );
});

router.get("/stats/recent-activity", requireAdmin, async (_req, res): Promise<void> => {
  const [recentConsultations, recentCases] = await Promise.all([
    db
      .select()
      .from(consultationsTable)
      .orderBy(consultationsTable.createdAt)
      .limit(5),
    db.select().from(casesTable).orderBy(casesTable.updatedAt).limit(5),
  ]);

  const activities = [
    ...recentConsultations.map((c) => ({
      id: `consultation-${c.id}`,
      type: "new_consultation" as const,
      description: `New consultation request from ${c.fullName} for ${c.serviceType}`,
      createdAt: c.createdAt,
    })),
    ...recentCases.map((c) => ({
      id: `case-${c.id}`,
      type: "case_updated" as const,
      description: `Case for ${c.clientName} updated to ${c.status}`,
      createdAt: c.updatedAt,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10);

  res.json(GetRecentActivityResponse.parse(activities));
});

router.get("/stats/cases-by-service", requireAdmin, async (_req, res): Promise<void> => {
  const serviceLabels: Record<string, string> = {
    education: "مشاوره تحصیلی",
    residency: "اقامت",
    legal: "خدمات قانونی",
    work: "اجازه کار",
    "student-visa": "ویزای دانشجویی",
    "work-permit": "مجوز کار",
    "citizenship": "تابعیت",
  };

  const grouped = await db
    .select({
      serviceType: casesTable.serviceType,
      count: count(),
    })
    .from(casesTable)
    .groupBy(casesTable.serviceType);

  const result = grouped.map((row) => ({
    serviceType: row.serviceType,
    count: row.count,
    label: serviceLabels[row.serviceType] ?? row.serviceType,
  }));

  res.json(GetCasesByServiceResponse.parse(result));
});

export default router;
