// http://localhost:3000/posts
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require('dotenv').config();
const env = process.env

import express from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT ?? 3000;
const __dirname = path.resolve();

const sqlite3 = require(env.SQLITE3).verbose();
const db = new sqlite3.Database(env.DB_NAME);

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

async function startApp() {
  try {
    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}...`);
    });
  } catch (err) {
    console.log(err);
  }
}
startApp();

db.run(
  `CREATE TABLE IF NOT EXISTS posts (
        postId INTEGER PRIMARY KEY AUTOINCREMENT,
        authorName TEXT(20),
        title TEXT(250),
        location TEXT(20),
        publicationDate DATETIME DEFAULT CURRENT_TIMESTAMP)`
);

app.get("/about", (req, res) => {
  res.render("about", { title: "About Blog", active: "about" });
});

app.get("/", (req, res) => {
  res.render("startPage", { title: "Write post", active: "-" });
});

app.get("/posts/:id", (req, res, next) => {
  db.all(
    `SELECT * FROM posts where postId = ?`,
    [req.params.id],
    (err, row) => {
      if (err) {
        res.render("post", { title: err.message, active: "-" });
      }
      if (!row || !row.length) {
        res.render("postNotFound", { title: "Post not found", active: "-" });
      }
      res.render("post", { title: row.postId, post: row, active: "-" });
    }
  );
});

app.get("/posts", (req, res, next) => {
  db.all("SELECT * FROM posts", [], (err, rows) => {
    if (err) {
      res.render("posts", { title: err.message, active: "posts" });
    }
    if (!rows || !rows.length) {
      res.render("postNotFound", { title: "Posts not found", active: "posts" });
    }
    res.render("posts", { title: "Posts", titleBd: rows, active: "posts" });
  });
});

app.get("/write_post", (req, res) => {
  res.render("writePost", { title: "Write post", active: "writePost" });
});

app.post("/write_post/saved", (req, res, next) => {
  var reqBody = { ...req.body };
  db.run(
    `INSERT INTO posts (authorName, title, location) VALUES (?,?,?)`,
    [
      reqBody.authorName,
      reqBody.title,
      reqBody.location,
      reqBody.publicationDate,
    ],
    function (err, result) {
      if (err) {
        res.render("writePost", { title: err.message, active: "-" });
      }
      let title = `Your post has been saved, post ID: ${this.lastID}`;
      res.render("writePost", { title: title, active: "writePost" });
    }
  );
});

app.get("/posts/update/:id", (req, res) => {
  const id = req.params.id;
  res.render("updatePost", {
    title: `Update post, post ID: ${id}`,
    id: id,
    active: "-",
  });
});

app.get("/updated/:id", (req, res, next) => {
  var reqBody = { ...req.query };
  db.all(
    `UPDATE posts SET authorName = ?, title = ?, location = ? WHERE postId = ?`,
    [reqBody.authorName, reqBody.title, reqBody.location, req.params.id],
    function (err, result) {
      if (err) {
        res.status(400).json({ error: res.message });
      }
      let title = `Your post has been updated, ID: ${req.params.id}`;
      res.render("result", { title: title, active: "-" });
    }
  );
});

app.get("/posts/delete/:id", (req, res, next) => {
  db.all(
    `DELETE FROM posts WHERE postId = ?`,
    [req.params.id],
    function (err, result) {
      if (err) {
        res.status(400).json({ error: res.message });
      } else {
        res.render("result", {
          title: "Post has been deleted",
          active: "post",
          result: this.changes,
        });
      }
    }
  );
});
