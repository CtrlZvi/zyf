ALTER TABLE `accounts` RENAME COLUMN `internal` TO `external`;
--> statement-breakpoint
UPDATE `accounts` SET `external` = NOT external;