import {randomBytes, pbkdf2Sync} from 'node:crypto';
import {writeFileSync, existsSync} from 'node:fs';
if (existsSync('.dev.vars')) throw new Error('.dev.vars already exists; keep or move it before generating new local secrets.');
const salt=randomBytes(16).toString('hex');
const hash=pbkdf2Sync('admin@123', Buffer.from(salt,'hex'),100000,32,'sha256').toString('hex');
writeFileSync('.dev.vars', `ADMIN_EMAILS=seedy@sites.test\nCATALOG_SECRET=${randomBytes(32).toString('hex')}\nADMIN_DEMO_EMAIL=admin@gmail.com\nADMIN_DEMO_PASSWORD_HASH=pbkdf2-sha256:100000:${salt}:${hash}\nSHOPIFY_API_VERSION=2026-07\n`, {mode:0o600});
console.log('Created local .dev.vars. Demo login: admin@gmail.com / admin@123');
