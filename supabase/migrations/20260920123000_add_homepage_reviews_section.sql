DO $$
DECLARE
  trending_order integer;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.homepage_sections
    WHERE section_key = 'reviews'
  ) THEN
    RETURN;
  END IF;

  SELECT sort_order INTO trending_order
  FROM public.homepage_sections
  WHERE section_key = 'trending' OR section_key LIKE 'trending_%'
  ORDER BY sort_order
  LIMIT 1;

  IF trending_order IS NULL THEN
    SELECT COALESCE(max(sort_order), 0) INTO trending_order
    FROM public.homepage_sections;
  END IF;

  UPDATE public.homepage_sections
  SET sort_order = sort_order + 1
  WHERE sort_order > trending_order;

  INSERT INTO public.homepage_sections (
    section_key,
    title,
    subtitle,
    is_visible,
    sort_order,
    product_limit,
    config
  )
  VALUES (
    'reviews',
    'গ্রাহকদের মতামত',
    'আমাদের গ্রাহকেরা কী বলছেন',
    true,
    trending_order + 1,
    6,
    '{}'::jsonb
  );
END $$;
