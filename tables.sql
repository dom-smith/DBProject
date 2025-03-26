-- Locations Table
CREATE TABLE locations (
    location_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    address TEXT
);

-- Universities Table
CREATE TABLE universities (
    university_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location_id INT REFERENCES locations(location_id) ON DELETE SET NULL
);

-- Users Table
CREATE TABLE users (
    user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(50) CHECK (role IN ('student', 'admin', 'super_admin')),
    university_id INT REFERENCES universities(university_id) ON DELETE SET NULL
);

-- RSOs Table
CREATE TABLE rsos (
    rso_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    university_id INT REFERENCES universities(university_id) ON DELETE CASCADE,
    admin_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT FALSE
);

-- RSO Members Table (Many-to-Many Users <-> RSOs)
CREATE TABLE rso_members (
    rso_id INT REFERENCES rsos(rso_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    PRIMARY KEY (rso_id, user_id)
);

-- Event Categories Table
CREATE TABLE event_categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL
);

-- Events Table
CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INT REFERENCES event_categories(category_id) ON DELETE CASCADE,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location_id INT REFERENCES locations(location_id) ON DELETE SET NULL,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    created_by UUID REFERENCES users(user_id) ON DELETE CASCADE,
    rso_id INT REFERENCES rsos(rso_id) ON DELETE SET NULL,
    visibility VARCHAR(50) CHECK (visibility IN ('public', 'private', 'rso')),
    is_approved BOOLEAN DEFAULT FALSE
);

-- Comments & Ratings Table
CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    event_id INT REFERENCES events(event_id) ON DELETE CASCADE,
    comment_text TEXT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT now()
);
