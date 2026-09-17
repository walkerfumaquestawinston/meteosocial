CREATE TABLE `avatars` (
	`user` text PRIMARY KEY NOT NULL,
	`bald` integer DEFAULT 1 NOT NULL,
	`equipped` text DEFAULT 'none' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `checkins` (
	`user` text PRIMARY KEY NOT NULL,
	`id` text NOT NULL,
	`city` text NOT NULL,
	`lat` integer NOT NULL,
	`lon` integer NOT NULL,
	`caption` text NOT NULL,
	`audio` text NOT NULL,
	`created` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `checkins_expires` ON `checkins` (`expires`);--> statement-breakpoint
CREATE TABLE `inventory` (
	`user` text NOT NULL,
	`item` text NOT NULL,
	`created` integer NOT NULL,
	PRIMARY KEY(`user`, `item`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`invitee` text PRIMARY KEY NOT NULL,
	`inviter` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `referrals_inviter` ON `referrals` (`inviter`);