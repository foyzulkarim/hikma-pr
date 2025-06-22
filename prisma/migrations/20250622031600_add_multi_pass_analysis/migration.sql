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

-- CreateIndex
CREATE UNIQUE INDEX "ChunkAnalysis_chunkId_key" ON "ChunkAnalysis"("chunkId");

-- CreateIndex
CREATE UNIQUE INDEX "AnalysisPass_chunkId_passType_key" ON "AnalysisPass"("chunkId", "passType");
