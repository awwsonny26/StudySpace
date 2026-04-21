CREATE DATABASE IF NOT EXISTS studyspace_lab2;
USE studyspace_lab2;

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  duration VARCHAR(255) NOT NULL,
  categoryId INT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_courses_category
    FOREIGN KEY (categoryId) REFERENCES categories(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

INSERT INTO categories (name, description)
VALUES ('Frontend', 'HTML, CSS, JavaScript and responsive web layout.');

SELECT * FROM categories;

UPDATE categories
SET description = 'Updated description for SQL UPDATE demonstration.'
WHERE name = 'Frontend';

DELETE FROM categories
WHERE name = 'Frontend';
