import { Router, type IRouter } from "express";
import { db, usersTable, casesTable, messagesTable, documentsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import {
  ListClientCaseMessagesParams,
  CreateClientCaseMessageParams,
  CreateCaseMessageBody,
} from "@workspace/api-zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const router: IRouter = Router();

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed. Allowed: PDF, images, Word documents."));
    }
  },
});

function requireClient(req: any, res: any, next: any): void {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

// List client's own cases
router.get("/client/cases", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user || user.role !== "client") {
    res.status(403).json({ error: "Client access required" });
    return;
  }

  const cases = await db
    .select()
    .from(casesTable)
    .where(eq(casesTable.clientId, userId))
    .orderBy(desc(casesTable.createdAt));

  res.json(cases);
});

// List messages for a client case
router.get("/client/cases/:id/messages", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const parsed = ListClientCaseMessagesParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user || user.role !== "client") {
    res.status(403).json({ error: "Client access required" });
    return;
  }

  const [caseRecord] = await db
    .select()
    .from(casesTable)
    .where(and(eq(casesTable.id, parsed.data.id), eq(casesTable.clientId, userId)));

  if (!caseRecord) {
    res.status(404).json({ error: "Case not found" });
    return;
  }

  const msgs = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.caseId, parsed.data.id))
    .orderBy(messagesTable.createdAt);

  res.json(msgs);
});

// Send a message on a client case
router.post("/client/cases/:id/messages", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const paramsParsed = CreateClientCaseMessageParams.safeParse(req.params);
  const bodyParsed = CreateCaseMessageBody.safeParse(req.body);

  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.message });
    return;
  }
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user || user.role !== "client") {
    res.status(403).json({ error: "Client access required" });
    return;
  }

  const [caseRecord] = await db
    .select()
    .from(casesTable)
    .where(and(eq(casesTable.id, paramsParsed.data.id), eq(casesTable.clientId, userId)));

  if (!caseRecord) {
    res.status(404).json({ error: "Case not found" });
    return;
  }

  const [msg] = await db
    .insert(messagesTable)
    .values({
      caseId: paramsParsed.data.id,
      senderName: user.name,
      senderRole: "client",
      content: bodyParsed.data.content,
    })
    .returning();

  res.status(201).json(msg);
});

// List client's own documents
router.get("/client/documents", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user || user.role !== "client") {
    res.status(403).json({ error: "Client access required" });
    return;
  }

  const docs = await db
    .select()
    .from(documentsTable)
    .where(eq(documentsTable.uploadedById, userId))
    .orderBy(desc(documentsTable.createdAt));

  res.json(docs);
});

// Upload a document
router.post("/client/documents", requireAuth, (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    next();
  });
}, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user || user.role !== "client") {
    res.status(403).json({ error: "Client access required" });
    return;
  }

  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const caseId = req.body.caseId ? parseInt(req.body.caseId, 10) : null;

  if (caseId) {
    const [caseRecord] = await db
      .select()
      .from(casesTable)
      .where(and(eq(casesTable.id, caseId), eq(casesTable.clientId, userId)));

    if (!caseRecord) {
      fs.unlinkSync(file.path);
      res.status(404).json({ error: "Case not found" });
      return;
    }
  }

  const [doc] = await db
    .insert(documentsTable)
    .values({
      fileName: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      filePath: file.path,
      uploadedById: userId,
      caseId,
    })
    .returning();

  res.status(201).json({
    id: doc.id,
    fileName: doc.fileName,
    originalName: doc.originalName,
    mimeType: doc.mimeType,
    fileSize: doc.fileSize,
    uploadedById: doc.uploadedById,
    caseId: doc.caseId,
    createdAt: doc.createdAt,
  });
});

// Delete a client document
router.delete("/client/documents/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const docId = parseInt(rawId, 10);

  if (isNaN(docId)) {
    res.status(400).json({ error: "Invalid document ID" });
    return;
  }

  const [doc] = await db
    .select()
    .from(documentsTable)
    .where(and(eq(documentsTable.id, docId), eq(documentsTable.uploadedById, userId)));

  if (!doc) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  try {
    fs.unlinkSync(doc.filePath);
  } catch {
    // File may already be deleted
  }

  await db.delete(documentsTable).where(eq(documentsTable.id, docId));

  res.json({ success: true, message: "Document deleted" });
});

// Download a document
router.get("/documents/:id/download", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const docId = parseInt(rawId, 10);

  if (isNaN(docId)) {
    res.status(400).json({ error: "Invalid document ID" });
    return;
  }

  const [doc] = await db.select().from(documentsTable).where(eq(documentsTable.id, docId));
  if (!doc) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  if (user.role !== "admin" && doc.uploadedById !== userId) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  if (!fs.existsSync(doc.filePath)) {
    res.status(404).json({ error: "File not found on disk" });
    return;
  }

  res.download(doc.filePath, doc.originalName);
});

export default router;
