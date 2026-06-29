import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const rootDir = resolve(new URL("..", import.meta.url).pathname);
const backupDir = resolve(rootDir, "backups");

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;

  const content = readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const [rawKey, ...rawValueParts] = trimmed.split("=");
    const key = rawKey.trim();
    let value = rawValueParts.join("=").trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function ensureBackupDir() {
  mkdirSync(backupDir, { recursive: true });
}

function backupSqlite(databaseUrl) {
  const sqlitePath = databaseUrl.replace(/^file:/, "");
  const candidates = isAbsolute(sqlitePath)
    ? [sqlitePath]
    : [resolve(rootDir, "prisma", sqlitePath), resolve(rootDir, sqlitePath)];
  const absolutePath = candidates.find((candidate) => existsSync(candidate));

  if (!absolutePath) {
    throw new Error("SQLite database file not found.");
  }

  ensureBackupDir();

  const target = join(backupDir, `${timestamp()}-${basename(absolutePath)}.backup`);
  copyFileSync(absolutePath, target);

  for (const suffix of ["-wal", "-shm"]) {
    const sidecar = `${absolutePath}${suffix}`;
    if (existsSync(sidecar)) {
      copyFileSync(sidecar, `${target}${suffix}`);
    }
  }

  const sizeMb = (statSync(target).size / 1024 / 1024).toFixed(2);
  console.log(`Database backup created: ${target} (${sizeMb} MB)`);
}

function backupPostgres(databaseUrl) {
  ensureBackupDir();

  const target = join(backupDir, `${timestamp()}-postgres.dump`);

  execFileSync("pg_dump", ["--format=custom", "--file", target, databaseUrl], {
    stdio: ["ignore", "inherit", "inherit"],
  });

  const sizeMb = (statSync(target).size / 1024 / 1024).toFixed(2);
  console.log(`Database backup created: ${target} (${sizeMb} MB)`);
}

loadEnvFile(resolve(rootDir, ".env"));
loadEnvFile(resolve(rootDir, "prisma", ".env"));

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing.");
}

if (databaseUrl.startsWith("file:")) {
  backupSqlite(databaseUrl);
} else if (
  databaseUrl.startsWith("postgres://") ||
  databaseUrl.startsWith("postgresql://")
) {
  backupPostgres(databaseUrl);
} else {
  throw new Error("Unsupported DATABASE_URL provider for backup.");
}
