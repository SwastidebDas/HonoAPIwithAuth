import * as schema from "./schema.ts"
import { defineRelations } from "drizzle-orm"

export const relations = defineRelations(schema,r=>({
    ApiKeyTable:{
        user: r.one.UserTable({
            from: r.ApiKeyTable.userId,
            to: r.UserTable.id,
        })
    },
    UserTable:{
        apiKeys: r.many.ApiKeyTable()
    }
}))