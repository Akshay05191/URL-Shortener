import type { Request, Response } from "express";
import { nanoid } from "nanoid";
import QRCode from "qrcode";
import bcrypt from "bcryptjs";
import { ShortUrl } from "../models/ShortUrl.js";
import type { AuthRequest } from "../middleware/auth.js";

const ALIAS_REGEX = /^[a-zA-Z0-9_-]+$/;

function getBaseUrl(req: Request): string {
  const host = req.get("host") || "localhost";
  const protocol = req.protocol;
  return `${protocol}://${host}`;
}

function formatShortUrl(doc: any, baseUrl: string) {
  const now = new Date();
  const isExpired = doc.expiresAt ? new Date(doc.expiresAt) < now : false;
  return {
    id: doc._id.toString(),
    originalUrl: doc.originalUrl,
    shortCode: doc.shortCode,
    shortUrl: `${baseUrl}/r/${doc.shortCode}`,
    title: doc.title ?? null,
    clicks: doc.clicks ?? 0,
    isPasswordProtected: !!doc.password,
    expiresAt: doc.expiresAt ? new Date(doc.expiresAt).toISOString() : null,
    createdAt: new Date(doc.createdAt).toISOString(),
    lastVisitedAt: doc.lastVisitedAt ? new Date(doc.lastVisitedAt).toISOString() : null,
    qrCode: doc.qrCode ?? null,
    isExpired,
  };
}

export async function createUrl(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { originalUrl, customAlias, title, password, expiresAt } = req.body;

    if (!originalUrl) {
      res.status(400).json({ error: "Original URL is required" });
      return;
    }

    try {
      new URL(originalUrl);
    } catch {
      res.status(400).json({ error: "Invalid URL format" });
      return;
    }

    let shortCode: string;

    if (customAlias) {
      if (!ALIAS_REGEX.test(customAlias)) {
        res.status(400).json({ error: "Alias may only contain letters, numbers, hyphens, and underscores" });
        return;
      }
      const existing = await ShortUrl.findOne({ shortCode: customAlias });
      if (existing) {
        res.status(409).json({ error: "This alias is already taken" });
        return;
      }
      shortCode = customAlias;
    } else {
      let unique = false;
      shortCode = nanoid(7);
      while (!unique) {
        const existing = await ShortUrl.findOne({ shortCode });
        if (!existing) unique = true;
        else shortCode = nanoid(7);
      }
    }

    let hashedPassword: string | undefined;
    if (password && password.trim()) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    let expiry: Date | undefined;
    if (expiresAt) {
      expiry = new Date(expiresAt);
      if (isNaN(expiry.getTime())) {
        res.status(400).json({ error: "Invalid expiration date" });
        return;
      }
    }

    const baseUrl = getBaseUrl(req);
    const shortUrl = `${baseUrl}/r/${shortCode}`;

    const qrCode = await QRCode.toDataURL(shortUrl, {
      width: 256,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });

    const doc = new ShortUrl({
      userId: req.userId,
      originalUrl,
      shortCode,
      title: title || undefined,
      password: hashedPassword,
      expiresAt: expiry,
      qrCode,
    });

    await doc.save();
    res.status(201).json(formatShortUrl(doc, baseUrl));
  } catch (err) {
    req.log.error({ err }, "CreateUrl error");
    res.status(500).json({ error: "Server error" });
  }
}

export async function listUrls(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { search, sortBy = "createdAt", sortOrder = "desc", filter = "all" } = req.query as {
      search?: string;
      sortBy?: string;
      sortOrder?: string;
      filter?: string;
    };

    const query: Record<string, unknown> = { userId: req.userId };

    if (search) {
      query.$or = [
        { originalUrl: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { shortCode: { $regex: search, $options: "i" } },
      ];
    }

    const now = new Date();
    if (filter === "active") {
      query.$or = [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }];
    } else if (filter === "expired") {
      query.expiresAt = { $lt: now };
    } else if (filter === "password_protected") {
      query.password = { $exists: true, $ne: null };
    }

    const allowedSortFields: Record<string, string> = {
      createdAt: "createdAt",
      clicks: "clicks",
      title: "title",
    };
    const sortField = allowedSortFields[sortBy] ?? "createdAt";
    const sortDir = sortOrder === "asc" ? 1 : -1;

    const docs = await ShortUrl.find(query)
      .sort({ [sortField]: sortDir })
      .lean();

    const baseUrl = getBaseUrl(req);
    const formatted = docs.map((doc) => formatShortUrl(doc, baseUrl));
    res.json(formatted);
  } catch (err) {
    req.log.error({ err }, "ListUrls error");
    res.status(500).json({ error: "Server error" });
  }
}

export async function getUrl(req: AuthRequest, res: Response): Promise<void> {
  try {
    const doc = await ShortUrl.findOne({ _id: req.params.id, userId: req.userId });
    if (!doc) {
      res.status(404).json({ error: "URL not found" });
      return;
    }
    const baseUrl = getBaseUrl(req);
    res.json(formatShortUrl(doc, baseUrl));
  } catch (err) {
    req.log.error({ err }, "GetUrl error");
    res.status(500).json({ error: "Server error" });
  }
}

export async function updateUrl(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, expiresAt } = req.body;

    const update: Record<string, unknown> = {};
    if (title !== undefined) update.title = title;
    if (expiresAt !== undefined) {
      update.expiresAt = expiresAt ? new Date(expiresAt) : undefined;
    }

    const doc = await ShortUrl.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: update },
      { new: true }
    );

    if (!doc) {
      res.status(404).json({ error: "URL not found" });
      return;
    }

    const baseUrl = getBaseUrl(req);
    res.json(formatShortUrl(doc, baseUrl));
  } catch (err) {
    req.log.error({ err }, "UpdateUrl error");
    res.status(500).json({ error: "Server error" });
  }
}

export async function deleteUrl(req: AuthRequest, res: Response): Promise<void> {
  try {
    const doc = await ShortUrl.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!doc) {
      res.status(404).json({ error: "URL not found" });
      return;
    }
    res.json({ message: "URL deleted successfully" });
  } catch (err) {
    req.log.error({ err }, "DeleteUrl error");
    res.status(500).json({ error: "Server error" });
  }
}

export async function resolveUrl(req: Request, res: Response): Promise<void> {
  try {
    const { code } = req.params;
    const doc = await ShortUrl.findOne({ shortCode: code });

    if (!doc) {
      res.status(404).json({ error: "Short URL not found" });
      return;
    }

    const now = new Date();
    const isExpired = doc.expiresAt ? doc.expiresAt < now : false;

    if (isExpired) {
      res.json({
        originalUrl: doc.originalUrl,
        isPasswordProtected: !!doc.password,
        isExpired: true,
        shortCode: doc.shortCode,
      });
      return;
    }

    if (doc.password) {
      res.json({
        originalUrl: "",
        isPasswordProtected: true,
        isExpired: false,
        shortCode: doc.shortCode,
      });
      return;
    }

    doc.clicks += 1;
    (doc as any).lastVisitedAt = now;
    doc.clickEvents.push({ timestamp: now });
    await doc.save();

    res.json({
      originalUrl: doc.originalUrl,
      isPasswordProtected: false,
      isExpired: false,
      shortCode: doc.shortCode,
    });
  } catch (err) {
    req.log.error({ err }, "ResolveUrl error");
    res.status(500).json({ error: "Server error" });
  }
}

export async function verifyUrlPassword(req: Request, res: Response): Promise<void> {
  try {
    const { code } = req.params;
    const { password } = req.body;

    const doc = await ShortUrl.findOne({ shortCode: code });
    if (!doc) {
      res.status(404).json({ error: "Short URL not found" });
      return;
    }

    const now = new Date();
    const isExpired = doc.expiresAt ? doc.expiresAt < now : false;
    if (isExpired) {
      res.status(410).json({ error: "This link has expired" });
      return;
    }

    const valid = await doc.comparePassword(password);
    if (!valid) {
      res.status(401).json({ error: "Incorrect password" });
      return;
    }

    doc.clicks += 1;
    (doc as any).lastVisitedAt = now;
    doc.clickEvents.push({ timestamp: now });
    await doc.save();

    res.json({
      originalUrl: doc.originalUrl,
      isPasswordProtected: true,
      isExpired: false,
      shortCode: doc.shortCode,
    });
  } catch (err) {
    req.log.error({ err }, "VerifyUrlPassword error");
    res.status(500).json({ error: "Server error" });
  }
}
