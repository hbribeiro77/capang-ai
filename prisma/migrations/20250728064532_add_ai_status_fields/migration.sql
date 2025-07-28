-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "moderatorName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inviteCode" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "aiAnalyzing" BOOLEAN NOT NULL DEFAULT false,
    "aiAnalysisStartedAt" DATETIME
);
INSERT INTO "new_Room" ("createdAt", "id", "inviteCode", "isActive", "moderatorName", "name") SELECT "createdAt", "id", "inviteCode", "isActive", "moderatorName", "name" FROM "Room";
DROP TABLE "Room";
ALTER TABLE "new_Room" RENAME TO "Room";
CREATE UNIQUE INDEX "Room_inviteCode_key" ON "Room"("inviteCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
