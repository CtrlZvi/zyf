ALTER TABLE accounts ADD `external_id` text;--> statement-breakpoint
CREATE INDEX `external_id_idx` ON `accounts` (`external_id`);