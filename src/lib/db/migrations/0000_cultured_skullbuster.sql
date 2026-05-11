CREATE TABLE `auth_account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `auth_session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_session_token_unique` ON `auth_session` (`token`);--> statement-breakpoint
CREATE TABLE `auth_user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_user_email_unique` ON `auth_user` (`email`);--> statement-breakpoint
CREATE TABLE `auth_verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `canonical_food` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`food_group` text,
	`processing_level` text,
	`locale` text,
	`completeness_score` real DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_canonical_food_name` ON `canonical_food` (`name`);--> statement-breakpoint
CREATE TABLE `food_nutrient_value` (
	`food_variant_id` text NOT NULL,
	`nutrient_id` text NOT NULL,
	`amount` integer NOT NULL,
	`derivation` text,
	`analytical_flag` integer DEFAULT false,
	PRIMARY KEY(`food_variant_id`, `nutrient_id`),
	FOREIGN KEY (`food_variant_id`) REFERENCES `food_variant`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`nutrient_id`) REFERENCES `nutrient`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_fnv_nutrient` ON `food_nutrient_value` (`nutrient_id`);--> statement-breakpoint
CREATE TABLE `food_source` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`license` text,
	`refresh_freq` text,
	`provenance_tier` text NOT NULL,
	`source_url` text
);
--> statement-breakpoint
CREATE TABLE `food_variant` (
	`id` text PRIMARY KEY NOT NULL,
	`canonical_food_id` text NOT NULL,
	`source_id` text NOT NULL,
	`brand` text,
	`raw_nutrients_json` text,
	`completeness_score` real DEFAULT 0 NOT NULL,
	`provenance_tier` text NOT NULL,
	FOREIGN KEY (`canonical_food_id`) REFERENCES `canonical_food`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_id`) REFERENCES `food_source`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_food_variant_canonical` ON `food_variant` (`canonical_food_id`);--> statement-breakpoint
CREATE TABLE `nutrient` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`name` text NOT NULL,
	`unit_canonical` text NOT NULL,
	`kind` text NOT NULL,
	`upper_limit_supported` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `nutrient_key_unique` ON `nutrient` (`key`);--> statement-breakpoint
CREATE TABLE `portion_unit` (
	`id` text PRIMARY KEY NOT NULL,
	`canonical_food_id` text NOT NULL,
	`gram_weight` integer NOT NULL,
	`household_label` text NOT NULL,
	`density_hint` real,
	FOREIGN KEY (`canonical_food_id`) REFERENCES `canonical_food`(`id`) ON UPDATE no action ON DELETE cascade
);
