CREATE TABLE `feedback_notices` (
	`id` text PRIMARY KEY NOT NULL,
	`actor` text NOT NULL,
	`report` text NOT NULL,
	`created` integer NOT NULL,
	`pushed` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `feedback_report` ON `feedback_notices` (`report`);--> statement-breakpoint
CREATE INDEX `feedback_actor` ON `feedback_notices` (`actor`,`created`);--> statement-breakpoint
CREATE TABLE `feedback_push_prefs` (
	`actor` text PRIMARY KEY NOT NULL,
	`enabled` integer DEFAULT 0 NOT NULL
);
