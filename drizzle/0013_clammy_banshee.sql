CREATE TABLE `dpc_bulletins` (
	`day` text PRIMARY KEY NOT NULL,
	`snapshot` text NOT NULL,
	`issued` text NOT NULL,
	`source` text NOT NULL,
	`checked` integer NOT NULL,
	`attempted` integer NOT NULL,
	`failed` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `dpc_zones` (
	`snapshot` text NOT NULL,
	`slot` integer NOT NULL,
	`geometry` text NOT NULL,
	PRIMARY KEY(`snapshot`, `slot`)
);
