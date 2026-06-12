-- CreateTable
CREATE TABLE "DocumentRenewal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "renewalDate" DATETIME NOT NULL,
    "nextExpiryDate" DATETIME NOT NULL,
    "amount" REAL NOT NULL DEFAULT 0,
    "supplier" TEXT,
    "invoiceNumber" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocumentRenewal_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
