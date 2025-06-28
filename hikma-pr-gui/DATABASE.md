# 🗄️ Database Management for Hikmapr GUI

This document explains how to manage the database when working with the Hikmapr GUI, especially after database schema changes.

## 🔄 When Database Changes Occur

The GUI shares the same SQLite database (`~/.hikmapr/reviews.db`) with the main Hikmapr CLI application. When the database schema changes in the main application, you need to sync the GUI to avoid errors.

## ⚠️ Common Error Signs

You'll see these errors when the GUI database is out of sync:

```
Invalid prisma.review.findMany() invocation
The column main.ChunkAnalysis.updatedAt does not exist in the current database.
```

```
Unknown field chunkAnalyses for include statement on model Review
```

## 🛠️ Step-by-Step Fix Instructions

### 1. **After Main App Schema Changes**

When the main Hikmapr application's database schema is updated, follow these steps:

```bash
# Navigate to the GUI directory
cd hikma-pr-gui

# Step 1: Sync the schema file
cp ../prisma/schema.prisma ./prisma/schema.prisma

# Step 2: Sync the migrations
rsync -av ../prisma/migrations/ ./prisma/migrations/

# Step 3: Regenerate Prisma client
npm run db:generate

# Step 4: Clear Next.js cache
rm -rf .next

# Step 5: Restart development server
npm run dev
```

### 2. **Quick Fix Script**

You can also run this one-liner from the GUI directory:

```bash
cp ../prisma/schema.prisma ./prisma/schema.prisma && rsync -av ../prisma/migrations/ ./prisma/migrations/ && npm run db:generate && rm -rf .next && echo "✅ Database sync complete! Restart your dev server."
```

## 📋 Available Database Commands

The GUI now includes these database management scripts:

```bash
# Generate Prisma client (after schema changes)
npm run db:generate

# Create and apply new migration (rarely needed for GUI)
npm run db:migrate

# Apply existing migrations (for production)
npm run db:deploy

# Open database GUI
npm run db:studio
```

## 🔍 Troubleshooting

### **Problem: "Table does not exist" errors**
**Solution:** The main app has new tables that haven't been created yet.
```bash
cd ../  # Go to main app directory
npm run db:migrate  # Apply migrations in main app
cd hikma-pr-gui/
# Follow sync steps above
```

### **Problem: "Column does not exist" errors**
**Solution:** Schema mismatch between GUI and main app.
```bash
# Sync schema and regenerate client
cp ../prisma/schema.prisma ./prisma/schema.prisma
npm run db:generate
rm -rf .next
```

### **Problem: "Unknown field" errors**
**Solution:** Prisma client is outdated.
```bash
npm run db:generate
rm -rf .next
# Restart dev server
```

## 🚀 Development Workflow

### **When working on the main app:**
1. Make schema changes in main app
2. Run migrations in main app: `npm run db:migrate`
3. Sync GUI database: Follow steps above
4. Continue GUI development

### **When starting fresh:**
1. Ensure main app database exists: `cd .. && npm run db:migrate`
2. Sync GUI: Follow sync steps above
3. Start GUI: `npm run dev`

## 📊 Database Schema Overview

The GUI uses these main tables:

- **Review**: Main PR review records
- **ChunkAnalysis**: Individual diff chunks with metadata
- **AnalysisPass**: 4-pass analysis results per chunk
- **FileAnalysis**: Legacy file-level analyses (V1 compatibility)

## 🔗 Shared Database Location

Both applications use the same SQLite database:
```
~/.hikmapr/reviews.db
```

The database location is now automatically configured to use the user's home directory with a `.hikmapr` folder. This ensures:
- Data consistency between the CLI tool and the GUI dashboard
- Proper data persistence when running via npx
- Cross-platform compatibility (works on Windows, macOS, and Linux)

The database path is dynamically set using the `DATABASE_URL` environment variable, which defaults to `file:~/.hikmapr/reviews.db` but can be overridden if needed.

## 💡 Pro Tips

1. **Always sync after main app updates** - Schema changes in the main app require GUI sync
2. **Clear Next.js cache** - Always clear `.next` folder after Prisma changes
3. **Use Prisma Studio** - Run `npm run db:studio` to visually inspect your database
4. **Check migration status** - Use `npx prisma migrate status` to see applied migrations

## 🆘 Emergency Reset

If everything breaks and you need to start fresh:

```bash
# From main app directory
npm run db:reset  # ⚠️ This deletes all data!
npm run db:migrate

# From GUI directory  
cp ../prisma/schema.prisma ./prisma/schema.prisma
rsync -av ../prisma/migrations/ ./prisma/migrations/
npm run db:generate
rm -rf .next
npm run dev
```

**⚠️ Warning:** `db:reset` will delete all your review data!

## 📞 Need Help?

If you're still having issues:
1. Check that the main app database is working: `cd .. && npm run db:status`
2. Verify schema files match: `diff ../prisma/schema.prisma ./prisma/schema.prisma`
3. Check Prisma client generation: `npm run db:generate`
4. Clear all caches: `rm -rf .next node_modules/.cache`
