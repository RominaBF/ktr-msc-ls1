/*
  Warnings:

  - Added the required column `ownerId` to the `library` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_library" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "company_name" TEXT,
    "email_address" TEXT NOT NULL,
    "telephone_number" TEXT,
    "ownerId" INTEGER NOT NULL,
    CONSTRAINT "library_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_library" ("company_name", "email_address", "id", "name", "telephone_number") SELECT "company_name", "email_address", "id", "name", "telephone_number" FROM "library";
DROP TABLE "library";
ALTER TABLE "new_library" RENAME TO "library";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
