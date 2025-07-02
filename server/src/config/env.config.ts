import * as dotenv from 'dotenv';
import { join } from 'path';
import * as fs from 'fs';

const envFile =
  process.env.NODE_ENV?.trim() === 'production'
    ? '.env.production'
    : '.env.development';

const envPath = join(__dirname, '..', '..', envFile);

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`✅ Loaded env from ${envPath}`);
} else {
  console.warn(`⚠️ Env file not found at ${envPath}`);
}
