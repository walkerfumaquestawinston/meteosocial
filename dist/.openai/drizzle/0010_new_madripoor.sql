CREATE TABLE `hail_details` (
	`post` text PRIMARY KEY NOT NULL,
	`observed` integer NOT NULL,
	`size` text DEFAULT 'unknown' NOT NULL,
	`ended` integer,
	FOREIGN KEY (`post`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `hail_watches` (
	`user` text NOT NULL,
	`slot` integer NOT NULL,
	`name` text NOT NULL,
	`lat` integer NOT NULL,
	`lon` integer NOT NULL,
	`radius` integer NOT NULL,
	`created` integer NOT NULL,
	PRIMARY KEY(`user`, `slot`)
);
