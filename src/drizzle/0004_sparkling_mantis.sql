CREATE TABLE `guestbook` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`page_id` integer NOT NULL,
	`name` text NOT NULL,
	`message` text NOT NULL,
	`parent_id` integer,
	`likes_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `guestbook_likes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`guestbook_id` integer NOT NULL,
	`session_id` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`guestbook_id`) REFERENCES `guestbook`(`id`) ON UPDATE no action ON DELETE cascade
);
