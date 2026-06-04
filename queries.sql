-- ============================================================
-- Book Notes — Database Setup
-- Run this file once to create the database and seed it
-- with a few starter entries.
--
--   psql -U postgres -f queries.sql
-- ============================================================

-- Create the database (run separately if needed)
-- CREATE DATABASE booknotes;

-- Connect to booknotes before running the rest:
-- \c booknotes

-- Drop existing table if you want a fresh start
DROP TABLE IF EXISTS books;

-- Main books table — one row per book you've read
CREATE TABLE books (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(300) NOT NULL,
  author      VARCHAR(300) NOT NULL,
  isbn        VARCHAR(20),                        -- used to fetch covers from Open Library
  rating      INTEGER CHECK (rating >= 1 AND rating <= 10),
  date_read   DATE DEFAULT CURRENT_DATE,
  notes       TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data — a handful of books to start with
INSERT INTO books (title, author, isbn, rating, date_read, notes) VALUES
(
  'Atomic Habits',
  'James Clear',
  '0735211299',
  9,
  '2024-01-15',
  'Tiny changes, remarkable results. The four laws of behaviour change — make it obvious, attractive, easy, and satisfying — are a practical framework you can apply to almost anything. The "habit stacking" technique alone was worth the read.'
),
(
  'Thinking, Fast and Slow',
  'Daniel Kahneman',
  '0374533555',
  8,
  '2024-03-22',
  'System 1 (fast, intuitive) vs System 2 (slow, deliberate). We are far less rational than we think. Anchoring, loss aversion, and the planning fallacy show up everywhere once you start noticing them. Dense but rewarding.'
),
(
  'The Almanack of Naval Ravikant',
  'Eric Jorgenson',
  '1544514212',
  10,
  '2024-06-10',
  'A distillation of Naval''s wisdom on wealth and happiness. "Seek wealth, not money or status." Leverage comes from code, media, capital, and labour — and the first two don''t need permission. Re-read this every year.'
),
(
  'Sapiens',
  'Yuval Noah Harari',
  '0062316117',
  7,
  '2023-11-05',
  'A sweeping history of humankind from the Cognitive Revolution to today. The idea that large-scale cooperation depends on shared myths (money, religion, nations) was a real perspective shift. Some chapters drag, but the big ideas are worth it.'
),
(
  'Deep Work',
  'Cal Newport',
  '1455586692',
  8,
  '2024-08-18',
  'The ability to focus without distraction is becoming both rarer and more valuable. Newport makes a strong case for scheduling deep work blocks, quitting social media, and embracing boredom. Changed how I structure my mornings.'
),
(
  'Man''s Search for Meaning',
  'Viktor E. Frankl',
  '080701429X',
  10,
  '2023-07-20',
  'Frankl''s account of surviving the concentration camps, and the logotherapy framework that emerged from it. "He who has a why to live can bear almost any how." Short, devastating, and life-affirming. Everyone should read this.'
);
