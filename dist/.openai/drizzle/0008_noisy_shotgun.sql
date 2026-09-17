CREATE TABLE `capture_tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`city` text NOT NULL,
	`created` integer NOT NULL,
	`expires` integer NOT NULL,
	`used` integer DEFAULT 0 NOT NULL,
	`hash` text
);
--> statement-breakpoint
CREATE INDEX `capture_expiry` ON `capture_tickets` (`expires`);--> statement-breakpoint
CREATE INDEX `capture_owner` ON `capture_tickets` (`user`,`created`);