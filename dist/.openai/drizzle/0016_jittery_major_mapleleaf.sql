CREATE TABLE `answer_notices` (
	`id` text PRIMARY KEY NOT NULL,
	`actor` text NOT NULL,
	`question` text NOT NULL,
	`created` integer NOT NULL,
	`seen` integer DEFAULT 0 NOT NULL,
	`pushed` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `notice_first_answer` ON `answer_notices` (`question`);--> statement-breakpoint
CREATE INDEX `notice_actor` ON `answer_notices` (`actor`,`created`);--> statement-breakpoint
CREATE TABLE `answer_push_prefs` (
	`actor` text PRIMARY KEY NOT NULL,
	`enabled` integer DEFAULT 0 NOT NULL,
	`later` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `answer_subscriptions` (
	`device` text PRIMARY KEY NOT NULL,
	`actor` text NOT NULL,
	`endpoint` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `subscription_actor` ON `answer_subscriptions` (`actor`);--> statement-breakpoint
CREATE TABLE `question_limits` (
	`actor` text PRIMARY KEY NOT NULL,
	`last` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `zone_answers` (
	`id` text PRIMARY KEY NOT NULL,
	`question` text NOT NULL,
	`author` text NOT NULL,
	`answer` text NOT NULL,
	`url` text DEFAULT '' NOT NULL,
	`created` integer NOT NULL,
	`hidden` integer DEFAULT 0 NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `answer_per_person` ON `zone_answers` (`question`,`author`);--> statement-breakpoint
CREATE INDEX `answers_question` ON `zone_answers` (`question`,`created`);--> statement-breakpoint
CREATE TABLE `zone_presence` (
	`actor` text PRIMARY KEY NOT NULL,
	`lat` integer NOT NULL,
	`lon` integer NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `zone_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`author` text NOT NULL,
	`city` text NOT NULL,
	`lat` integer NOT NULL,
	`lon` integer NOT NULL,
	`day` text NOT NULL,
	`created` integer NOT NULL,
	`expires` integer NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `questions_active` ON `zone_questions` (`expires`);--> statement-breakpoint
CREATE INDEX `questions_author` ON `zone_questions` (`author`,`created`);