CREATE TABLE `reference_pack` (
	`id` text PRIMARY KEY NOT NULL,
	`authority` text NOT NULL,
	`geography` text NOT NULL,
	`version` text NOT NULL,
	`effective_from` text NOT NULL,
	`changelog_url` text
);
--> statement-breakpoint
CREATE TABLE `reference_value` (
	`pack_id` text NOT NULL,
	`nutrient_id` text NOT NULL,
	`sex` text NOT NULL,
	`age_min` integer NOT NULL,
	`age_max` integer NOT NULL,
	`life_stage` text DEFAULT 'adult',
	`value_type` text NOT NULL,
	`amount` integer NOT NULL,
	PRIMARY KEY(`pack_id`, `nutrient_id`, `sex`, `age_min`, `value_type`),
	FOREIGN KEY (`pack_id`) REFERENCES `reference_pack`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`nutrient_id`) REFERENCES `nutrient`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_ref_value_lookup` ON `reference_value` (`pack_id`,`nutrient_id`,`sex`,`age_min`,`age_max`);--> statement-breakpoint
CREATE TABLE `allergen_exclusion` (
	`user_id` text NOT NULL,
	`key` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `goal_profile` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`goal_type` text NOT NULL,
	`goal_rate_kg_per_week` real DEFAULT 0 NOT NULL,
	`kcal_target_mode` text DEFAULT 'auto',
	`macro_strategy` text DEFAULT 'protein_first',
	`valid_from` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `training_session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`sport_type` text NOT NULL,
	`start_time` text,
	`duration_min` integer NOT NULL,
	`intensity` text NOT NULL,
	`fuelling_priority` text,
	FOREIGN KEY (`user_id`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_profile` (
	`user_id` text PRIMARY KEY NOT NULL,
	`sex` text NOT NULL,
	`dob` text NOT NULL,
	`height_cm` real NOT NULL,
	`weight_kg` real NOT NULL,
	`dietary_pattern` text NOT NULL,
	`locale` text DEFAULT 'EU' NOT NULL,
	`reference_pack_id` text DEFAULT 'EFSA-2017' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reference_pack_id`) REFERENCES `reference_pack`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `day_plan` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`evidence_pack_version` text,
	`calculation_hash` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_day_plan_user_date` ON `day_plan` (`user_id`,`date`);--> statement-breakpoint
CREATE TABLE `meal` (
	`id` text PRIMARY KEY NOT NULL,
	`day_plan_id` text NOT NULL,
	`meal_type` text NOT NULL,
	`time` text NOT NULL,
	`name` text NOT NULL,
	`notes` text,
	FOREIGN KEY (`day_plan_id`) REFERENCES `day_plan`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_meal_day_plan` ON `meal` (`day_plan_id`);--> statement-breakpoint
CREATE TABLE `meal_item` (
	`id` text PRIMARY KEY NOT NULL,
	`meal_id` text NOT NULL,
	`food_variant_id` text NOT NULL,
	`portion_g` integer NOT NULL,
	`timing_offset_min` integer DEFAULT 0,
	FOREIGN KEY (`meal_id`) REFERENCES `meal`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`food_variant_id`) REFERENCES `food_variant`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_meal_item_meal` ON `meal_item` (`meal_id`);--> statement-breakpoint
CREATE TABLE `supplement_entry` (
	`id` text PRIMARY KEY NOT NULL,
	`day_plan_id` text NOT NULL,
	`time` text NOT NULL,
	`nutrient_id` text NOT NULL,
	`amount` integer NOT NULL,
	`source_text` text,
	FOREIGN KEY (`day_plan_id`) REFERENCES `day_plan`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`action` text NOT NULL,
	`calculation_hash` text,
	`evidence_pack_version` text,
	`ts` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `evidence_pack` (
	`id` text PRIMARY KEY NOT NULL,
	`version` text NOT NULL,
	`effective_from` text NOT NULL,
	`changelog_md` text
);
--> statement-breakpoint
CREATE TABLE `interaction_rule` (
	`id` text PRIMARY KEY NOT NULL,
	`version` text NOT NULL,
	`trigger_kind` text NOT NULL,
	`params_json` text,
	`effect_kind` text NOT NULL,
	`evidence_refs_json` text
);
