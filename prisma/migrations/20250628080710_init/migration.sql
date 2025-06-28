-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prUrl" TEXT NOT NULL,
    "state" JSONB NOT NULL,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "modelProvider" TEXT,
    "modelName" TEXT,
    "startedAt" DATETIME,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "FileAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "analysis" TEXT NOT NULL,
    "diffSize" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FileAnalysis_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChunkAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "chunkId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "startLine" INTEGER,
    "endLine" INTEGER,
    "sizeTokens" INTEGER NOT NULL,
    "diffContent" TEXT NOT NULL,
    "isCompleteFile" BOOLEAN NOT NULL DEFAULT false,
    "contextBefore" TEXT,
    "contextAfter" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChunkAnalysis_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnalysisPass" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "chunkId" TEXT NOT NULL,
    "passType" TEXT NOT NULL,
    "analysisResult" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "issuesFound" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "tokensUsed" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalysisPass_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AnalysisPass_chunkId_fkey" FOREIGN KEY ("chunkId") REFERENCES "ChunkAnalysis" ("chunkId") ON DELETE CASCADE ON UPDATE CASCADE
);

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

-- CreateIndex
CREATE UNIQUE INDEX "FileAnalysis_reviewId_fileName_key" ON "FileAnalysis"("reviewId", "fileName");

-- CreateIndex
CREATE UNIQUE INDEX "ChunkAnalysis_chunkId_key" ON "ChunkAnalysis"("chunkId");

-- CreateIndex
CREATE UNIQUE INDEX "AnalysisPass_chunkId_passType_key" ON "AnalysisPass"("chunkId", "passType");
