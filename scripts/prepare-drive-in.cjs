const { spawnSync } = require('node:child_process');
const path = require('node:path');

// Only the production deployment creates the new tables. Preview builds must
// never change a database that may also serve the live auction.
if (process.env.VERCEL_ENV !== 'production') {
  console.log('Drive-In schema setup skipped outside Vercel production.');
  process.exit(0);
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required to prepare the Drive-In tables.');
  process.exit(1);
}
const result = spawnSync(process.execPath, [
  path.join(__dirname, '..', 'node_modules', 'prisma', 'build', 'index.js'), 'db', 'execute',
  '--file', path.join(__dirname, 'drive-in-tables.sql'),
  '--schema', path.join(__dirname, '..', 'prisma', 'schema.prisma'),
], { stdio: 'inherit' });
if (result.error) console.error('Could not start the database preparation step.');
process.exit(result.status ?? 1);
