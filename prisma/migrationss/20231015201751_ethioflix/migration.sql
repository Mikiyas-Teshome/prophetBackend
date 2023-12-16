-- CreateTable
CREATE TABLE "web_series_episoade" (
    "id" SERIAL NOT NULL,
    "Episoade_Name" TEXT NOT NULL,
    "episoade_image" TEXT NOT NULL,
    "episoade_description" TEXT NOT NULL,
    "episoade_order" INTEGER NOT NULL,
    "season_id" INTEGER NOT NULL,
    "downloadable" INTEGER NOT NULL,
    "type" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "skip_available" INTEGER NOT NULL DEFAULT 0,
    "intro_start" TEXT NOT NULL,
    "intro_end" TEXT NOT NULL,
    "end_credits_marker" TEXT NOT NULL,
    "drm_uuid" TEXT NOT NULL,
    "drm_license_uri" TEXT NOT NULL,

    CONSTRAINT "web_series_episoade_pkey" PRIMARY KEY ("id")
);
