import type { NextFunction, Request, Response } from "express";
import { TooManyRequestsError } from "../errors/appErrors.js";

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const MAX_REQUESTS = 100;
const CLEANUP_INTERVAL = 60 * 60 * 1000;

interface RateLimitRecord {
	count: number;
	windowStart: number;
}

const requestCount = new Map<string, RateLimitRecord>();

setInterval(() => {
	const now = Date.now();
	for (const [ip, record] of requestCount) {
		if (now - record.windowStart > FIFTEEN_MINUTES) {
			requestCount.delete(ip);
		}
	}
}, CLEANUP_INTERVAL);

const rateLimiter = (req: Request, _res: Response, next: NextFunction) => {
	const now = Date.now();
	const ip = req.ip || req.socket.remoteAddress || "unknown";
	const record = requestCount.get(ip);

	if (!record) {
		requestCount.set(ip, { count: 1, windowStart: now });
		return next();
	}

	const timeSinceWindowStart = now - record.windowStart;

	if (timeSinceWindowStart > FIFTEEN_MINUTES) {
		requestCount.set(ip, { count: 1, windowStart: now });
		return next();
	}

	record.count += 1;

	if (record.count > MAX_REQUESTS) {
		throw new TooManyRequestsError();
	}

	next();
};

export default rateLimiter;
