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

async function backup() {
  console.log("--------------------------------------------------");
  console.log("   GDG NMIT - MongoDB Database Save Point Backup   ");
  console.log("--------------------------------------------------");

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✓ Connected to MongoDB successfully.");

    // Extract database name from connection or default
    let dbName = client.options?.dbName;
    if (!dbName) {
      try {
        const parsed = new URL(uri.replace(/^mongodb(\+srv)?:\/\//, "http://"));
        dbName = parsed.pathname.replace(/^\//, "");
      } catch {
        dbName = "gdg_nmit";
      }
    }
    if (!dbName) dbName = "gdg_nmit";

    console.log(`✓ Active Database: [${dbName}]`);
    const db = client.db(dbName);

    // List all collections
    const collections = await db.listCollections().toArray();
    if (collections.length === 0) {
      console.log("⚠ No collections found in database.");
      return;
    }

    // Prepare timestamped backup directory
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-");
    const backupDir = path.join(__dirname, "..", "backups", `backup_${timestamp}`);
    const latestDir = path.join(__dirname, "..", "backups", "latest");

    fs.mkdirSync(backupDir, { recursive: true });

    const manifest = {
      timestamp: now.toISOString(),
      database: dbName,
      collections: {},
      totalDocuments: 0,
    };

    console.log(`\nCreating save point at: backups/backup_${timestamp}/\n`);

    for (const colInfo of collections) {
      const colName = colInfo.name;
      // Skip system collections if any
      if (colName.startsWith("system.")) continue;

      const col = db.collection(colName);
      const docs = await col.find({}).toArray();

      // Serialize using BSON.EJSON to preserve BSON types (ObjectId, Dates)
      const serialized = BSON.EJSON.stringify(docs, { relaxed: false }, 2);
      const filePath = path.join(backupDir, `${colName}.json`);
      fs.writeFileSync(filePath, serialized, "utf8");

      manifest.collections[colName] = docs.length;
      manifest.totalDocuments += docs.length;

      console.log(`  + [${colName}] -> ${docs.length} document(s) backed up to ${colName}.json`);
    }

    // Write manifest
    fs.writeFileSync(
      path.join(backupDir, "manifest.json"),
      JSON.stringify(manifest, null, 2),
      "utf8"
    );

    // Mirror to backups/latest
    fs.rmSync(latestDir, { recursive: true, force: true });
    fs.mkdirSync(latestDir, { recursive: true });
    for (const file of fs.readdirSync(backupDir)) {
      fs.copyFileSync(path.join(backupDir, file), path.join(latestDir, file));
    }

    console.log("\n--------------------------------------------------");
    console.log(`✓ Save Point Completed Successfully!`);
    console.log(`✓ Total Collections: ${Object.keys(manifest.collections).length}`);
    console.log(`✓ Total Documents:   ${manifest.totalDocuments}`);
    console.log(`✓ Snapshot Saved to: backups/backup_${timestamp}/`);
    console.log(`✓ Quick Reference:   backups/latest/`);
    console.log("--------------------------------------------------");
  } catch (err) {
    console.error("✗ Backup failed:", err.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

backup();
