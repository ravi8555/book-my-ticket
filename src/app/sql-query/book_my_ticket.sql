-- CREATE TABLE seats (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(255),
--     isbooked INT DEFAULT 0
-- );
-- INSERT INTO seats (isbooked)
-- SELECT 0 FROM generate_series(1, 20);
-- INSERT INTO seats (isbooked) SELECT 0 FROM generate_series(1, 20);
-- SELECT * FROM seats


-- CREATE TABLE "user" (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     name VARCHAR(45) NOT NULL,
--     email VARCHAR(322) NOT NULL UNIQUE,
--     password VARCHAR(66) NOT NULL,
--     role VARCHAR(20) DEFAULT 'customer' NOT NULL,
--     is_verified BOOLEAN DEFAULT FALSE NOT NULL,
--     verification_token TEXT,
--     verification_token_expires TIMESTAMP,
--     refresh_token VARCHAR(500),
--     reset_password_token VARCHAR(255),
--     reset_password_expires TIMESTAMP,
--     created_at TIMESTAMP DEFAULT NOW() NOT NULL,
--     updated_at TIMESTAMP DEFAULT NOW() NOT NULL
-- );

-- CREATE INDEX idx_user_email ON "user"(email);
-- CREATE INDEX idx_user_verification_token ON "user"(verification_token);

-- ALTER TABLE "user" ADD COLUMN IF NOT EXISTS salt VARCHAR(255);

-- SELECT id, email, salt FROM "user";

ALTER TABLE seats ADD COLUMN booked_by_user_id VARCHAR(255);

