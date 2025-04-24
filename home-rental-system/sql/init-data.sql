INSERT INTO account (email, password, first_name, last_name, phone_number, role_id, is_active)
VALUES ('whyiam200@gmail.com', '$2a$10$i4cCVB/vimsLYoG55pxV3.4AyFrVqe08ImXZ3YkSIbQDY.1yy9qmu', 'System',
        'Administrator', '0345695203',
        (SELECT role_id FROM role WHERE name = 'ADMIN'),
        TRUE);

