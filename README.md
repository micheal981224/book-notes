# 📚 Book Notes

A personal book-tracking app inspired by [Derek Sivers' book list](https://sive.rs/book).  
Store every book you read, rate it, keep notes, and browse covers — all powered by
**Node.js**, **Express**, **PostgreSQL**, and the [Open Library Covers API](https://openlibrary.org/dev/docs/api/covers).

![Stack](https://img.shields.io/badge/Node.js-Express-green)
![Database](https://img.shields.io/badge/PostgreSQL-pg-blue)
![Template](https://img.shields.io/badge/EJS-Templating-yellow)

---

## Features

| Feature | Details |
|---------|---------|
| **CRUD** | Add, view, edit, and delete book entries |
| **Sorting** | Sort your list by **rating**, **recency**, or **title** |
| **Book covers** | Fetched automatically from the Open Library Covers API via ISBN |
| **Notes** | Keep personal takeaways and key ideas for every book |
| **Detail view** | Full-page view for each book with large cover and complete notes |

---

## Prerequisites

- **Node.js** v18+ — [download](https://nodejs.org/)
- **PostgreSQL** 14+ — [download](https://www.postgresql.org/download/)

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/book-notes.git
cd book-notes
```

### 2. Install dependencies

```bash
npm i
```

### 3. Create the database

Open a PostgreSQL shell and create the database:

```sql
CREATE DATABASE booknotes;
```

Then run the schema + seed file:

```bash
psql -U postgres -d booknotes -f queries.sql
```

### 4. Configure the database connection

Open `index.js` and update the `pg.Client` config with your local credentials:

```js
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "booknotes",
  password: "your-password-here",   // ← change this
  port: 5432,
});
```

### 5. Start the server

```bash
nodemon index.js
```

Visit **http://localhost:3000** — you're in!

---

## Project Structure

```
book-notes/
├── index.js              # Express server, routes, API integration
├── queries.sql           # Database schema + seed data
├── package.json
├── public/
│   └── styles.css        # All styles
├── views/
│   ├── partials/
│   │   ├── header.ejs    # Shared head + nav
│   │   └── footer.ejs    # Shared footer
│   ├── index.ejs         # Home — book grid with sort controls
│   ├── new.ejs           # Add-a-book form
│   ├── edit.ejs          # Edit-a-book form
│   ├── detail.ejs        # Single-book full view
│   └── error.ejs         # Error page
└── README.md
```

---

## Database Schema

```
┌──────────────────────────────────────────┐
│                  books                    │
├──────────────┬───────────────────────────┤
│ id           │ SERIAL PRIMARY KEY        │
│ title        │ VARCHAR(300) NOT NULL     │
│ author       │ VARCHAR(300) NOT NULL     │
│ isbn         │ VARCHAR(20)              │
│ rating       │ INTEGER (1–10)           │
│ date_read    │ DATE                     │
│ notes        │ TEXT                     │
│ created_at   │ TIMESTAMP               │
└──────────────┴───────────────────────────┘
```

---

## API Reference

**Open Library Covers API**  
Covers are fetched via a simple GET request using the book's ISBN:

```
https://covers.openlibrary.org/b/isbn/{ISBN}-M.jpg
```

Sizes: `S` (small), `M` (medium), `L` (large).

No API key required.

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL via `pg`
- **HTTP Client:** Axios (for ISBN validation against Open Library)
- **Templating:** EJS
- **Styling:** Vanilla CSS with custom properties

---

## License

MIT — do whatever you want with it.
