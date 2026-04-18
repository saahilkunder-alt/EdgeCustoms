-- Seed initial users for Edge Customs

INSERT OR IGNORE INTO users (id, username, password, role, is_active) VALUES 
('admin-uuid-1', 'admin', '53f962616be53ff377cba5cd98791383d76f6294', 'admin', 1),
('staff-uuid-1', 'staff', 'a0617f24654bb61a04fdaf23e7c1183db710253e', 'staff', 1);
