CREATE TABLE `mentoring_analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` varchar(64) NOT NULL,
	`ajudas` text NOT NULL,
	`oportunidades` text NOT NULL,
	`riscos` text NOT NULL,
	`sintese` text NOT NULL,
	`fullAnalysis` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mentoring_analyses_id` PRIMARY KEY(`id`)
);
