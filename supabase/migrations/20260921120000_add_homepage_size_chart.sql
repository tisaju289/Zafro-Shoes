DO $$
DECLARE
  categories_order integer;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.homepage_sections
    WHERE section_key = 'size_chart'
  ) THEN
    RETURN;
  END IF;

  SELECT sort_order INTO categories_order
  FROM public.homepage_sections
  WHERE section_key = 'categories'
  LIMIT 1;

  IF categories_order IS NULL THEN
    SELECT COALESCE(max(sort_order), 0) INTO categories_order
    FROM public.homepage_sections;
  END IF;

  UPDATE public.homepage_sections
  SET sort_order = sort_order + 1
  WHERE sort_order > categories_order;

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
    'size_chart',
    'সাইজ চার্ট',
    'সঠিক সাইজ বেছে নিতে নিচের মাপগুলো দেখুন',
    true,
    categories_order + 1,
    0,
    '{"rows": [{"size": "৩৬", "length": "৩৬", "chest": "৩৮", "waist": "৩৪"}, {"size": "৩৮", "length": "৩৬", "chest": "৪০", "waist": "৩৬"}, {"size": "৪০", "length": "৩৭", "chest": "৪২", "waist": "৩৮"}, {"size": "৪২", "length": "৩৭", "chest": "৪৪", "waist": "৪০"}]}'::jsonb
  );
END $$;
