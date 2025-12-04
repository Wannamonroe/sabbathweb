-- Create carousel_images table
CREATE TABLE IF NOT EXISTS carousel_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE carousel_images ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow public read access
CREATE POLICY "Public can view carousel images" 
ON carousel_images FOR SELECT 
USING (true);

-- Allow authenticated users (admins) to insert
CREATE POLICY "Admins can insert carousel images" 
ON carousel_images FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users (admins) to delete
CREATE POLICY "Admins can delete carousel images" 
ON carousel_images FOR DELETE 
USING (auth.role() = 'authenticated');

-- Create storage bucket for carousel images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('carousel-images', 'carousel-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for carousel-images
CREATE POLICY "Carousel Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'carousel-images' );

CREATE POLICY "Carousel Auth Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'carousel-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Carousel Auth Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'carousel-images' AND auth.role() = 'authenticated' );
