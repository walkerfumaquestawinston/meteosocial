CREATE TABLE `sky_actors` (
	`id` text PRIMARY KEY NOT NULL,
	`guest` integer DEFAULT 0 NOT NULL,
	`first_report` text,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sky_blocks` (
	`actor` text NOT NULL,
	`target` text NOT NULL,
	PRIMARY KEY(`actor`, `target`)
);
--> statement-breakpoint
CREATE TABLE `sky_evidence` (
	`report` text NOT NULL,
	`witness` text NOT NULL,
	`author` text NOT NULL,
	`agrees` integer NOT NULL,
	`created` integer NOT NULL,
	PRIMARY KEY(`report`, `witness`)
);
--> statement-breakpoint
CREATE INDEX `sky_evidence_author` ON `sky_evidence` (`author`);--> statement-breakpoint
CREATE TABLE `sky_flags` (
	`actor` text NOT NULL,
	`report` text NOT NULL,
	`reason` text NOT NULL,
	`created` integer NOT NULL,
	PRIMARY KEY(`actor`, `report`)
);
--> statement-breakpoint
CREATE TABLE `sky_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`author` text NOT NULL,
	`lat` integer NOT NULL,
	`lon` integer NOT NULL,
	`city` text NOT NULL,
	`country` text,
	`level` integer NOT NULL,
	`kind` text NOT NULL,
	`options` text DEFAULT '[]' NOT NULL,
	`photo` text,
	`created` integer NOT NULL,
	`expires` integer NOT NULL,
	`hidden` integer DEFAULT 0 NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `sky_active` ON `sky_reports` (`expires`,`created`);--> statement-breakpoint
CREATE INDEX `sky_author` ON `sky_reports` (`author`,`created`);--> statement-breakpoint
CREATE INDEX `sky_area` ON `sky_reports` (`lat`,`lon`);