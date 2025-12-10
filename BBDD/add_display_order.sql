-- Add display_order column to round_images table
ALTER TABLE round_images ADD COLUMN display_order INTEGER DEFAULT 0;
