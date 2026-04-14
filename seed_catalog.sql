-- ─── Cars Wash ───
INSERT OR IGNORE INTO service_catalog (id, name, category, for_vehicle, prices) VALUES 
('cw-foam', 'Foam Wash', 'Cars Wash', 'Car', '{"Hatchback":750,"Sedan / Crossover":850,"SUV / MPV":1000,"Luxury":1150}'),
('cw-detailed', 'Detailed Wash', 'Cars Wash', 'Car', '{"Hatchback":900,"Sedan / Crossover":1000,"SUV / MPV":1100,"Luxury":1200}'),
('cw-premium', 'Premium Wash', 'Cars Wash', 'Car', '{"Hatchback":1900,"Sedan / Crossover":2000,"SUV / MPV":2300,"Luxury":2500}');

-- ─── Car Detailing ───
INSERT OR IGNORE INTO service_catalog (id, name, category, for_vehicle, prices) VALUES 
('cd-interior', 'Interior Detailing', 'Car Detailing', 'Car', '{"Hatchback":3500,"Sedan / Crossover":4000,"SUV / MPV":4500,"Luxury":5000}'),
('cd-exterior', 'Exterior Detailing', 'Car Detailing', 'Car', '{"Hatchback":4500,"Sedan / Crossover":5000,"SUV / MPV":5500,"Luxury":6000}'),
('cd-combo', 'Interior & Exterior Detailing (Combo)', 'Car Detailing', 'Car', '{"Hatchback":7000,"Sedan / Crossover":8000,"SUV / MPV":9000,"Luxury":10000}');

-- ─── Add-On (Car) ───
INSERT OR IGNORE INTO service_catalog (id, name, category, for_vehicle, prices) VALUES 
('cs-ppf', 'Paint Protection Film (PPF)', 'Add-On', 'Car', '{"Hatchback":0,"Sedan / Crossover":0,"SUV / MPV":0,"Luxury":0}'),
('cs-wraps', 'Car Wraps', 'Add-On', 'Car', '{"Hatchback":0,"Sedan / Crossover":0,"SUV / MPV":0,"Luxury":0}'),
('cs-ceramic', 'Ceramic Coating Package', 'Add-On', 'Car', '{"Hatchback":0,"Sedan / Crossover":0,"SUV / MPV":0,"Luxury":0}'),
('cs-scanning', 'Scanning & Coding / Feature Unlock', 'Add-On', 'Car', '{"Hatchback":0,"Sedan / Crossover":0,"SUV / MPV":0,"Luxury":0}'),
('cs-glass-windshield', 'Glass Polish (Windshield)', 'Add-On', 'Car', '{"Hatchback":2000,"Sedan / Crossover":2000,"SUV / MPV":2500,"Luxury":2500}'),
('cs-glass-all', 'Glass Polish (All Glasses)', 'Add-On', 'Car', '{"Hatchback":2800,"Sedan / Crossover":2800,"SUV / MPV":3400,"Luxury":3400}'),
('cs-alloy', 'Alloy Wheel Detailing', 'Add-On', 'Car', '{"Hatchback":2500,"Sedan / Crossover":2500,"SUV / MPV":3000,"Luxury":3500}'),
('cs-engine', 'Engine Bay Detailing', 'Add-On', 'Car', '{"Hatchback":1800,"Sedan / Crossover":1800,"SUV / MPV":2500,"Luxury":2500}'),
('cs-headlight', 'Head Light Restoration', 'Add-On', 'Car', '{"Hatchback":1500,"Sedan / Crossover":1500,"SUV / MPV":1500,"Luxury":1700}');

-- ─── Bike Wash ───
INSERT OR IGNORE INTO service_catalog (id, name, category, for_vehicle, prices) VALUES 
('bw-foam', 'Foam Wash', 'Bike Wash', 'Bike', '{"Below 350 CC":350,"Above 350 CC":450,"ADV/Sports above 900cc":650}'),
('bw-detailed', 'Detailed Wash', 'Bike Wash', 'Bike', '{"Below 350 CC":500,"Above 350 CC":600,"ADV/Sports above 900cc":800}');

-- ─── Bike Add-On ───
INSERT OR IGNORE INTO service_catalog (id, name, category, for_vehicle, prices) VALUES 
('bw-chain', 'Chain Cleaning & Lubing', 'Bike Add-On', 'Bike', '{"Below 350 CC":300,"Above 350 CC":300,"ADV/Sports above 900cc":450}'),
('bw-chrome', 'Chrome Buffing', 'Bike Add-On', 'Bike', '{"Below 350 CC":4500,"Above 350 CC":4500,"ADV/Sports above 900cc":4500}'),
('bw-detailing', 'Bike Detailing', 'Bike Add-On', 'Bike', '{"Below 350 CC":3200,"Above 350 CC":3700,"ADV/Sports above 900cc":4200}'),
('bw-ceramic', 'Bike Ceramic Coating', 'Bike Add-On', 'Bike', '{"Below 350 CC":0,"Above 350 CC":0,"ADV/Sports above 900cc":0}'),
('bw-ppf', 'Bike Paint Protection Film (PPF)', 'Bike Add-On', 'Bike', '{"Below 350 CC":0,"Above 350 CC":0,"ADV/Sports above 900cc":0}');
