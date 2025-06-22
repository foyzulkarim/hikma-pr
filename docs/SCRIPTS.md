# 📋 Script Guide for Hikma-PR

## Quick Start
```bash
npm run help    # Show all available scripts
```

## 🔨 Development Scripts

### `npm run dev`
**Use when:** You want to run the app during development with hot reload
- Runs TypeScript directly without building
- Automatically restarts when you make changes
- Good for testing and debugging

### `npm run build`
**Use when:** You want to compile TypeScript to JavaScript
- Generates Prisma client automatically
- Compiles all TypeScript files to the `dist/` folder
- Required before running `npm start`

### `npm start`
**Use when:** You want to run the production version
- Runs the compiled JavaScript from `dist/`
- Must run `npm run build` first
- This is what gets executed when someone installs your CLI globally

## 🗄️ Database Scripts (Prisma)

### `npm run db:generate`
**Use when:** You've changed your Prisma schema
- Regenerates the Prisma client
- Must run after any changes to `prisma/schema.prisma`
- Fixes TypeScript errors about missing Prisma models

### `npm run db:migrate`
**Use when:** You've changed your database schema
- Creates a new migration file
- Applies the migration to your database
- Use during development when adding/changing tables

### `npm run db:deploy`
**Use when:** You want to apply existing migrations
- Applies all pending migrations
- Good for production deployments
- Doesn't create new migrations

### `npm run db:reset`
**Use when:** You want to start fresh (⚠️ **DANGER**)
- Deletes all data in your database
- Reapplies all migrations from scratch
- Only use during development!

### `npm run db:studio`
**Use when:** You want to view/edit your database
- Opens Prisma Studio in your browser
- Visual interface for your database
- Great for debugging data issues

### `npm run db:status`
**Use when:** You want to check your migration status
- Shows which migrations are applied
- Shows which migrations are pending
- Helpful for troubleshooting

## 🚀 Common Workflows

### First time setup:
```bash
npm install
npm run db:migrate    # Set up database
npm run build         # Build the project
npm start            # Run the app
```

### After changing Prisma schema:
```bash
npm run db:migrate    # Create and apply migration
npm run build         # Rebuild with new client
```

### After changing TypeScript code:
```bash
npm run build         # Rebuild
npm start            # Run updated version
```

### Development workflow:
```bash
npm run dev          # Just run this for development
```

### Troubleshooting database issues:
```bash
npm run db:status    # Check migration status
npm run db:studio    # View database contents
```

## 🆘 Common Issues

**"Property 'modelName' does not exist on type 'PrismaClient'"**
→ Run `npm run db:generate`

**"The table 'ModelName' does not exist in the current database"**
→ Run `npm run db:deploy` or `npm run db:migrate`

**Build errors after schema changes**
→ Run `npm run db:generate && npm run build`
