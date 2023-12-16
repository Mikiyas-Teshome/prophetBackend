-- CreateTable
CREATE TABLE "Tip" (
    "id" TEXT NOT NULL,
    "home" TEXT NOT NULL,
    "homeScore" TEXT NOT NULL,
    "visitor" TEXT NOT NULL,
    "visitorScore" TEXT NOT NULL,
    "bet" TEXT NOT NULL,
    "rate" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "flag" TEXT NOT NULL,
    "like" TEXT NOT NULL,
    "disLike" TEXT NOT NULL,
    "isLiked" BOOLEAN NOT NULL,
    "isDisliked" BOOLEAN NOT NULL,
    "publicRow" BIGINT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tip_publicRow_key" ON "Tip"("publicRow");
