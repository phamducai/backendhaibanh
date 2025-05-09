-- Enable UUID extension (still useful for UUID validation and functions)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Database schema for online course platform with UUID primary keys
-- Backend will generate UUIDs instead of database defaults

-- Users Table
CREATE TABLE Users (
    UserID UUID PRIMARY KEY, -- No default, will be provided by backend
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    FullName VARCHAR(100),
    Phone VARCHAR(20),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IsDeleted BOOLEAN DEFAULT FALSE
);

-- Products Table (For both Courses and Templates)
CREATE TABLE Products (
    ProductID UUID PRIMARY KEY, -- No default, will be provided by backend
    ProductName VARCHAR(255) NOT NULL,
    IsCourse BOOLEAN NOT NULL, -- TRUE for courses, FALSE for templates
    Description TEXT,
    RegularPrice DECIMAL(10,2) NOT NULL,
    SalePrice DECIMAL(10,2),
    ImageURL VARCHAR(255),
    DownloadURL VARCHAR(255), -- Used only when IsCourse is FALSE (templates)
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IsActive BOOLEAN DEFAULT TRUE,
    IsDeleted BOOLEAN DEFAULT FALSE
);

-- Chapters Table (Only for course-type products)
CREATE TABLE Chapters (
    ChapterID UUID PRIMARY KEY, -- No default, will be provided by backend
    ProductID UUID NOT NULL,
    ChapterName VARCHAR(255) NOT NULL,
    DisplayOrder INTEGER NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IsDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE
    -- Constraint will be enforced by trigger below
);

-- Lessons Table (Only for course chapters)
CREATE TABLE Lessons (
    LessonID UUID PRIMARY KEY, -- No default, will be provided by backend
    ChapterID UUID NOT NULL,
    LessonName VARCHAR(255) NOT NULL,
    VideoURL VARCHAR(255), -- For streaming only, not downloadable
    Duration VARCHAR(50),
    DisplayOrder INTEGER NOT NULL,
    Description TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IsDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (ChapterID) REFERENCES Chapters(ChapterID) ON DELETE CASCADE
);

-- UserProducts Table (For tracking purchases)
CREATE TABLE UserProducts (
    UserProductID UUID PRIMARY KEY, -- No default, will be provided by backend
    UserID UUID NOT NULL,
    ProductID UUID NOT NULL,
    PurchaseDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IsDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE,
    CONSTRAINT unique_user_product UNIQUE (UserID, ProductID)
);

-- Create function for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.UpdatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to enforce that chapters only belong to courses
CREATE OR REPLACE FUNCTION enforce_chapter_course_check()
RETURNS TRIGGER AS $$
DECLARE
    is_course BOOLEAN;
BEGIN
    SELECT IsCourse INTO is_course FROM Products WHERE ProductID = NEW.ProductID;
    
    IF NOT is_course THEN
        RAISE EXCEPTION 'Cannot add chapter to non-course product';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-updating timestamps
CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON Users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_products_timestamp
BEFORE UPDATE ON Products
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_chapters_timestamp
BEFORE UPDATE ON Chapters
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_lessons_timestamp
BEFORE UPDATE ON Lessons
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Create trigger to enforce chapters only for courses
CREATE TRIGGER enforce_chapter_course_check
BEFORE INSERT OR UPDATE ON Chapters
FOR EACH ROW
EXECUTE FUNCTION enforce_chapter_course_check();

-- Add indexes for performance
CREATE INDEX idx_product_is_course ON Products(IsCourse);
CREATE INDEX idx_product_is_deleted ON Products(IsDeleted);
CREATE INDEX idx_user_products ON UserProducts(UserID, ProductID);
CREATE INDEX idx_chapter_product ON Chapters(ProductID);
CREATE INDEX idx_lesson_chapter ON Lessons(ChapterID);
CREATE INDEX idx_user_email ON Users(Email);

-- Comments for documentation
COMMENT ON TABLE Users IS 'User accounts for the platform';
COMMENT ON TABLE Products IS 'Both courses and templates, distinguished by IsCourse flag';
COMMENT ON TABLE Chapters IS 'Chapters for course-type products only';
COMMENT ON TABLE Lessons IS 'Video lessons within chapters';
COMMENT ON TABLE UserProducts IS 'Tracks user purchases of both courses and templates';