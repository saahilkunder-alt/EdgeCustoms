-- Seed initial users for Edge Customs

INSERT OR IGNORE INTO users (id, username, password, role, is_active) VALUES 
('admin-uuid-1', 'admin', '53f962616be53ff377cba5cd98791383d76f6294', 'admin', 1),
('staff-uuid-1', 'staff', '53f962616be53ff377cba5cd98791383d76f6294', 'staff', 1);
