CREATE TABLE `fit_checks` (
	`post` text PRIMARY KEY NOT NULL,
	`lat` integer NOT NULL,
	`lon` integer NOT NULL,
	`tag` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`post`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `fit_checks_area` ON `fit_checks` (`lat`,`lon`);--> statement-breakpoint
CREATE INDEX `fit_checks_expiry` ON `fit_checks` (`expires`);