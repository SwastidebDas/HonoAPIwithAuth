CREATE TYPE "userRole" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"email" text NOT NULL UNIQUE,
	"passwordHash" text NOT NULL,
	"role" "userRole" DEFAULT 'user'::"userRole" NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
