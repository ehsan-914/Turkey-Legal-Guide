import { Router, type IRouter } from "express";
import { db, usersTable, casesTable, documentsTable } from "@workspace/db";
import { eq, and, count, desc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

// List all client accounts with stats
router.get("/admin/clients", requireAdmin, async (_req, res): Promise<void> => {
  const clients = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.role, "client"))
    .orderBy(desc(usersTable.createdAt));

  const result = await Promise.all(
    clients.map(async (client) => {
      const [casesCount] = await db
        .select({ count: count() })
        .from(casesTable)
        .where(eq(casesTable.clientId, client.id));

      const [docsCount] = await db
        .select({ count: count() })
        .from(documentsTable)
        .where(eq(documentsTable.uploadedById, client.id));

      return {
        id: client.id,
        username: client.username,
        name: client.name,
        email: client.email,
        phone: client.phone,
        createdAt: client.createdAt,
        casesCount: casesCount.count,
        documentsCount: docsCount.count,
      };
    })
  );

  res.json(result);
});

// Get client profile with cases and documents
router.get("/admin/clients/:id", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const clientId = parseInt(rawId, 10);
  if (isNaN(clientId)) {
    res.status(400).json({ error: "Invalid client ID" });
    return;
  }

  const [client] = await db
    .select()
    .from(usersTable)
    .where(and(eq(usersTable.id, clientId), eq(usersTable.role, "client")));

  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }

  const cases = await db
    .select()
    .from(casesTable)
    .where(eq(casesTable.clientId, clientId))
    .orderBy(desc(casesTable.createdAt));

  const documents = await db
    .select()
    .from(documentsTable)
    .where(eq(documentsTable.uploadedById, clientId))
    .orderBy(desc(documentsTable.createdAt));

  res.json({
    id: client.id,
    username: client.username,
    name: client.name,
    email: client.email,
    phone: client.phone,
    createdAt: client.createdAt,
    cases,
    documents: documents.map((d) => ({
      id: d.id,
      fileName: d.fileName,
      originalName: d.originalName,
      mimeType: d.mimeType,
      fileSize: d.fileSize,
      uploadedById: d.uploadedById,
      caseId: d.caseId,
      createdAt: d.createdAt,
    })),
  });
});

// List documents for a specific client (admin)
router.get("/admin/clients/:id/documents", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const clientId = parseInt(rawId, 10);
  if (isNaN(clientId)) {
    res.status(400).json({ error: "Invalid client ID" });
    return;
  }

  const documents = await db
    .select()
    .from(documentsTable)
    .where(eq(documentsTable.uploadedById, clientId))
    .orderBy(desc(documentsTable.createdAt));

  res.json(
    documents.map((d) => ({
      id: d.id,
      fileName: d.fileName,
      originalName: d.originalName,
      mimeType: d.mimeType,
      fileSize: d.fileSize,
      uploadedById: d.uploadedById,
      caseId: d.caseId,
      createdAt: d.createdAt,
    }))
  );
});

export default router;
