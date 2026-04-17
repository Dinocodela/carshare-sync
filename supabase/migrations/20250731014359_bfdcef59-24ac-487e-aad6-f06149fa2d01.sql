UPDATE profiles 
SET 
  company_name = 'Teslys LLC',
  location = 'Marina del Rey, CA',
  bio = 'Specialized Tesla management company providing comprehensive care exclusively for Tesla vehicles. We understand the unique needs of Tesla owners and offer premium storage, maintenance, and concierge services.',
  services = ARRAY['Tesla Maintenance', 'Premium Storage', 'Software Updates', 'Charging Management', 'Detailing', 'Concierge Services']
WHERE role = 'host' AND user_id = '1bee30cc-abe2-484a-9a8a-f9199977a3ce';