import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import z from "zod";
const app = new Hono();
const authors = [
    {
        id: "1",
        name: "Swastideb",
        birthdate: new Date()
    },
    {
        id: "2",
        name: "Rohan",
        birthdate: new Date()
    },
    {
        id: "3",
        name: "Prayas",
        birthdate: new Date()
    }
];
const createAuthorSchema = z.object({
    name: z.string().min(1),
    birthdate: z.coerce.date().optional()
});
const updateAuthorSchema = z.object({
    name: z.string().min(1).optional(),
    birthdate: z.coerce.date().nullable().optional()
});
app.get("/", (c) => {
    return c.json(authors);
});
app.get("/:id", (c) => {
    const id = c.req.param("id");
    const author = authors.find(x => x.id == id);
    if (author == null) {
        return c.json({ error: "User not Found" }, 404);
    }
    return c.json(author);
});
// the sValidator is a kind of a middleware that exposes the validated data to the hono context c
app.post("/", sValidator("json", createAuthorSchema), (c) => {
    const data = c.req.valid("json");
    const newAuthor = { id: crypto.randomUUID(), ...data };
    authors.push(newAuthor);
    return c.json(newAuthor, 201);
});
app.put("/:id", sValidator("json", updateAuthorSchema), (c) => {
    const data = c.req.valid("json");
    const id = c.req.param("id");
    const currAuthor = authors.find(x => x.id == id);
    if (currAuthor == null) {
        return c.json({ error: "User not Found" }, 404);
    }
    if (data.name !== undefined) {
        currAuthor.name = data.name;
    }
    if (data.birthdate !== undefined && data.birthdate !== null) {
        currAuthor.birthdate = data.birthdate;
    }
    return c.json(currAuthor, 201);
});
app.delete("/:id", (c) => {
    const id = c.req.param("id");
    const index = authors.findIndex(x => x.id == id);
    if (index === -1) {
        return c.json({ error: "User not Found" }, 404);
    }
    authors.splice(index, 1);
    return c.body(null, 204);
});
export default app;
