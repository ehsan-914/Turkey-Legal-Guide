import { Router, type IRouter } from "express";
import { db, siteContentTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router: IRouter = Router();

const UpdateContentBody = z.object({
  updates: z.record(z.string(), z.string()),
});

// Public: get all site content
router.get("/site-content", async (_req, res): Promise<void> => {
  const rows = await db.select().from(siteContentTable);
  const content: Record<string, string> = {};
  for (const row of rows) {
    content[row.key] = row.value;
  }
  res.json(content);
});

// Admin: update site content (upsert multiple keys)
router.put("/site-content", async (req, res): Promise<void> => {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = UpdateContentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  for (const [key, value] of Object.entries(parsed.data.updates)) {
    const existing = await db
      .select()
      .from(siteContentTable)
      .where(eq(siteContentTable.key, key));

    if (existing.length > 0) {
      await db
        .update(siteContentTable)
        .set({ value, updatedAt: new Date() })
        .where(eq(siteContentTable.key, key));
    } else {
      await db.insert(siteContentTable).values({ key, value });
    }
  }

  const rows = await db.select().from(siteContentTable);
  const content: Record<string, string> = {};
  for (const row of rows) {
    content[row.key] = row.value;
  }
  res.json(content);
});

export default router;
