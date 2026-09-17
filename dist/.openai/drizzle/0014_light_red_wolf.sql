CREATE TABLE `sky_confirmations` (
	`report` text NOT NULL,
	`device` text NOT NULL,
	`actor` text NOT NULL,
	`created` integer NOT NULL,
	PRIMARY KEY(`report`, `device`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sky_confirm_actor` ON `sky_confirmations` (`report`,`actor`);