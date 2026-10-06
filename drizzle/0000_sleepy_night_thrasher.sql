CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`lead_id` text NOT NULL,
	`type` text NOT NULL,
	`detail` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `activity_owner` ON `activities` (`owner`,`lead_id`);--> statement-breakpoint
CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`provider` text NOT NULL,
	`external_id` text NOT NULL,
	`name` text NOT NULL,
	`city` text NOT NULL,
	`country` text NOT NULL,
	`payload` text NOT NULL,
	`saved` integer DEFAULT 0 NOT NULL,
	`stage` text DEFAULT 'DESCOBERTO' NOT NULL,
	`do_not_contact` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	`version` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `lead_owner` ON `leads` (`owner`);--> statement-breakpoint
CREATE UNIQUE INDEX `lead_source` ON `leads` (`owner`,`provider`,`external_id`);--> statement-breakpoint
CREATE TABLE `location_choices` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`query` text NOT NULL,
	`payload` text NOT NULL,
	`expires_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scheduled_contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`lead_id` text NOT NULL,
	`due_at` text NOT NULL,
	`channel` text NOT NULL,
	`message` text NOT NULL,
	`done` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `schedule_owner` ON `scheduled_contacts` (`owner`,`due_at`);--> statement-breakpoint
CREATE TABLE `searches` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`cache_key` text NOT NULL,
	`input` text NOT NULL,
	`results` text NOT NULL,
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`count` integer NOT NULL,
	`new_count` integer NOT NULL,
	`missing_count` integer NOT NULL,
	`error` text,
	`estimated_credits` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `search_cache` ON `searches` (`owner`,`cache_key`,`expires_at`);--> statement-breakpoint
CREATE TABLE `settings` (
	`owner` text PRIMARY KEY NOT NULL,
	`weights` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `usage` (
	`provider` text NOT NULL,
	`period` text NOT NULL,
	`used` integer DEFAULT 0 NOT NULL,
	`last_at` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`provider`, `period`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL
);
