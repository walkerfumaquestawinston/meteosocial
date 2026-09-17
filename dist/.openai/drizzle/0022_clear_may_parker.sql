CREATE TABLE `daily_answers` (
	`device` text NOT NULL,
	`day` text NOT NULL,
	`question` text NOT NULL,
	`actor` text NOT NULL,
	`answer` text NOT NULL,
	`updated` integer NOT NULL,
	PRIMARY KEY(`device`, `day`)
);
--> statement-breakpoint
CREATE INDEX `daily_answer_question` ON `daily_answers` (`question`);--> statement-breakpoint
CREATE INDEX `daily_answer_day` ON `daily_answers` (`day`);--> statement-breakpoint
CREATE TABLE `daily_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`zone` text NOT NULL,
	`day` text NOT NULL,
	`topic` text NOT NULL,
	`timezone` text NOT NULL,
	`opens` integer NOT NULL,
	`expires` integer NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_question_zone_day` ON `daily_questions` (`zone`,`day`);--> statement-breakpoint
CREATE INDEX `daily_question_expiry` ON `daily_questions` (`expires`);