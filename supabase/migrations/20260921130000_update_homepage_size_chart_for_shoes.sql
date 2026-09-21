UPDATE public.homepage_sections
SET
  subtitle = 'সঠিক জুতার সাইজ বেছে নিতে নিচের মাপগুলো দেখুন',
  config = '{"rows": [{"size": "৩৬", "foot_length": "২৩", "foot_width": "৮.৫"}, {"size": "৩৭", "foot_length": "২৩.৫", "foot_width": "৮.৭"}, {"size": "৩৮", "foot_length": "২৪", "foot_width": "৮.৯"}, {"size": "৩৯", "foot_length": "২৪.৫", "foot_width": "৯.১"}, {"size": "৪০", "foot_length": "২৫", "foot_width": "৯.৩"}, {"size": "৪১", "foot_length": "২৫.৫", "foot_width": "৯.৫"}, {"size": "৪২", "foot_length": "২৬", "foot_width": "৯.৭"}]}'::jsonb
WHERE section_key = 'size_chart';
