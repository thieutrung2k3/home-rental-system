-- DELETE TEST ACCOUNT
DELETE
FROM account
WHERE email = 't.hieutrung2k3@gmail.com';

DELETE
FROM account
WHERE email = 'whyiam200@gmail.com';

DELETE
FROM property
WHERE property_id = 2;

DELETE
FROM property_viewing;

UPDATE property
SET is_available = false
WHERE property_id = 1;

CREATE TABLE invalidated_token
(
    id          VARCHAR(255) PRIMARY KEY,
    expiry_time TIMESTAMP
);

