import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { LoginBody, LoginResponse, GetMeResponse, LogoutResponse } from "@workspace/api-zod";
import crypto from "crypto";

const router: IRouter = Router();

const SCRYPT_KEYLEN = 64;

function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, SCRYPT_KEYLEN, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (storedHash.includes(":")) {
      const [salt, hash] = storedHash.split(":");
      crypto.scrypt(password, salt, SCRYPT_KEYLEN, (err, derivedKey) => {
        if (err) reject(err);
        else resolve(crypto.timingSafeEqual(Buffer.from(hash, "hex"), derivedKey));
      });
    } else {
      const sha256Hash = crypto.createHash("sha256").update(password).digest("hex");
      resolve(sha256Hash === storedHash);
    }
  });
}

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username));

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  req.session.userId = user.id;
  req.session.save((err) => {
    if (err) {
      req.log.error({ err }, "Session save error");
      res.status(500).json({ error: "Session error" });
      return;
    }
    res.json(
      LoginResponse.parse({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      })
    );
  });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy((err) => {
    if (err) {
      req.log.error({ err }, "Session destroy error");
    }
    res.json(LogoutResponse.parse({ success: true, message: "Logged out" }));
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  res.json(
    GetMeResponse.parse({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    })
  );
});

export default router;
export { hashPassword };
