-- Add teleport_link column to round_images table
ALTER TABLE public.round_images
ADD COLUMN teleport_link text DEFAULT 'http://maps.secondlife.com/secondlife/SABBATH/227/129/27';
