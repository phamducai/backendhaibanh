-- Tạo extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tạo enum types
CREATE TYPE user_role AS ENUM ('ADMIN', 'INSTRUCTOR', 'STUDENT');
CREATE TYPE content_type AS ENUM ('VIDEO', 'DOCUMENT', 'EXERCISE');
CREATE TYPE course_level AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
CREATE TYPE post_status AS ENUM ('DRAFT', 'PUBLISHED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
CREATE TYPE product_type AS ENUM ('COURSE', 'TEMPLATE');

-- Users Table (Hỗ trợ Google Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    google_id VARCHAR(255) UNIQUE,
    role user_role NOT NULL DEFAULT 'STUDENT',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- N8n Courses Table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2),
    instructor_id UUID NOT NULL REFERENCES users(id),
    thumbnail_url TEXT,
    level course_level NOT NULL,
    duration_hours INTEGER,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Course Modules Table (Chapters)
CREATE TABLE course_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Course Lessons Table
CREATE TABLE course_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "order" INTEGER NOT NULL,
    content_type content_type NOT NULL,
    youtube_video_id VARCHAR(20),
    video_title VARCHAR(255),
    video_filename VARCHAR(255),
    duration_seconds INTEGER,
    document_url TEXT,
    is_free_preview BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- N8n Templates Table
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id),
    preview_url TEXT,
    download_url TEXT,
    json_data JSONB,
    compatibility_version VARCHAR(50),
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Template Categories
CREATE TABLE template_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

-- Template Category Relationship
CREATE TABLE template_category_relationships (
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES template_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (template_id, category_id)
);

-- Blog Posts Table
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id),
    thumbnail_url TEXT,
    status post_status NOT NULL DEFAULT 'DRAFT',
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_featured BOOLEAN DEFAULT FALSE
);

-- Blog Categories
CREATE TABLE blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

-- Blog Category Relationship
CREATE TABLE blog_category_relationships (
    post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES blog_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, category_id)
);

-- Video Comments Table (for YouTube videos)
CREATE TABLE video_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    comment TEXT NOT NULL,
    timestamp_seconds INTEGER,
    parent_id UUID REFERENCES video_comments(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tags Table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE
);

-- Content Tags (can be used for courses, templates, or blog posts)
CREATE TABLE content_tags (
    content_type VARCHAR(20) NOT NULL, -- 'course', 'template', 'post'
    content_id UUID NOT NULL,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (content_type, content_id, tag_id)
);

-- Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'VND',
    status payment_status NOT NULL DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    provider VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    product_type product_type NOT NULL,
    product_id UUID NOT NULL
);

-- Enrollments Table
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    price_paid DECIMAL(10, 2) NOT NULL,
    payment_id UUID REFERENCES payments(id),
    is_completed BOOLEAN DEFAULT FALSE,
    progress_percentage INTEGER DEFAULT 0,
    UNIQUE(user_id, course_id)
);

-- Template Purchases
CREATE TABLE template_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    template_id UUID NOT NULL REFERENCES templates(id),
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    price_paid DECIMAL(10, 2) NOT NULL,
    payment_id UUID REFERENCES payments(id),
    UNIQUE(user_id, template_id)
);

-- Progress Tracking Table
CREATE TABLE progress_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_position_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(enrollment_id, lesson_id)
);

-- Reviews Table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    content_type VARCHAR(10) NOT NULL, -- 'course' or 'template'
    content_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, content_type, content_id)
);

-- Payment Providers Table
CREATE TABLE payment_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    api_key TEXT,
    api_secret TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sessions Table để lưu trữ JWT tokens
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX idx_course_lessons_module_id ON course_lessons(module_id);
CREATE INDEX idx_course_lessons_youtube_id ON course_lessons(youtube_video_id);
CREATE INDEX idx_templates_author_id ON templates(author_id);
CREATE INDEX idx_templates_slug ON templates(slug);
CREATE INDEX idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_video_comments_lesson_id ON video_comments(lesson_id);
CREATE INDEX idx_video_comments_user_id ON video_comments(user_id);
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_template_purchases_user_id ON template_purchases(user_id);
CREATE INDEX idx_template_purchases_template_id ON template_purchases(template_id);
CREATE INDEX idx_progress_tracking_enrollment_id ON progress_tracking(enrollment_id);
CREATE INDEX idx_progress_tracking_lesson_id ON progress_tracking(lesson_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_reviews_content_type_content_id ON reviews(content_type, content_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);


-- Create an Admin user
INSERT INTO users (
    email,
    full_name,
    role
) VALUES (
    'admin@example.com',
    'System Administrator',
    'ADMIN'
);

-- Insert sample blog categories
INSERT INTO blog_categories (name, slug) VALUES
('Hướng dẫn n8n', 'huong-dan-n8n'),
('Tự động hóa', 'tu-dong-hoa'),
('Tips & Tricks', 'tips-tricks'),
('Nghiên cứu tình huống', 'case-studies');

-- Insert sample template categories
INSERT INTO template_categories (name, slug) VALUES
('Tích hợp API', 'tich-hop-api'),
('Email Automation', 'email-automation'),
('Data Processing', 'data-processing'),
('CRM Workflows', 'crm-workflows');

-- Insert sample tags
INSERT INTO tags (name, slug) VALUES
('n8n', 'n8n'),
('Automation', 'automation'),
('Workflow', 'workflow'),
('API', 'api'),
('Integration', 'integration'),
('Zapier Alternative', 'zapier-alternative');

-- Insert sample payment providers
INSERT INTO payment_providers (name, config, is_active) VALUES
('MOMO', '{"endpoint": "https://test-payment.momo.vn/v2/gateway/api/create", "partner_code": "MOMOXXX", "access_key": "test_access_key", "secret_key": "test_secret_key"}', TRUE),
('VNPAY', '{"endpoint": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html", "tmn_code": "VNPAYXXX", "hash_secret": "test_hash_secret"}', TRUE),
('THE_VISA', '{"endpoint": "https://sandbox.checkout.com/api", "public_key": "VISAXXX", "secret_key": "test_secret_key"}', TRUE);