-- HOME RENTAL SYSTEM
-- Role table
CREATE TABLE role
(
    role_id     BIGINT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- Insert standard roles
INSERT INTO role (name, description)
VALUES ('ADMIN', 'System administrator with full access'),
       ('OWNER', 'Property owner who can manage their properties'),
       ('TENANT', 'User who can rent properties');

-- Users/Accounts management
CREATE TABLE account
(
    account_id   BIGINT PRIMARY KEY AUTO_INCREMENT,
    email        VARCHAR(100) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    first_name   VARCHAR(50)  NOT NULL,
    last_name    VARCHAR(50)  NOT NULL,
    phone_number VARCHAR(20),
    id_number VARCHAR(20) NOT NULL,
    issue_date DATE NOT NULL,
    issued_by VARCHAR(30) NOT NULL,
    permanent_address VARCHAR(50) NOT NULL,
    id_number_type VARCHAR(10) NOT NULL,
    role_id      BIGINT       NOT NULL,
    is_active    BOOLEAN   DEFAULT FALSE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES role (role_id)
);

-- Insert admin account
INSERT INTO account (email, password, first_name, last_name, phone_number, role_id, is_active, id_number, issue_date, issued_by, permanent_address, id_number_type)
VALUES ('whyiam200@gmail.com', '$2a$10$i4cCVB/vimsLYoG55pxV3.4AyFrVqe08ImXZ3YkSIbQDY.1yy9qmu', 'System',
        'Administrator', '0345695203',
        (SELECT role_id FROM role WHERE name = 'ADMIN'),
        TRUE, '033203007044', '2024-4-25', 'CCSQLHCVTTVXH', 'JSJSJSJSJSJSJSJSJ','CCCD');

-- Property owners
CREATE TABLE owner
(
    owner_id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_id          BIGINT NOT NULL,
    company_name        VARCHAR(100),
    tax_id              VARCHAR(50),
    verification_status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'VERIFIED', 'REJECTED'
    FOREIGN KEY (account_id) REFERENCES account (account_id)
);

-- Tenants information
CREATE TABLE tenant
(
    tenant_id           BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_id          BIGINT NOT NULL,
    date_of_birth       DATE,
    occupation          VARCHAR(100),
    income              DECIMAL(12, 2),
    verification_status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'VERIFIED', 'REJECTED'
    FOREIGN KEY (account_id) REFERENCES account (account_id)
);

-- Property locations
CREATE TABLE location
(
    location_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    city        VARCHAR(50) NOT NULL,
    district    VARCHAR(50) NOT NULL,
    ward        VARCHAR(50) NOT NULL,
    postal_code VARCHAR(20),
    country     VARCHAR(50) NOT NULL,
    latitude    DECIMAL(10, 8),
    longitude   DECIMAL(11, 8)
);

-- HOME RENTAL SYSTEM
-- Giữ nguyên các bảng role, account, owner, tenant

-- Sửa lại bảng Property Categories với dữ liệu
CREATE TABLE property_category
(
    category_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- Thêm dữ liệu cho property_category
INSERT INTO property_category (name, description)
VALUES ('Căn hộ', 'Các loại căn hộ trong chung cư'),
       ('Nhà phố', 'Nhà phố cho thuê nguyên căn hoặc một phần'),
       ('Văn phòng', 'Không gian văn phòng cho thuê'),
       ('Biệt thự', 'Biệt thự độc lập với sân vườn'),
       ('Mặt bằng kinh doanh', 'Mặt bằng cho thuê kinh doanh, cửa hàng'),
       ('Nhà xưởng/Kho bãi', 'Không gian nhà xưởng và kho bãi công nghiệp'),
       ('Phòng trọ', 'Phòng cho thuê trong nhà nguyên căn');

-- Thêm bảng property_attribute để định nghĩa các thuộc tính
CREATE TABLE property_attribute
(
    attribute_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name         VARCHAR(50) NOT NULL UNIQUE,
    data_type    VARCHAR(20) NOT NULL, -- 'NUMBER', 'TEXT', 'BOOLEAN', 'DATE'
    unit         VARCHAR(20),
    description  TEXT
);

-- Thêm dữ liệu cho property_attribute
INSERT INTO property_attribute (name, data_type, unit, description)
VALUES ('Diện tích', 'NUMBER', 'm²', 'Diện tích sử dụng'),
       ('Số phòng ngủ', 'NUMBER', 'phòng', 'Số lượng phòng ngủ'),
       ('Số phòng tắm', 'NUMBER', 'phòng', 'Số lượng phòng tắm'),
       ('Tầng', 'NUMBER', 'tầng', 'Vị trí tầng của căn hộ hoặc văn phòng'),
       ('Hướng', 'TEXT', null, 'Hướng của bất động sản'),
       ('Nội thất', 'TEXT', null, 'Mức độ nội thất (unfurnished, semi, fully)'),
       ('Số tầng', 'NUMBER', 'tầng', 'Số lượng tầng của ngôi nhà'),
       ('Mặt tiền', 'NUMBER', 'm', 'Chiều rộng mặt tiền'),
       ('Có hồ bơi', 'BOOLEAN', null, 'Có hồ bơi riêng hay không'),
       ('Bãi đỗ xe', 'BOOLEAN', null, 'Có bãi đỗ xe riêng hay không'),
       ('Giờ hoạt động', 'TEXT', null, 'Thời gian hoạt động cho không gian thương mại'),
       ('Diện tích đất', 'NUMBER', 'm²', 'Diện tích đất của bất động sản'),
       ('Có thang máy', 'BOOLEAN', null, 'Có thang máy hay không'),
       ('Máy lạnh', 'BOOLEAN', null, 'Có máy lạnh hay không'),
       ('An ninh 24/7', 'BOOLEAN', null, 'Có dịch vụ an ninh 24/7 hay không'),
       ('Được nuôi thú cưng', 'BOOLEAN', null, 'Cho phép nuôi thú cưng hay không'),
       ('Chiều cao trần', 'NUMBER', 'm', 'Chiều cao từ sàn đến trần'),
       ('Tải trọng sàn', 'NUMBER', 'kg/m²', 'Tải trọng sàn cho kho bãi/nhà xưởng');

-- Thêm bảng category_attribute để liên kết thuộc tính với từng loại bất động sản
CREATE TABLE category_attribute
(
    category_id   BIGINT NOT NULL,
    attribute_id  BIGINT NOT NULL,
    is_required   BOOLEAN DEFAULT FALSE,
    default_value VARCHAR(255),
    PRIMARY KEY (category_id, attribute_id),
    FOREIGN KEY (category_id) REFERENCES property_category (category_id),
    FOREIGN KEY (attribute_id) REFERENCES property_attribute (attribute_id)
);

-- Thêm dữ liệu cho category_attribute
-- Căn hộ (category_id = 1)
INSERT INTO category_attribute (category_id, attribute_id, is_required, default_value)
VALUES (1, 1, TRUE, NULL),           -- Diện tích (bắt buộc)
       (1, 2, TRUE, NULL),           -- Số phòng ngủ (bắt buộc)
       (1, 3, TRUE, NULL),           -- Số phòng tắm (bắt buộc)
       (1, 4, TRUE, NULL),           -- Tầng (bắt buộc)
       (1, 5, TRUE, NULL),           -- Hướng (bắt buộc)
       (1, 6, FALSE, 'Unfurnished'), -- Nội thất (không bắt buộc)
       (1, 13, FALSE, 'FALSE'),      -- Có thang máy
       (1, 14, FALSE, 'FALSE'),      -- Máy lạnh
       (1, 15, FALSE, 'FALSE');
-- An ninh 24/7

-- Nhà phố (category_id = 2)
INSERT INTO category_attribute (category_id, attribute_id, is_required, default_value)
VALUES (2, 1, TRUE, NULL),           -- Diện tích (bắt buộc)
       (2, 2, TRUE, NULL),           -- Số phòng ngủ (bắt buộc)
       (2, 3, TRUE, NULL),           -- Số phòng tắm (bắt buộc)
       (2, 7, TRUE, NULL),           -- Số tầng (bắt buộc)
       (2, 8, FALSE, NULL),          -- Mặt tiền (không bắt buộc)
       (2, 6, FALSE, 'Unfurnished'), -- Nội thất (không bắt buộc)
       (2, 10, FALSE, 'FALSE'),      -- Bãi đỗ xe
       (2, 16, FALSE, 'FALSE');
-- Được nuôi thú cưng

-- Văn phòng (category_id = 3)
INSERT INTO category_attribute (category_id, attribute_id, is_required, default_value)
VALUES (3, 1, TRUE, NULL),          -- Diện tích (bắt buộc)
       (3, 4, TRUE, NULL),          -- Tầng (bắt buộc)
       (3, 11, TRUE, '8:00-18:00'), -- Giờ hoạt động (bắt buộc)
       (3, 13, FALSE, 'FALSE'),     -- Có thang máy
       (3, 14, FALSE, 'FALSE'),     -- Máy lạnh
       (3, 15, FALSE, 'FALSE');
-- An ninh 24/7

-- Biệt thự (category_id = 4)
INSERT INTO category_attribute (category_id, attribute_id, is_required, default_value)
VALUES (4, 12, TRUE, NULL),     -- Diện tích đất (bắt buộc)
       (4, 1, TRUE, NULL),      -- Diện tích xây dựng (bắt buộc)
       (4, 2, TRUE, NULL),      -- Số phòng ngủ (bắt buộc)
       (4, 3, TRUE, NULL),      -- Số phòng tắm (bắt buộc)
       (4, 9, FALSE, 'FALSE'),  -- Có hồ bơi (không bắt buộc)
       (4, 10, FALSE, 'FALSE'), -- Bãi đỗ xe
       (4, 6, FALSE, 'Unfurnished');
-- Nội thất (không bắt buộc)

-- Mặt bằng kinh doanh (category_id = 5)
INSERT INTO category_attribute (category_id, attribute_id, is_required, default_value)
VALUES (5, 1, TRUE, NULL),          -- Diện tích (bắt buộc)
       (5, 8, TRUE, NULL),          -- Mặt tiền (bắt buộc)
       (5, 11, TRUE, '8:00-22:00'), -- Giờ hoạt động (bắt buộc)
       (5, 4, FALSE, NULL);
-- Tầng (không bắt buộc)

-- Nhà xưởng/Kho bãi (category_id = 6)
INSERT INTO category_attribute (category_id, attribute_id, is_required, default_value)
VALUES (6, 1, TRUE, NULL),  -- Diện tích (bắt buộc)
       (6, 17, TRUE, NULL), -- Chiều cao trần (bắt buộc)
       (6, 18, TRUE, NULL), -- Tải trọng sàn (bắt buộc)
       (6, 10, FALSE, 'TRUE');
-- Bãi đỗ xe (không bắt buộc)

-- Phòng trọ (category_id = 7)
INSERT INTO category_attribute (category_id, attribute_id, is_required, default_value)
VALUES (7, 1, TRUE, NULL),          -- Diện tích (bắt buộc)
       (7, 6, TRUE, 'Unfurnished'), -- Nội thất (bắt buộc)
       (7, 14, FALSE, 'FALSE'),     -- Máy lạnh (không bắt buộc)
       (7, 16, FALSE, 'FALSE');
-- Được nuôi thú cưng (không bắt buộc)

-- Sửa đổi bảng Property để đơn giản hóa và tham chiếu đến các bảng thuộc tính
CREATE TABLE property
(
    property_id      BIGINT PRIMARY KEY AUTO_INCREMENT,
    owner_id         BIGINT         NOT NULL,
    category_id      BIGINT         NOT NULL,
    location_id      BIGINT         NOT NULL,
    title            VARCHAR(255)   NOT NULL,
    description      TEXT,
    address          TEXT           NOT NULL,
    price_per_month  DECIMAL(12, 2) NOT NULL,
    security_deposit DECIMAL(12, 2),
    is_available     BOOLEAN   DEFAULT TRUE,
    is_featured      BOOLEAN   DEFAULT FALSE,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES owner (owner_id),
    FOREIGN KEY (category_id) REFERENCES property_category (category_id),
    FOREIGN KEY (location_id) REFERENCES location (location_id)
);

-- Thêm bảng property_attribute_value để lưu giá trị thuộc tính của từng bất động sản
CREATE TABLE property_attribute_value
(
    property_id  BIGINT       NOT NULL,
    attribute_id BIGINT       NOT NULL,
    value        VARCHAR(255) NOT NULL,
    PRIMARY KEY (property_id, attribute_id),
    FOREIGN KEY (property_id) REFERENCES property (property_id) ON DELETE CASCADE,
    FOREIGN KEY (attribute_id) REFERENCES property_attribute (attribute_id)
);

-- Giữ nguyên hoặc điều chỉnh các bảng khác (property_image, lease, payment, maintenance_request, review, property_viewing, notification)

-- Sửa đổi bảng amenity để tách khỏi property
CREATE TABLE amenity
(
    amenity_id  BIGINT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- Thêm dữ liệu cho amenity
INSERT INTO amenity (name, description)
VALUES ('Wifi', 'Kết nối internet không dây'),
       ('Bể bơi', 'Bể bơi chung hoặc riêng'),
       ('Phòng gym', 'Phòng tập thể dục'),
       ('Bảo vệ 24/7', 'Dịch vụ bảo vệ 24/7'),
       ('Chỗ đậu xe', 'Khu vực đậu xe'),
       ('Máy lạnh', 'Hệ thống điều hòa'),
       ('Máy giặt', 'Máy giặt riêng hoặc chung'),
       ('Nhà bếp', 'Khu vực nấu ăn đầy đủ'),
       ('TV', 'Truyền hình'),
       ('Ban công', 'Ban công hoặc sân thượng'),
       ('Thang máy', 'Có thang máy'),
       ('Tủ lạnh', 'Có tủ lạnh'),
       ('Lò vi sóng', 'Có lò vi sóng');

-- Thêm bảng property_amenity để liên kết property với amenity (many-to-many)
CREATE TABLE property_amenity
(
    property_id BIGINT NOT NULL,
    amenity_id  BIGINT NOT NULL,
    PRIMARY KEY (property_id, amenity_id),
    FOREIGN KEY (property_id) REFERENCES property (property_id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenity (amenity_id)
);
-- Property-amenity relationship (many-to-many)

-- Property images
CREATE TABLE property_image
(
    image_id    BIGINT PRIMARY KEY AUTO_INCREMENT,
    property_id BIGINT       NOT NULL,
    image_url   VARCHAR(255) NOT NULL,
    is_primary  BOOLEAN   DEFAULT FALSE,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES property (property_id)
        ON DELETE CASCADE
);

ALTER TABLE property_image
    MODIFY COLUMN image_url VARCHAR(255) NULL;



-- Rental agreements/leases
CREATE TABLE lease
(
    lease_id         BIGINT PRIMARY KEY AUTO_INCREMENT,
    property_id      BIGINT         NOT NULL,
    tenant_id        BIGINT         NOT NULL,
    start_date       DATE           NOT NULL,
    end_date         DATE           NOT NULL,
    monthly_rent     DECIMAL(12, 2) NOT NULL,
    security_deposit DECIMAL(12, 2) NOT NULL,
    lease_terms      TEXT,
    status           VARCHAR(20)    NOT NULL, -- 'PENDING', 'ACTIVE', 'TERMINATED', 'EXPIRED'
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES property (property_id),
    FOREIGN KEY (tenant_id) REFERENCES tenant (tenant_id)
);

-- Payments
CREATE TABLE payment
(
    payment_id     BIGINT PRIMARY KEY AUTO_INCREMENT,
    lease_id       BIGINT         NOT NULL,
    amount         DECIMAL(12, 2) NOT NULL,
    payment_date   TIMESTAMP      NOT NULL,
    due_date       DATE           NOT NULL,
    payment_method VARCHAR(50),             -- 'CREDIT_CARD', 'BANK_TRANSFER', 'CASH', etc.
    transaction_id VARCHAR(100),
    status         VARCHAR(20)    NOT NULL, -- 'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'
    payment_type   VARCHAR(50)    NOT NULL, -- 'RENT', 'DEPOSIT', 'LATE_FEE', etc.
    FOREIGN KEY (lease_id) REFERENCES lease (lease_id)
);

-- Maintenance requests
CREATE TABLE maintenance_request
(
    request_id  BIGINT PRIMARY KEY AUTO_INCREMENT,
    property_id BIGINT       NOT NULL,
    tenant_id   BIGINT       NOT NULL,
    title       VARCHAR(255) NOT NULL,
    description TEXT         NOT NULL,
    priority    VARCHAR(20)  NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'
    status      VARCHAR(20)  NOT NULL, -- 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES property (property_id),
    FOREIGN KEY (tenant_id) REFERENCES tenant (tenant_id)
);

-- Property reviews
CREATE TABLE review
(
    review_id   BIGINT PRIMARY KEY AUTO_INCREMENT,
    property_id BIGINT NOT NULL,
    tenant_id   BIGINT NOT NULL,
    rating      INT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_public   BOOLEAN   DEFAULT TRUE,
    FOREIGN KEY (property_id) REFERENCES property (property_id),
    FOREIGN KEY (tenant_id) REFERENCES tenant (tenant_id)
);

-- Property viewing/showing appointments
CREATE TABLE property_viewing
(
    viewing_id   BIGINT PRIMARY KEY AUTO_INCREMENT,
    property_id  BIGINT      NOT NULL,
    tenant_id    BIGINT      NOT NULL,
    viewing_date TIMESTAMP   NOT NULL,
    status       VARCHAR(20) NOT NULL, -- 'REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELED'
    notes        TEXT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES property (property_id),
    FOREIGN KEY (tenant_id) REFERENCES tenant (tenant_id)
);

-- Notifications
CREATE TABLE notification
(
    notification_id   BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_id        BIGINT       NOT NULL,
    title             VARCHAR(255) NOT NULL,
    message           TEXT         NOT NULL,
    is_read           BOOLEAN   DEFAULT FALSE,
    notification_type VARCHAR(50)  NOT NULL, -- 'PAYMENT_DUE', 'MAINTENANCE_UPDATE', etc.
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES account (account_id)
);