const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
// Prisma generate requires DATABASE_URL to be set when parsing the schema (e.g. on Vercel install).
// Use a placeholder so generate succeeds; runtime will use the real env var.
let url = process.env.DATABASE_URL || '';
if (!url) {
  url = 'file:./prisma/dev.db';
  process.env.DATABASE_URL = url;
}

let provider = 'sqlite';
if (url.startsWith('postgresql:') || url.startsWith('postgres:')) {
  provider = 'postgresql';
} else if (url.startsWith('mysql:') || url.startsWith('mysql2:')) {
  provider = 'mysql';
} else if (url.startsWith('file:')) {
  provider = 'sqlite';
}

let schema = fs.readFileSync(schemaPath, 'utf8');
// Only replace provider inside the datasource block (not the generator)
schema = schema.replace(
  /(datasource\s+\w+\s*\{[\s\S]*?provider\s*=\s*)"[^"]+"/,
  `$1"${provider}"`
);
fs.writeFileSync(schemaPath, schema);
console.log('Prisma provider set to:', provider);
