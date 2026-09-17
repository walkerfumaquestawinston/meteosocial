CREATE TABLE `event_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`city` text NOT NULL,
	`lat` integer NOT NULL,
	`lon` integer NOT NULL,
	`day` text NOT NULL,
	`creator` text NOT NULL,
	`token` text NOT NULL,
	`created` integer NOT NULL,
	`expires` integer NOT NULL,
	`baseline` text DEFAULT '' NOT NULL,
	`changed` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `event_members` (
	`group` text NOT NULL,
	`actor` text NOT NULL,
	PRIMARY KEY(`group`, `actor`)
);
--> statement-breakpoint
CREATE TABLE `human_votes` (
	`actor` text PRIMARY KEY NOT NULL,
	`lat` integer NOT NULL,
	`lon` integer NOT NULL,
	`cold` integer NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `morning_forecasts` (
	`zone` text NOT NULL,
	`day` text NOT NULL,
	`captured` integer NOT NULL,
	`payload` text NOT NULL,
	PRIMARY KEY(`zone`, `day`)
);
--> statement-breakpoint
CREATE TABLE `public_zones` (
	`slug` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`lat` integer NOT NULL,
	`lon` integer NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `zone_questions` ADD `topic` text DEFAULT 'school' NOT NULL;