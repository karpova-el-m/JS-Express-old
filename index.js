import express from "express";
import path from "path";
// import { requstTime } from "./middlewares.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const app = express();
const PORT = process.env.PORT ?? 3000;
const __dirname = path.resolve();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("yourdatabase.db");

db.run(
  `CREATE TABLE IF NOT EXISTS POSTS (
        postId INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        authorName TEXT(20) NOT NULL,
        title TEXT(250) NOT NULL,
        location TEXT(20) NOT NULL,
        publicationDate DATETIME NOT NULL)`
);

// app.use(requstTime);
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));

app.get("/", (req, res) => {
  res.render("write_post", { title: "Write post", active: "write_post" });
});

app.get("/posts", (req, res) => {
  res.render("posts", { title: "Posts", active: "posts" });
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About Blog", active: "about" });
});

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

app.get("/posts/:id", (req, res, next) => {
    var params = [req.params.id]
    db.get(`SELECT * FROM posts where postId = ?`, [params], (err, row) => {
        if (err) {
          res.status(400).json({"error": err.message});
          return next();
        }
        if (!row || !row.length) {
          res.status(400).json({"error": "User not found"});
          return next();
        }
        res.status(200).json(row);
      });
});

