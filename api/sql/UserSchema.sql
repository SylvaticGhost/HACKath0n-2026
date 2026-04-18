CREATE TABLE user_schema.users (
    id uuid PRIMARY KEY,
    email varchar(50) UNIQUE,
    username varchar(30) UNIQUE,
    display_name varchar(30),
    created_at timestamptz DEFAULT now(),
    avatar TEXT
);

CREATE TABLE user_schema.manual_auth(
    user_id uuid PRIMARY KEY REFERENCES user_schema.users(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    updated_at timestamptz DEFAULT now()
);


