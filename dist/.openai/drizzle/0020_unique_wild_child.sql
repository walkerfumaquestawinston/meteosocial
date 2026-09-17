CREATE TABLE `event_notices` (
	`id` text PRIMARY KEY NOT NULL,
	`actor` text NOT NULL,
	`event` text NOT NULL,
	`created` integer NOT NULL,
	`seen` integer DEFAULT 0 NOT NULL,
	`pushed` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `event_notice_once` ON `event_notices` (`event`,`actor`);--> statement-breakpoint
CREATE INDEX `event_notice_actor` ON `event_notices` (`actor`,`seen`);--> statement-breakpoint
CREATE TABLE `event_push_prefs` (
	`actor` text PRIMARY KEY NOT NULL,
	`enabled` integer DEFAULT 0 NOT NULL
);
