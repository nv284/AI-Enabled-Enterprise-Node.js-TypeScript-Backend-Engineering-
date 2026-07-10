import { Request, Response, NextFunction } from "express";

/**
 * Toy "auth" — the owner is whatever `x-user-id` header the client sends.
 * DO NOT ship this in real code. It exists so freshers can focus on caching,
 * not on OAuth flows.
 */
export function fakeAuth(req: Request, _res: Response, next: NextFunction): void {
  const owner = req.header("x-user-id");
  (req as Request & { owner?: string }).owner = owner ?? "anon";
  next();
}

export function requireOwner(req: Request, res: Response, next: NextFunction): void {
  const owner = (req as Request & { owner?: string }).owner;
  if (!owner || owner === "anon") {
    res.status(401).json({ error: "auth_required", hint: "send x-user-id header" });
    return;
  }
  next();
}
