import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema"; // 1. Importujemy nasz schemat

const sql = neon(process.env.DATABASE_URL!);

// 2. Przekazujemy schemat do Drizzle. 
// Dzięki temu zadziała 'db.query.users' i autocomplete!
export const db = drizzle(sql, { schema });