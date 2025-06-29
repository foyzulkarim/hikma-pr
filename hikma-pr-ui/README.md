# Hikma PR UI

Beautiful React dashboard for viewing PR analysis results from Hikma PR.

## 🚀 Development Workflow

### Step 1: Start the API Server
```bash
# From the main project directory
cd ..
npm run serve-ui
```
This starts the Express server with real data on `http://localhost:3000`

### Step 2: Start the UI Development Server
```bash
# From the UI directory
npm run dev
```
This starts the Vite dev server on `http://localhost:5173` with:
- ✅ **Real data** from your SQLite database (proxied from API server)
- ✅ **Hot reload** for instant UI changes
- ✅ **Same data** as production build
- ✅ **No mock data management** needed

## 🔄 How It Works

```
┌─────────────────┐    API Proxy    ┌──────────────────┐
│  Vite Dev       │ ──────────────► │  Express Server  │
│  localhost:5173 │                 │  localhost:3000  │
│                 │                 │                  │
│  React UI       │                 │  Real Data API   │
│  Hot Reload     │                 │  SQLite → JSON   │
└─────────────────┘                 └──────────────────┘
```

- **UI Dev Server (5173)**: Hot reload, fast development
- **API Server (3000)**: Real data from your database
- **Vite Proxy**: Automatically forwards `/api/*` calls to port 3000

## 📊 Data Flow

1. **UI makes request**: `fetch('/api/reviews')`
2. **Vite proxy forwards**: `http://localhost:3000/api/reviews`
3. **Express server responds**: Real data from SQLite
4. **UI receives**: Same JSON as production

## 🔧 Available Scripts

- `npm run dev` - Start development server (requires API server running)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 💡 Benefits

- ✅ **Perfect dev/prod parity**: Same data, same behavior
- ✅ **Real-time development**: Hot reload with real data
- ✅ **No mock data complexity**: Single source of truth
- ✅ **Easy testing**: Test with your actual PR analyses

## 🚨 Important

Always start the API server first (`npm run serve-ui` from main project), then start the UI dev server. The UI will proxy API calls to the running Express server.
