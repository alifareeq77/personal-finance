const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const url = process.env.DATABASE_URL || '';

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
