CREATE TABLE `bigfive_profiles` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`responseTimestamp` varchar(64) NOT NULL,
	`rawResponses` json NOT NULL,
	`dimensions` json NOT NULL,
	`combinationInsights` json NOT NULL,
	`recommendations` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bigfive_profiles_id` PRIMARY KEY(`id`)
);
