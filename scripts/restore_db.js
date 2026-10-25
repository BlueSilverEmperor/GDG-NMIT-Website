/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const dns = require("dns");
const { MongoClient, BSON } = require("mongodb");

if (typeof dns.setServers === "function") {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch {}
}

// 1. Safe loading of .env.local if present
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  try {
    if (typeof process.loadEnvFile === "function") {
      process.loadEnvFile(envPath);
    } else {
      const content = fs.readFileSync(envPath, "utf8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      });
    }
  } catch (err) {
    console.error("Warning reading .env.local:", err.message);
  }
}

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/gdg_nmit";

// Check if a specific backup folder was provided as CLI argument
const targetBackup = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, "..", "backups", "latest");

async function restore() {
  console.log("--------------------------------------------------");
  console.log("    GDG NMIT - MongoDB Database Restore Tool      ");
  console.log("--------------------------------------------------");

  if (!fs.existsSync(targetBackup)) {
    console.error(`✗ Backup folder not found: ${targetBackup}`);
    process.exitCode = 1;
    return;
  }

  const manifestPath = path.join(targetBackup, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    console.error(`✗ No manifest.json found in: ${targetBackup}`);
    process.exitCode = 1;
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  console.log(`✓ Restoring from Save Point: ${manifest.timestamp}`);
  console.log(`✓ Backup Directory: ${targetBackup}`);

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✓ Connected to MongoDB.");

    let dbName = manifest.database || client.options?.dbName;
    if (!dbName) {
      try {
        const parsed = new URL(uri.replace(/^mongodb(\+srv)?:\/\//, "http://"));
        dbName = parsed.pathname.replace(/^\//, "");
      } catch {
        dbName = "gdg_nmit";
      }
    }
    if (!dbName) dbName = "gdg_nmit";

    console.log(`✓ Target Database: [${dbName}]\n`);
    const db = client.db(dbName);

    for (const [colName, expectedCount] of Object.entries(manifest.collections)) {
      const filePath = path.join(targetBackup, `${colName}.json`);
      if (!fs.existsSync(filePath)) {
        console.warn(`  ⚠ File missing for collection [${colName}]: ${filePath}`);
        continue;
      }

      const fileContent = fs.readFileSync(filePath, "utf8");
      const docs = BSON.EJSON.parse(fileContent);

      const col = db.collection(colName);
      // Clear current collection contents
      await col.deleteMany({});

      if (docs.length > 0) {
        await col.insertMany(docs);
      }

      console.log(`  + Restored [${colName}]: ${docs.length} / ${expectedCount} document(s)`);
    }

    console.log("\n--------------------------------------------------");
    console.log("✓ Database Restore Completed Successfully!");
    console.log("--------------------------------------------------");
  } catch (err) {
    console.error("✗ Restore failed:", err.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

restore();
