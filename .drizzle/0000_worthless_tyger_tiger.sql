CREATE TABLE `accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`internal` integer NOT NULL,
	`url` text,
	`icon` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `human_identifier_idx` ON `accounts` (`name`,`type`);