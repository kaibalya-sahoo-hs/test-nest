import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();
export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [join(process.cwd(), '**/*.entity{.ts,.js}')],
  migrations: [join(process.cwd() ,'src/db/migrations/*.ts')],
});
