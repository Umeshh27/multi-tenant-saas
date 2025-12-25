-- =========================
-- SEED DATA
-- =========================

-- 1️⃣ SUPER ADMIN (NO TENANT)
INSERT INTO users (
    id,
    tenant_id,
    email,
    password_hash,
    full_name,
    role,
    is_active
) VALUES (
    uuid_generate_v4(),
    NULL,
    'superadmin@system.com',
    '$2b$10$79U2uYNPwqHhY35ocJiK0O0/WOWfB4E0mz/58pLlcD1f/hmqlc86y', -- Admin@123
    'System Super Admin',
    'super_admin',
    true
);

-- 2️⃣ DEMO TENANT
INSERT INTO tenants (
    id,
    name,
    subdomain,
    status,
    subscription_plan,
    max_users,
    max_projects
) VALUES (
    uuid_generate_v4(),
    'Demo Company',
    'demo',
    'active',
    'pro',
    25,
    15
);

-- 3️⃣ TENANT ADMIN
INSERT INTO users (
    id,
    tenant_id,
    email,
    password_hash,
    full_name,
    role,
    is_active
) VALUES (
    uuid_generate_v4(),
    (SELECT id FROM tenants WHERE subdomain = 'demo'),
    'admin@demo.com',
    '$2b$10$GbR52VrRXMBuu.Qiq5d.MuSj6Fhx0j54fEbXAUxLoCmBlhVLIoMHy', -- Demo@123
    'Demo Tenant Admin',
    'tenant_admin',
    true
);

-- 4️⃣ REGULAR USERS
INSERT INTO users (
    id,
    tenant_id,
    email,
    password_hash,
    full_name,
    role,
    is_active
) VALUES
(
    uuid_generate_v4(),
    (SELECT id FROM tenants WHERE subdomain = 'demo'),
    'user1@demo.com',
    '$2b$10$hPTv4eJyPvQ3y9sjjDZaoe1TyHHit87L2jVTjg0NfgZG8055Rmxd.', -- User@123
    'Demo User One',
    'user',
    true
),
(
    uuid_generate_v4(),
    (SELECT id FROM tenants WHERE subdomain = 'demo'),
    'user2@demo.com',
    '$2b$10$hPTv4eJyPvQ3y9sjjDZaoe1TyHHit87L2jVTjg0NfgZG8055Rmxd.', -- User@123
    'Demo User Two',
    'user',
    true
);

-- 5️⃣ PROJECTS
INSERT INTO projects (
    id,
    tenant_id,
    name,
    description,
    status,
    created_by
) VALUES
(
    uuid_generate_v4(),
    (SELECT id FROM tenants WHERE subdomain = 'demo'),
    'Project Alpha',
    'First demo project',
    'active',
    (SELECT id FROM users WHERE email = 'admin@demo.com')
),
(
    uuid_generate_v4(),
    (SELECT id FROM tenants WHERE subdomain = 'demo'),
    'Project Beta',
    'Second demo project',
    'active',
    (SELECT id FROM users WHERE email = 'admin@demo.com')
);

-- 6️⃣ TASKS
INSERT INTO tasks (
    id,
    project_id,
    tenant_id,
    title,
    description,
    status,
    priority,
    assigned_to
) VALUES
(
    uuid_generate_v4(),
    (SELECT id FROM projects WHERE name = 'Project Alpha'),
    (SELECT id FROM tenants WHERE subdomain = 'demo'),
    'Setup project structure',
    'Initial setup task',
    'todo',
    'high',
    (SELECT id FROM users WHERE email = 'user1@demo.com')
),
(
    uuid_generate_v4(),
    (SELECT id FROM projects WHERE name = 'Project Beta'),
    (SELECT id FROM tenants WHERE subdomain = 'demo'),
    'Design database schema',
    'Create ERD and tables',
    'in_progress',
    'medium',
    (SELECT id FROM users WHERE email = 'user2@demo.com')
);
