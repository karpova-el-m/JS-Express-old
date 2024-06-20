import express from "express";
import path from "path";
import {createRequire} from "module";
const require = createRequire(import.meta.url);

const app = express();
const PORT = process.env.PORT ?? 3000;
const __dirname = path.resolve();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("yourdatabase.db");

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));

app.use(express.json());

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
  `CREATE TABLE IF NOT EXISTS POSTS (
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
  res.render("writePost", { title: "Write post", active: "writePost" })
});

app.get("/posts/:id", (req, res, next) => {
    db.all(`SELECT * FROM posts where postId = ?`, [req.params.id], (err, row) => {
        if (err) {
          res.render("post", { title: err.message, active: "post" });
          return next();
        }
        if (!row || !row.length) {
          res.render("postNotFound", { title: "Post not found", active: "post" });
          return next();
        }
        res.render("post", { title: row.postId, post: row, active: "post" });
      });
});

app.get("/posts", (req, res, next) => {
  db.all("SELECT * FROM posts", [], (err, rows) => {
      if (err) {
        res.render("posts", { title: err.message, active: "posts" });
        return next();
      }
      if (!rows || !rows.length) {
        res.render("posts", { title: "Posts not found", active: "posts" });
        return next();
      }
      res.render("posts", { title: "Posts", titleBd: rows, active: "posts" });
    });
});

app.post("/", (req, res, next) => {
  var reqBody = req.body;
  db.run(`INSERT INTO posts (authorName, title, location) VALUES (?,?,?)`,
      [reqBody.authorName, reqBody.title, reqBody.location, reqBody.publicationDate],
      function (err, result) {
        if (err) {
          res.render("/", { title: err.message, active: "post" });
          return next();
        }
        let title = this.lastID
        res.status(201).json({
            "post_id": title
        })
        res.render("writePost", { title: title, active: "writePost" });
    });
});

app.put("/posts/:id", (req, res, next) => {
  var reqBody = req.body;
  db.all(`UPDATE posts SET authorName = ?, title = ?, location = ? WHERE postId = ?`,
      [reqBody.authorName, reqBody.title, reqBody.location, req.params.id],
      function (err, result) {
          if (err) {
              res.status(400).json({ "error": res.message })
              return next();
          }
          res.status(200).json(this.changes);
      });

});

app.delete("/posts/delete/:id", (req, res, next) => {
  db.all(`DELETE FROM posts WHERE postId = ?`, [req.params.id], function (err, result) {
          if (err) {
              res.status(400).json({ "error": res.message })
              return next();
          }
          if (this.changes > 0) {
            res.render("delete", { title: "Post has been deleted", active: "post", result: this.changes });
            res.status(200).json(this.changes)
          } else {
            res.render("postNotFound", { title: "Posts not found", active: "post" });
          }
      });
});