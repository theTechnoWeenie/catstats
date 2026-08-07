-- CreateTable
CREATE TABLE "PillLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "catId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "am" BOOLEAN NOT NULL DEFAULT false,
    "pm" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "PillLog_catId_fkey" FOREIGN KEY ("catId") REFERENCES "Cat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PillLog_catId_day_key" ON "PillLog"("catId", "day");
