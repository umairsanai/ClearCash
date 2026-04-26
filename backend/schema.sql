CREATE TYPE COLOR_TYPE AS ENUM('RED', 'GREEN', 'ORANGE', 'YELLOW', 'BLUE', 'PURPLE', 'DARKGREEN', 'MAROON', 'PINK', 'BLACK', 'WHITE');

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    username VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(50) NOT NULL UNIQUE,
    phone VARCHAR(12) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    password_changed_at BIGINT DEFAULT 0 CHECK(password_changed_at >= 0),
    created_at DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE pockets (
    pocket_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
    pocket_name VARCHAR(30) NOT NULL,
    pocket_balance INT NOT NULL CHECK(pocket_balance >= 0) DEFAULT 0,
    pocket_limit INT NOT NULL CHECK(pocket_limit >= 0 AND pocket_balance <= pocket_limit),
    color COLOR_TYPE NOT NULL -- for-css-style
);

CREATE TABLE transactions (
    transaction_id BIGSERIAL PRIMARY KEY,
    sender_user_id INT NOT NULL REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
    recipient_user_id INT NOT NULL REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
    sender_pocket_id INT NOT NULL REFERENCES pockets(pocket_id) ON UPDATE CASCADE ON DELETE CASCADE,
    recipient_pocket_id INT NOT NULL REFERENCES pockets(pocket_id) ON UPDATE CASCADE ON DELETE CASCADE,
    amount INT NOT NULL CHECK(amount >= 0),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE
);