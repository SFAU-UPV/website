insert into service_categories (slug, name, description) values
  ('slas-online', 'SLAS Online', 'Student Learning Assistance System.'),
  ('scholarships', 'Scholarship Programs', 'UP-administered, government, and private scholarships.'),
  ('other-financial-assistance', 'Other Financial Assistance', 'Other financial support programs.'),
  ('student-assistantship', 'Student Assistantship Program', 'Student work and learning opportunities.'),
  ('share-loan', 'SHARE Loan Program', 'Student loan assistance information.'),
  ('student-insurance', 'UP Student Insurance Policy', 'Student insurance information.')
on conflict (slug) do nothing;

insert into scholarship_categories (slug, name) values
  ('up-administered', 'UP-administered'),
  ('government', 'Government'),
  ('private', 'Private')
on conflict (slug) do nothing;
