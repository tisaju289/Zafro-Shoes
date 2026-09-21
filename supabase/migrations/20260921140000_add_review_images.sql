ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS profile_image_url text,
  ADD COLUMN IF NOT EXISTS product_image_url text;
