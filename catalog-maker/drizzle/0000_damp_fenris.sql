CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`parent_id` text,
	`visible` integer DEFAULT 1 NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `fixtures` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text NOT NULL,
	`payload` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`external_id` text NOT NULL,
	`source` text NOT NULL,
	`name` text NOT NULL,
	`sku` text NOT NULL,
	`price` real NOT NULL,
	`currency` text DEFAULT 'INR' NOT NULL,
	`description` text NOT NULL,
	`category_id` text NOT NULL,
	`available` integer NOT NULL,
	`images` text NOT NULL,
	`variants` text NOT NULL,
	`url` text NOT NULL,
	`metadata` text NOT NULL,
	`fingerprint` text NOT NULL,
	`suppressed` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_source_external` ON `products` (`source`,`external_id`);--> statement-breakpoint
CREATE INDEX `products_category_visible` ON `products` (`category_id`,`suppressed`);--> statement-breakpoint
CREATE INDEX `products_source` ON `products` (`source`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sync_locks` (
	`source` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sync_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text NOT NULL,
	`status` text NOT NULL,
	`started_at` text NOT NULL,
	`finished_at` text,
	`added` integer DEFAULT 0 NOT NULL,
	`updated` integer DEFAULT 0 NOT NULL,
	`unchanged` integer DEFAULT 0 NOT NULL,
	`error` text
);
