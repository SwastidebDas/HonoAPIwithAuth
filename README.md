# Hono API with Authentication

A small REST API built while learning **Hono, TypeScript, PostgreSQL, Drizzle ORM, Zod, and API authentication**.

This project is primarily a **learning project**, not a production-ready API. The main goal was to understand how the different pieces of a modern TypeScript backend fit together.

## Tech Stack

* **TypeScript** — application language
* **Hono** — lightweight web framework
* **Node.js** — runtime
* **PostgreSQL** — database
* **Drizzle ORM** — database access and schema definition
* **Drizzle Kit** — database migrations/schema management
* **Zod** — request validation
* **tsx** — running TypeScript directly during development
* **Docker** — running PostgreSQL locally

Hono is designed around Web Standards and supports multiple JavaScript runtimes, including Node.js.

---

## What I Was Trying to Learn

The project was created to understand the basic flow of a backend application:

```text
Client
  |
  | HTTP Request
  v
Hono Route
  |
  v
Validation (Zod)
  |
  v
Business Logic
  |
  v
Drizzle ORM
  |
  v
PostgreSQL
```

For authenticated requests, authentication is added to this flow:

```text
Client
  |
  | Request + Authentication
  v
Hono
  |
  v
Authentication
  |
  | valid
  v
Route
  |
  v
Validation
  |
  v
Database
```

The project also helped me understand how Hono routes can be separated into different route modules and mounted onto the main application. Hono supports this kind of routing through `app.route()`.

---

# Project Structure

The project is roughly organized around the following idea:

```text
my-app/
│
├── src/
│   ├── index.ts
│   │
│   ├── data/
│   │   └── env.ts
│   │
│   ├── routes/
│   │   └── auth.ts
│   │
│   └── ...
│
├── drizzle.config.ts
├── package.json
├── tsconfig.json
├── docker-compose.yml
├── .env
└── ...
```

### `src/index.ts`

The main entry point of the application.

This is where the Hono application is created and routes are registered.

Conceptually:

```ts
const app = new Hono()

app.route('/authors', authRoutes)
```

The important thing to remember is:

> `index.ts` is the place where the application is assembled.

---

### `src/routes/`

Contains the API routes.

Instead of putting every endpoint inside `index.ts`, routes can be separated into modules.

For example:

```ts
const authRoutes = new Hono()

authRoutes.get(...)
authRoutes.post(...)

export default authRoutes
```

Then the main application can mount them:

```ts
app.route('/authors', authRoutes)
```

This keeps the entry point smaller as the application grows.

---

### `src/data/env.ts`

Used for environment-related configuration.

The basic idea is:

```text
.env
  ↓
environment variables
  ↓
application configuration
  ↓
database / other services
```

Secrets such as database credentials should not be hardcoded into TypeScript files.

---

# Database

The project uses **PostgreSQL**.

PostgreSQL can be started locally using Docker.

The application connects to PostgreSQL through Drizzle ORM.

The general flow is:

```text
Hono
  ↓
Drizzle ORM
  ↓
PostgreSQL
```

Drizzle provides the TypeScript interface used by the application to work with the database instead of writing every database operation manually.

---

# Database Schema

One of the tables used while learning Drizzle was an author-style table.

Conceptually:

```text
Author
-------------------------
id
name
birthday
createdAt
```

The ID is UUID-based.

`birthday` is optional, and `createdAt` gets a default timestamp from the database/ORM configuration.

A simplified schema looks like:

```ts
export const AuthorTable = pgTable('authors', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    birthday: timestamp('birthday', {
        withTimezone: true,
    }),
    createdAt: timestamp('created_at', {
        withTimezone: true,
    }).defaultNow(),
})
```

The exact schema in the project may change as I continue learning.

---

# Request Validation

The project uses **Zod** to validate incoming request data.

For example, a book creation schema can look like:

```ts
const createBookSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    publishDate: z.coerce.date().optional(),
    pageCount: z.number().int().positive().optional(),
    authorId: z.uuid(),
})
```

The important idea is:

```text
Incoming JSON
      ↓
Zod schema
      ↓
Valid?
  /       \
yes       no
 |         |
route     error
```

This prevents the route from blindly trusting data coming from the client.

---

# Authentication

Authentication is another major learning goal of this project.

The important distinction to remember is:

### Authentication

> "Who are you?"

### Authorization

> "Are you allowed to do this?"

This project focuses primarily on understanding authentication and protecting API operations.

The authentication-related code is separated from the main application so that authentication logic does not need to be mixed into every route.

---

# API Routes

The API is organized around HTTP routes.

Typical REST operations follow this pattern:

| HTTP Method     | Purpose     |
| --------------- | ----------- |
| `GET`           | Read data   |
| `POST`          | Create data |
| `PUT` / `PATCH` | Update data |
| `DELETE`        | Delete data |

For example:

```text
GET     /authors
GET     /authors/:id
POST    /authors
PATCH   /authors/:id
DELETE  /authors/:id
```

The exact endpoints should be checked against the current source code because this project is still evolving.

---

# Validation Flow

A useful mental model for a request is:

```text
HTTP Request
     |
     v
Hono Route
     |
     v
Authentication
     |
     v
Request Validation
     |
     v
Business Logic
     |
     v
Drizzle
     |
     v
PostgreSQL
     |
     v
JSON Response
```

If something goes wrong:

```text
Request
  |
  +--> Authentication failure
  |
  +--> Validation failure
  |
  +--> Database failure
  |
  +--> Successful response
```

This is the overall backend architecture I want to remember from this project.

---

# Environment Variables

The project uses environment variables for configuration.

Create a `.env` file in the project root.

Example:

```env
DATABASE_URL=your_postgres_connection_string
```

Do **not** commit the real `.env` file to GitHub.

Use `.env.example` if you want to document which variables are required:

```env
DATABASE_URL=
```

Then another developer can create their own `.env`.

---

# Running the Project

## 1. Clone the repository

```bash
git clone https://github.com/SwastidebDas/HonoAPIwithAuth.git
```

Move into the project:

```bash
cd HonoAPIwithAuth
```

If the application is inside `my-app`:

```bash
cd my-app
```

---

## 2. Install dependencies

Using npm:

```bash
npm install
```

---

## 3. Start PostgreSQL

The project uses Docker for the local PostgreSQL database.

```bash
docker compose up -d
```

Check that the container is running:

```bash
docker ps
```

---

## 4. Configure environment variables

Create:

```text
.env
```

and add the required database configuration.

---

## 5. Run the development server

```bash
npm run dev
```

The development setup uses `tsx` so TypeScript can be executed directly during development.

---

## 6. Build / type-check

TypeScript can be checked/compiled with:

```bash
npm run build
```

or the corresponding TypeScript command configured in `package.json`.

The important distinction is:

```text
tsx
 |
 +-- useful for development
 +-- executes TypeScript

tsc
 |
 +-- TypeScript compiler
 +-- type checking / compilation
```

---

# Drizzle

There are two things that are easy to confuse:

### `drizzle-orm`

Used by the application itself.

Example:

```text
Application
    ↓
drizzle-orm
    ↓
PostgreSQL
```

### `drizzle-kit`

Used for database development tasks such as generating and running migrations.

Think of it as a development/CLI tool around Drizzle.

```text
Schema changes
      ↓
Drizzle Kit
      ↓
Migration
      ↓
PostgreSQL
```

---

# Useful Commands

The exact scripts are defined in `package.json`.

Typical commands used while developing this project are:

```bash
npm install
npm run dev
npm run build
```

For Docker:

```bash
docker compose up -d
docker compose down
```

For Drizzle, use the scripts defined in `package.json`, for example:

```bash
npm run db:generate
npm run db:migrate
```

if those scripts are configured.

---

# Things I Learned From This Project

This project was mainly useful for understanding the following concepts:

### Hono

* Creating a Hono application
* Routes
* Route groups
* `app.route()`
* Request/response handling
* Middleware
* Hono `Context`

### TypeScript

* ESM imports/exports
* TypeScript configuration
* `tsc`
* `tsx`
* Environment configuration
* Type safety

### Zod

* Creating schemas
* Optional fields
* Type validation
* `z.coerce`
* UUID validation
* Validating request bodies

### PostgreSQL

* Connecting an application to PostgreSQL
* Tables
* UUIDs
* Timestamps
* Basic queries

### Drizzle

* Defining database schemas
* Querying tables
* ORM vs database
* Drizzle Kit
* Migrations

### Authentication

* Authentication vs authorization
* Protecting routes
* Authentication middleware
* Getting authenticated user information

---

# What This Project Is NOT

This is important.

This project should **not** currently be considered production-ready.

It was created primarily for learning.

Things that would normally need more work before production include:

* Comprehensive error handling
* Proper logging
* Automated tests
* Better project-wide architecture
* Rate limiting
* Security hardening
* Input validation across every endpoint
* Production database configuration
* Database migration strategy
* Monitoring
* CI/CD
* API documentation
* Better authentication/authorization design
* Secret management
* Production deployment configuration

So the purpose of this repository is:

> **Learn first. Make it production-ready later.**

---

# Important Concepts to Revisit Later

When coming back to this project, these are the areas worth reviewing:

```text
1. How Hono routing works
        ↓
2. How middleware works
        ↓
3. How authentication works
        ↓
4. How Zod validates requests
        ↓
5. How Hono passes validated data to handlers
        ↓
6. How Drizzle talks to PostgreSQL
        ↓
7. How migrations work
        ↓
8. How database errors are handled
        ↓
9. How authentication and authorization differ
        ↓
10. How to turn this into a production API
```

---

# Useful Mental Model

The most important thing to remember from this project is:

```text
                 CLIENT
                   |
                   | HTTP
                   v
             +-----------+
             |   Hono    |
             +-----------+
                   |
             Middleware
                   |
          +--------+--------+
          |                 |
   Authentication       Other middleware
          |
          v
       Routing
          |
          v
      Validation
         (Zod)
          |
          v
     Route Handler
          |
          v
    Drizzle ORM
          |
          v
     PostgreSQL
```

Each layer has a different responsibility.

That separation is more important than the specific code in this small project.

---

# Future Improvements

If I come back to this project later, possible improvements are:

* [ ] Add proper centralized error handling
* [ ] Add authentication tests
* [ ] Add API integration tests
* [ ] Add more complete CRUD operations
* [ ] Improve folder structure
* [ ] Add authorization/roles
* [ ] Add pagination
* [ ] Add better database constraints
* [ ] Add API documentation
* [ ] Add request logging
* [ ] Add automated testing
* [ ] Add Docker configuration for the complete application
* [ ] Add CI using GitHub Actions
* [ ] Deploy the API
* [ ] Revisit the authentication implementation
* [ ] Make the project production-ready

---

# Resources

* [Hono Documentation](https://hono.dev/?utm_source=chatgpt.com)
* [Hono GitHub Repository](https://github.com/honojs/hono?utm_source=chatgpt.com)
* [Drizzle ORM Documentation](https://orm.drizzle.team/?utm_source=chatgpt.com)
* [Zod Documentation](https://zod.dev/?utm_source=chatgpt.com)
* [PostgreSQL Documentation](https://www.postgresql.org/docs/?utm_source=chatgpt.com)

---

## Final Note

This repository is intentionally a **learning project**.

The code may not represent the architecture I would use for a large production application. The purpose is to keep a record of what I learned about building a TypeScript API with Hono, PostgreSQL, Drizzle, Zod, and authentication.

When I revisit this project later, I should focus less on remembering the exact syntax and more on understanding:

```text
Request
  ↓
Middleware
  ↓
Authentication
  ↓
Validation
  ↓
Business Logic
  ↓
Database
  ↓
Response
```

That is the main thing this project was built to teach me.
