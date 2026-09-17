CREATE TABLE `forecast_copies` (
	`id` text PRIMARY KEY NOT NULL,
	`location` text NOT NULL,
	`slot` integer NOT NULL,
	`captured` integer NOT NULL,
	`timezone` text NOT NULL,
	`previous_id` text,
	`changed` integer NOT NULL,
	`changes` text NOT NULL,
	`payload` text NOT NULL,
	`hash` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `forecast_copies_location_slot` ON `forecast_copies` (`location`,`slot`);--> statement-breakpoint
CREATE INDEX `forecast_copies_location_captured` ON `forecast_copies` (`location`,`captured`);