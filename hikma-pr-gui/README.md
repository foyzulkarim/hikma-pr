# Hikma PR Reviews - Database Viewer

A simple GUI application to view PR review entries from the Hikma PR database.

## Features

- **View All Reviews**: Browse all PR reviews in a clean, modern interface
- **Detailed View**: Click on any review to see full details including the complete JSON state
- **Read-Only**: Safe viewing of database entries without any mutation capabilities
- **Responsive Design**: Works well on desktop and mobile devices

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Generate Prisma client**:
   ```bash
   npx prisma generate
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
hikma-pr-gui/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── reviews/          # API endpoints for fetching reviews
│   │   ├── review/[id]/          # Individual review detail page
│   │   ├── page.tsx              # Main reviews list page
│   │   └── layout.tsx            # App layout
│   └── ...
├── prisma/
│   └── schema.prisma             # Database schema (points to existing DB)
└── ...
```

## API Endpoints

- `GET /api/reviews` - Fetch all reviews
- `GET /api/reviews/[id]` - Fetch a specific review by ID

## Database Connection

This application connects to the existing Hikma PR database located at `~/.hikmapr/reviews.db`. No modifications are made to the original application or database.

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Prisma** - Database ORM
- **SQLite** - Database (existing Hikma PR database)

## Notes

- This is a read-only application - no data mutations are performed
- The application is completely isolated from the main Hikma PR project
- All styling is done with Tailwind CSS for a modern, clean interface
