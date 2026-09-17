CREATE TABLE `globe_snapshots` (
	`name` text PRIMARY KEY NOT NULL,
	`payload` text DEFAULT '' NOT NULL,
	`updated` integer DEFAULT 0 NOT NULL,
	`attempted` integer DEFAULT 0 NOT NULL,
	`lease` integer DEFAULT 0 NOT NULL
);
