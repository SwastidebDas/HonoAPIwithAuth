import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import z from "zod";
import { db } from "../db/db.ts";
import { UserTable,ApiKeyTable } from "../db/schema.ts";
import { and , eq, SQL, sql } from "drizzle-orm";
import {hashPassword , generateApiKey} from "../lib/crypto.ts"
import {verifyPassword} from "../lib/crypto.ts"
import { jwt,sign } from "hono/jwt";
import {env} from "../data/env.ts"

type JwtEnv={
  Variables:{
    jwtPayload:{sub:string,email:string,exp:number}
  }
}

const createKeySchema= z.object({
  name: z.string().min(1).max(255)
})

const app = new Hono<JwtEnv>();
app.use(jwt({secret:env.JWT_SECRET,alg: "HS256"}))

app.get("/", async (c)=>{
  const {sub:userId} = c.var.jwtPayload;

  const keys= await db.query.ApiKeyTable.findMany({
    where: {userId},
    columns:{
      id:true,
      name:true,
      keyPrefix:true,
      createdAt:true
    },
  })
  return c.json(keys);
})

app.post("/",sValidator("json",createKeySchema),async (c)=>{
  const {sub:userId}=c.var.jwtPayload;
  const {name} = await c.req.valid("json");
  const {raw,hash,prefix} = generateApiKey();
  
  const [apiKey]=await db.insert(ApiKeyTable).values({ name, userId, keyHash: hash, keyPrefix: prefix }).returning({ id: ApiKeyTable.id });

  return c.json({id:apiKey.id,key: raw},201);
})

//delete User
app.delete("/:id", async c => {

  const { sub: userId } = c.var.jwtPayload
  const id = c.req.param("id")

  console.log("userId:", userId)
  console.log("apiKeyId:", id)

  await db
    .delete(ApiKeyTable)
    .where(
      and(
        eq(ApiKeyTable.id, id),
        eq(ApiKeyTable.userId, userId)
      )
    )

  return c.body(null, 204)
})
export default app;


