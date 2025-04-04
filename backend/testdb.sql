-- Users table
CREATE TABLE users (
  user_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Profiles table
CREATE TABLE profiles (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(user_id),
  bio TEXT DEFAULT '',
  organization TEXT DEFAULT ''
);

-- Messages table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender VARCHAR(50) REFERENCES users(user_id),
  receiver VARCHAR(50) REFERENCES users(user_id),
  content TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);

-- Audit log table (login/logout tracking)
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(user_id),
  action VARCHAR(20), -- 'login' or 'logout'
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Organizations table (like Discord servers)
CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_by VARCHAR(50) REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Organization members with role-based access
CREATE TABLE organization_members (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(user_id),
  org_id INTEGER REFERENCES organizations(id),
  role VARCHAR(20) DEFAULT 'member',  -- 'admin', 'member'
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, org_id)
);

CREATE TABLE join_requests (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(user_id),
  org_id INTEGER REFERENCES organizations(id),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  requested_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, org_id)
);
