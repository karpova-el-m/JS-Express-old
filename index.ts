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

app.get("/posts", async (req: any, res: any, next: any) => {
    try {
      const posts = await postsRepository.find();
      if (posts.length === 0) {
        res.render("postNotFound", { title: "Posts not found", active: "posts" });
      } else {
        res.render("posts", { title: "Posts", titleBd: posts, active: "posts" });
      }
      // return posts;
    } catch (err) {
      res.render("posts", { title: err, active: "posts" });
    }
});

app.get("/write_post", (req: any, res: any) => {
  res.render("writePost", { title: "Write post", active: "writePost" });
});

app.post("/write_post/saved", async (req: any, res: any, next: any) => {
  var reqBody = { ...req.body };
  try {
    const newPost = postsRepository.create(reqBody);
    await postsRepository.save(newPost);
    let title = `Your post has been saved, post ID: ${newPost.postId}`;
    res.render("writePost", { title: title, active: "writePost" });
  } catch (err) {
    res.render("writePost", { title: err, active: "writePost" });
  }
});

//   db.run(
//     `INSERT INTO posts (authorName, title, location) VALUES (?,?,?)`,
//     [
//       reqBody.authorName,
//       reqBody.title,
//       reqBody.location,
//       reqBody.publicationDate,
//     ],
//     function (err, result) {
//       if (err) {
//         res.render("writePost", { title: err.message, active: "-" });
//       }
//       let title = `Your post has been saved, post ID: ${this.lastID}`;
//       res.render("writePost", { title: title, active: "writePost" });
//     }
//   );
// });