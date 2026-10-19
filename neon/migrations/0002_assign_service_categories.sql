-- Imported records without a service category were previously shown as scholarships
-- by the application fallback. Classify the known assistance programs explicitly.
update programs
set service_category_id = (select id from service_categories where slug = 'other-financial-assistance')
where lower(name) in (
  'upv adopt-a-student program',
  'upv silak-silab foundation wellness fund grant',
  'lingap iskolar ng bayan'
);

-- Existing imported scholarship rows had no service category. Keep them in the
-- scholarship directory after the special assistance records are reassigned.
update programs
set service_category_id = (select id from service_categories where slug = 'scholarships')
where service_category_id is null;
