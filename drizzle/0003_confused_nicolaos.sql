CREATE TABLE `assessments` (
	`post` text PRIMARY KEY NOT NULL,
	`result` text NOT NULL,
	`model` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `memberships` (
	`user` text PRIMARY KEY NOT NULL,
	`clan` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `memberships_clan` ON `memberships` (`clan`);--> statement-breakpoint
CREATE TABLE `shelters` (
	`id` text PRIMARY KEY NOT NULL,
	`author` text NOT NULL,
	`name` text NOT NULL,
	`city` text NOT NULL,
	`lat` text NOT NULL,
	`lon` text NOT NULL,
	`details` text NOT NULL,
	`created` integer NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `shelters_date` ON `shelters` (`created`);--> statement-breakpoint
CREATE TABLE `translations` (
	`post` text NOT NULL,
	`locale` text NOT NULL,
	`text` text NOT NULL,
	`model` text NOT NULL,
	`created` integer NOT NULL,
	PRIMARY KEY(`post`, `locale`)
);
