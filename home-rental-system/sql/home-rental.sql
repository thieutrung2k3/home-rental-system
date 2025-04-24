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
    role_id      BIGINT       NOT NULL,
    is_active    BOOLEAN   DEFAULT FALSE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES role (role_id)
);

-- Insert admin account
INSERT INTO account (email, password, first_name, last_name, phone_number, role_id, is_active)
VALUES ('whyiam200@gmail.com', '$2a$10$i4cCVB/vimsLYoG55pxV3.4AyFrVqe08ImXZ3YkSIbQDY.1yy9qmu', 'System',
        'Administrator', '0345695203',
        (SELECT role_id FROM role WHERE name = 'ADMIN'),
        TRUE);

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

-- Property categories
CREATE TABLE property_category
(
    category_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

INSERT INTO property_category (name, description)
VALUES ('Nhà', 'Nhà ở riêng lẻ, không chia sẻ tường với các căn hộ khác.'),
       ('Căn hộ', 'Một đơn vị nhà ở độc lập, chiếm một phần của tòa nhà.'),
       ('Biệt thự', 'Nhà ở cao cấp, thường có sân vườn hoặc không gian ngoài trời.'),
       ('Studio', 'Căn hộ nhỏ, thường chỉ bao gồm một phòng duy nhất và phòng tắm.'),
       ('Nhà phố', 'Nhà nhiều tầng trong một dãy nhà có tường chung với các căn hộ bên cạnh.'),
       ('Căn hộ chung cư',
        'Một tòa nhà hoặc khu phức hợp với các căn hộ do nhiều người sở hữu, thường được quản lý chung.'),
       ('Nhà đôi', 'Nhà được chia thành hai căn hộ riêng biệt với lối vào riêng.'),
       ('Penthouse', 'Căn hộ sang trọng nằm trên tầng cao nhất của tòa nhà, thường có sân thượng riêng.');


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

# ALTER TABLE location ADD COLUMN ward VARCHAR(50) NOT NULL;

-- Properties
CREATE TABLE property
(
    property_id      BIGINT PRIMARY KEY AUTO_INCREMENT,
    owner_id         BIGINT         NOT NULL,
    category_id      BIGINT         NOT NULL,
    location_id      BIGINT         NOT NULL,
    title            VARCHAR(255)   NOT NULL,
    description      TEXT,
    address          TEXT           NOT NULL,
    bedrooms         INT            NOT NULL,
    bathrooms        INT            NOT NULL,
    area             DECIMAL(10, 2) NOT NULL, -- in square meters/feet
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

-- Property amenities lookup table
CREATE TABLE amenity
(
    amenity_id  BIGINT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(50) NOT NULL UNIQUE,
    image_url   VARCHAR(255),
    description TEXT,
    property_id BIGINT,
    CONSTRAINT fk_amenity_property FOREIGN KEY (property_id)
        REFERENCES property (property_id)
        ON DELETE CASCADE
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