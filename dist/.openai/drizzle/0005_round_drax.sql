CREATE TABLE `city_challenge_entries` (
	`post` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`week` text NOT NULL,
	`day` text NOT NULL,
	`city` text NOT NULL,
	FOREIGN KEY (`post`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `challenge_user_day` ON `city_challenge_entries` (`user`,`week`,`day`);--> statement-breakpoint
CREATE INDEX `challenge_week_city` ON `city_challenge_entries` (`week`,`city`);--> statement-breakpoint
CREATE TABLE `city_challenge_members` (
	`user` text NOT NULL,
	`week` text NOT NULL,
	`city` text NOT NULL,
	PRIMARY KEY(`user`, `week`)
);
--> statement-breakpoint
CREATE INDEX `challenge_members_week` ON `city_challenge_members` (`week`,`city`);