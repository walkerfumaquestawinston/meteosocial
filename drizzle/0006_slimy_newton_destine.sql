CREATE TABLE `weather_room_flags` (
	`user` text NOT NULL,
	`message` text NOT NULL,
	`reason` text NOT NULL,
	`created` integer NOT NULL,
	PRIMARY KEY(`user`, `message`)
);
--> statement-breakpoint
CREATE TABLE `weather_room_members` (
	`user` text NOT NULL,
	`room` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`user`, `room`)
);
--> statement-breakpoint
CREATE INDEX `weather_room_member_expiry` ON `weather_room_members` (`expires`);--> statement-breakpoint
CREATE TABLE `weather_room_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`room` text NOT NULL,
	`user` text NOT NULL,
	`text` text NOT NULL,
	`created` integer NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `weather_room_messages_order` ON `weather_room_messages` (`room`,`created`);--> statement-breakpoint
CREATE TABLE `weather_rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`city` text NOT NULL,
	`created` integer NOT NULL,
	`expires` integer NOT NULL,
	`source_time` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `weather_rooms_expiry` ON `weather_rooms` (`expires`);