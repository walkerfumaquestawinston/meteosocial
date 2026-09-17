CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`post` text NOT NULL,
	`author` text NOT NULL,
	`text` text NOT NULL,
	`created` integer NOT NULL,
	FOREIGN KEY (`post`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `comments_post` ON `comments` (`post`);--> statement-breakpoint
CREATE TABLE `flags` (
	`user` text NOT NULL,
	`post` text NOT NULL,
	`reason` text NOT NULL,
	`created` integer NOT NULL,
	PRIMARY KEY(`user`, `post`)
);
--> statement-breakpoint
CREATE TABLE `limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `links` (
	`user` text NOT NULL,
	`target` text NOT NULL,
	`kind` text NOT NULL,
	PRIMARY KEY(`user`, `target`, `kind`)
);
--> statement-breakpoint
CREATE INDEX `links_target` ON `links` (`target`,`kind`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`author` text NOT NULL,
	`text` text NOT NULL,
	`city` text NOT NULL,
	`kind` text NOT NULL,
	`photo` text,
	`created` integer NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `posts_date` ON `posts` (`created`);--> statement-breakpoint
CREATE INDEX `posts_author` ON `posts` (`author`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
