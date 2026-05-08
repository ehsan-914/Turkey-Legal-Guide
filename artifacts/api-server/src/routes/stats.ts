import { Router, type IRouter } from "express";
import { db, consultationsTable, casesTable } from "@workspace/db";
import { eq, gte, count } from "drizzle-orm";
import {
  GetAdminStatsResponse,
  GetRecentActivityResponse,
  GetCasesByServiceResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats/admin", async (_req, res): Promise<void> => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [allConsultations, allCases] = await Promise.all([
    db.select().from(consultationsTable),
    db.select().from(casesTable),
  ]);

  const totalConsultations = allConsultations.length;
  const pendingConsultations = allConsultations.filter(
    (c) => c.status === "pending"
  ).length;
  const totalCases = allCases.length;
  const activeCases = allCases.filter((c) =>
    ["active", "pending_documents", "in_review"].includes(c.status)
  ).length;
  const completedCases = allCases.filter((c) => c.status === "completed").length;
  const consultationsThisMonth = allConsultations.filter(
    (c) => c.createdAt >= startOfMonth
  ).length;
  const casesThisMonth = allCases.filter(
    (c) => c.createdAt >= startOfMonth
  ).length;

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

router.get("/stats/recent-activity", async (_req, res): Promise<void> => {
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

router.get("/stats/cases-by-service", async (_req, res): Promise<void> => {
  const cases = await db.select().from(casesTable);

  const serviceLabels: Record<string, string> = {
    education: "مشاوره تحصیلی",
    residency: "اقامت",
    legal: "خدمات قانونی",
    work: "اجازه کار",
    "student-visa": "ویزای دانشجویی",
    "work-permit": "مجوز کار",
    "citizenship": "تابعیت",
  };

  const grouped: Record<string, number> = {};
  for (const c of cases) {
    grouped[c.serviceType] = (grouped[c.serviceType] ?? 0) + 1;
  }

  const result = Object.entries(grouped).map(([serviceType, count]) => ({
    serviceType,
    count,
    label: serviceLabels[serviceType] ?? serviceType,
  }));

  res.json(GetCasesByServiceResponse.parse(result));
});

export default router;
