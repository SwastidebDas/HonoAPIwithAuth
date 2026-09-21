import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import z from "zod";
import { db } from "../db/db.ts";
import { AuthorTable } from "../db/schema.ts";
import { eq } from "drizzle-orm";

const app = new Hono();

type Author = {
    id: string;
    name: string;
    birthday?: Date;
};

const createAuthorSchema= z.object({
    name: z.string().min(1), 
    birthday: z.coerce.date().optional()
});

const updateAuthorSchema= z.object({
    name: z.string().min(1).optional(), 
    birthday: z.coerce.date().nullable().optional()
});

app.get("/",async (c)=>{
    const authors= await db.query.AuthorTable.findMany()
    return c.json(authors);
});

app.get("/:id",async (c)=>{
    const id=c.req.param("id");
    const author= await db.query.AuthorTable.findFirst({where : {id}})
    if(author==null)
        {
            return c.json({error: "User not Found"},404);
        }    
    return c.json(author);
});

// the sValidator is a kind of a middleware that exposes the validated data to the hono context c
app.post("/",sValidator("json",createAuthorSchema), async(c)=>{
    const data = c.req.valid("json");
    const newAuthor=await db.insert(AuthorTable).values(data).returning();
    return c.json(newAuthor,201);
});

app.put("/:id",sValidator("json",updateAuthorSchema),async (c)=>{
    const data= c.req.valid("json");
    const id= c.req.param("id");
    const currAuthor = await db.update(AuthorTable).set(data).where(eq(AuthorTable.id,id)).returning();

    if(currAuthor==null)
        {
            return c.json({error: "User not Found"},404);
        }
    return c.json(currAuthor,201);
});

app.delete("/:id",async (c)=>{
    const id= c.req.param("id");
    await db.delete(AuthorTable).where(eq(AuthorTable.id,id))
    return c.body(null,204);
});
export default app;