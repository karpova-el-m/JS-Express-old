var express = require('express'); 
const path = require('node:path');
// const { DataSource } = require('typeorm')
const postsFile = require("./Posts.ts");
const Posts = postsFile.Posts;
const dataSourceFile = require("./data-source.ts");
const AppDataSource = dataSourceFile.AppDataSource;

const postsRepository = AppDataSource.getRepository(Posts);

const app = express();
const PORT = process.env.PORT ?? 3000;
// const databasePath = path.join(__dirname, "dataBase.db")

// export const AppDataSource = new DataSource({
//   type: env.SQLITE3,
//   database: databasePath,
//   synchronize: true,
//   entities: [Posts],
// })

// export const initDataSource = async () => {
//   await AppDataSource.initialize();
//   console.log("Database connected")
// }

// initDataSource().catch((err) =>
//   console.log(`Database connection error: ${err}`)
// )

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

app.get("/about", (req: any, res: any) => {
  res.render("about", { title: "About Blog", active: "about" });
});

app.get("/", (req: any, res: any) => {
  res.render("startPage", { title: "Start page", active: "-" });
});

// const getPosts = async () => {
//   try {
//     const posts = await 
//   }
// }

// app.get("/posts/:id", (req, res, next) => {
//   db.all(
//     `SELECT * FROM posts where postId = ?`,
//     [req.params.id],
//     (err, row) => {
//       if (err) {
//         res.render("post", { title: err.message, active: "-" });
//       }
//       if (!row || !row.length) {
//         res.render("postNotFound", { title: "Post not found", active: "-" });
//       }
//       res.render("post", { title: row.postId, post: row, active: "-" });
//     }
//   );
// });

app.get("/write_post", (req: any, res: any) => {
  res.render("writePost", { title: "Write post", active: "writePost" });
});