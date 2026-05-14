import type { Response } from "express";
import { ShortUrl } from "../models/ShortUrl.js";
import type { AuthRequest } from "../middleware/auth.js";

function groupClicksByDay(
  clickEvents: Array<{ timestamp: Date }>
): Array<{ date: string; clicks: number }> {
  const map = new Map<string, number>();

  for (const event of clickEvents) {
    const date = new Date(event.timestamp).toISOString().slice(0, 10);
    map.set(date, (map.get(date) ?? 0) + 1);
  }

  const result: Array<{ date: string; clicks: number }> = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    result.push({ date: dateStr, clicks: map.get(dateStr) ?? 0 });
  }
  return result;
}

export async function getUrlAnalytics(req: AuthRequest, res: Response): Promise<void> {
  try {
    const doc = await ShortUrl.findOne({ _id: req.params.id, userId: req.userId });
    if (!doc) {
      res.status(404).json({ error: "URL not found" });
      return;
    }

    const clicksByDay = groupClicksByDay(doc.clickEvents);

    res.json({
      urlId: doc._id.toString(),
      totalClicks: doc.clicks,
      clicksByDay,
      lastVisitedAt: (doc as any).lastVisitedAt ? new Date((doc as any).lastVisitedAt).toISOString() : null,
      createdAt: doc.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "GetUrlAnalytics error");
    res.status(500).json({ error: "Server error" });
  }
}

export async function getDashboardAnalytics(req: AuthRequest, res: Response): Promise<void> {
  try {
    const now = new Date();
    const docs = await ShortUrl.find({ userId: req.userId }).lean();

    const totalUrls = docs.length;
    const totalClicks = docs.reduce((sum, d) => sum + (d.clicks ?? 0), 0);
    const expiredUrls = docs.filter((d) => d.expiresAt && new Date(d.expiresAt) < now).length;
    const activeUrls = totalUrls - expiredUrls;

    const allEvents: Array<{ timestamp: Date }> = [];
    for (const d of docs) {
      if (d.clickEvents) {
        allEvents.push(...d.clickEvents);
      }
    }
    const clicksByDay = groupClicksByDay(allEvents);

    const sorted = [...docs].sort((a, b) => (b.clicks ?? 0) - (a.clicks ?? 0)).slice(0, 5);

    const baseUrl = "http://localhost:5000";

    const topUrls = sorted.map((doc) => {
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
        lastVisitedAt: (doc as any).lastVisitedAt ? new Date((doc as any).lastVisitedAt).toISOString() : null,
        qrCode: doc.qrCode ?? null,
        isExpired,
      };
    });

    res.json({ totalUrls, totalClicks, activeUrls, expiredUrls, topUrls, clicksByDay });
  } catch (err) {
    req.log.error({ err }, "GetDashboardAnalytics error");
    res.status(500).json({ error: "Server error" });
  }
}
