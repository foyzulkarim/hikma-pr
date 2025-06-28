-- CreateTable
CREATE TABLE "PluginFinding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "chunkId" TEXT NOT NULL,
    "pluginId" TEXT NOT NULL,
    "pluginName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "line" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PluginFinding_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PluginFinding_chunkId_fkey" FOREIGN KEY ("chunkId") REFERENCES "ChunkAnalysis" ("chunkId") ON DELETE CASCADE ON UPDATE CASCADE
);
