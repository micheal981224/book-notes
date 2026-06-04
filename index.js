// ============================================================
// index.js — Book Notes server
//
// Express app that lets you track books you've read, rate them,
// and keep personal notes. Book covers come from the Open
// Library Covers API; everything else lives in PostgreSQL.
// ============================================================

import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

// ES modules don't provide __dirname, so we reconstruct it.
// This ensures Express can find /views and /public no matter
// which directory you run the command from.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// ------------------------------------------------------------
// Database connection
// Point this at your local PostgreSQL instance.
// ------------------------------------------------------------
const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
db.connect();

// ------------------------------------------------------------
// Middleware
// ------------------------------------------------------------
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// ------------------------------------------------------------
// Helper — build an Open Library cover URL from an ISBN
// Returns a placeholder SVG data-URI when no ISBN is available.
// https://openlibrary.org/dev/docs/api/covers
// ------------------------------------------------------------
function getCoverUrl(isbn, size = "M") {
  if (!isbn) {
    // Simple inline SVG placeholder — no external request needed
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='270' fill='%23ddd'%3E%3Crect width='180' height='270'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='14'%3ENo Cover%3C/text%3E%3C/svg%3E";
  }
  // The Open Library Covers API serves images directly via GET.
  // Sizes: S (small), M (medium), L (large).
  return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`;
}

// ------------------------------------------------------------
// Helper — map a sort query-string value to an ORDER BY clause
// Defaults to rating (highest first).
// ------------------------------------------------------------
function sortClause(sortBy) {
  switch (sortBy) {
    case "title":
      return "title ASC";
    case "recency":
      return "date_read DESC";
    case "rating":
    default:
      return "rating DESC";
  }
}

// ============================================================
// ROUTES
// ============================================================

// ---------- READ — list all books ----------
app.get("/", async (req, res) => {
  const sort = req.query.sort || "rating";

  try {
    const result = await db.query(
      `SELECT * FROM books ORDER BY ${sortClause(sort)}`
    );

    // Attach a cover URL to every book so the template can use it
    const books = result.rows.map((book) => ({
      ...book,
      cover: getCoverUrl(book.isbn, "M"),
    }));

    res.render("index", { books, currentSort: sort });
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).render("error", { message: "Could not load your books." });
  }
});

// ---------- CREATE — show the "add book" form ----------
app.get("/new", (req, res) => {
  res.render("new", { book: null, error: null });
});

// ---------- CREATE — handle form submission ----------
app.post("/new", async (req, res) => {
  const { title, author, isbn, rating, date_read, notes } = req.body;

  // Basic server-side validation
  if (!title || !author) {
    return res.render("new", {
      book: req.body,
      error: "Title and author are required.",
    });
  }

  try {
    // Optional: verify the ISBN returns a real cover via the API
    if (isbn) {
      const check = await axios.get(
        `https://openlibrary.org/isbn/${isbn}.json`
      );
      // If the ISBN is invalid Open Library returns 404 — axios will throw,
      // which we catch below and still save the book without a cover.
    }
  } catch {
    // ISBN lookup failed — that's fine, we just won't have a cover.
    console.log(`ISBN ${isbn} not found on Open Library — saving without cover.`);
  }

  try {
    await db.query(
      `INSERT INTO books (title, author, isbn, rating, date_read, notes)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [title, author, isbn || null, rating || null, date_read || null, notes || null]
    );
    res.redirect("/");
  } catch (err) {
    console.error("Error adding book:", err);
    res.render("new", {
      book: req.body,
      error: "Something went wrong saving your book.",
    });
  }
});

// ---------- UPDATE — show edit form ----------
app.get("/edit/:id", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books WHERE id = $1", [
      req.params.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).render("error", { message: "Book not found." });
    }

    res.render("edit", { book: result.rows[0], error: null });
  } catch (err) {
    console.error("Error loading book for edit:", err);
    res.status(500).render("error", { message: "Could not load book." });
  }
});

// ---------- UPDATE — handle edit submission ----------
app.post("/edit/:id", async (req, res) => {
  const { title, author, isbn, rating, date_read, notes } = req.body;

  if (!title || !author) {
    return res.render("edit", {
      book: { ...req.body, id: req.params.id },
      error: "Title and author are required.",
    });
  }

  try {
    await db.query(
      `UPDATE books
       SET title = $1, author = $2, isbn = $3, rating = $4,
           date_read = $5, notes = $6
       WHERE id = $7`,
      [
        title,
        author,
        isbn || null,
        rating || null,
        date_read || null,
        notes || null,
        req.params.id,
      ]
    );
    res.redirect("/");
  } catch (err) {
    console.error("Error updating book:", err);
    res.render("edit", {
      book: { ...req.body, id: req.params.id },
      error: "Something went wrong updating your book.",
    });
  }
});

// ---------- DELETE — remove a book ----------
app.post("/delete/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM books WHERE id = $1", [req.params.id]);
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting book:", err);
    res.status(500).render("error", { message: "Could not delete the book." });
  }
});

// ---------- DETAIL — single book view ----------
app.get("/book/:id", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books WHERE id = $1", [
      req.params.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).render("error", { message: "Book not found." });
    }

    const book = {
      ...result.rows[0],
      cover: getCoverUrl(result.rows[0].isbn, "L"),
    };

    res.render("detail", { book });
  } catch (err) {
    console.error("Error loading book:", err);
    res.status(500).render("error", { message: "Could not load the book." });
  }
});

// ------------------------------------------------------------
// Start
// ------------------------------------------------------------
app.listen(port, () => {
  console.log(`📚 Book Notes running at http://localhost:${port}`);
});
