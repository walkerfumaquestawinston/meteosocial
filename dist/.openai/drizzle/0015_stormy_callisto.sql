CREATE TABLE `actor_devices` (
	`actor` text NOT NULL,
	`device` text NOT NULL,
	PRIMARY KEY(`actor`, `device`)
);
--> statement-breakpoint
CREATE TABLE `moderation_bans` (
	`key` text PRIMARY KEY NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `moderation_sessions` (
	`token` text PRIMARY KEY NOT NULL,
	`credential` text NOT NULL,
	`expires` integer NOT NULL
);
