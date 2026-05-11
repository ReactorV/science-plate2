import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { authUser } from "./auth";

export const interactionRule = sqliteTable("interaction_rule", {
  id: text("id").primaryKey(),
  version: text("version").notNull(),
  triggerKind: text("trigger_kind").notNull(),
  paramsJson: text("params_json"),
  effectKind: text("effect_kind").notNull(),
  evidenceRefsJson: text("evidence_refs_json"),
});

export const evidencePack = sqliteTable("evidence_pack", {
  id: text("id").primaryKey(),
  version: text("version").notNull(),
  effectiveFrom: text("effective_from").notNull(),
  changelogMd: text("changelog_md"),
});

export const auditLog = sqliteTable("audit_log", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => authUser.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  calculationHash: text("calculation_hash"),
  evidencePackVersion: text("evidence_pack_version"),
  ts: integer("ts", { mode: "timestamp" }).notNull(),
});
