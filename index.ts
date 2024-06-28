var express = require('express');
const path = require('node:path');
const postsFile = require("./Posts.ts");
const Posts = postsFile.Posts;
const dataSourceFile = require("./data-source.ts");
const AppDataSource = dataSourceFile.AppDataSource;
import { Request, Response, NextFunction } from "express";


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

app.get("/about", (req: Request, res: Response) => {
  res.render("about", { title: "About Blog", active: "about" });
});

app.get("/", (req: Request, res: Response) => {
  res.render("startPage", { title: "Start page", active: "-" });
});

app.get("/posts", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = await postsRepository.find();
    if (posts.length === 0) {
      res.render("postNotFound", { title: "Posts not found", active: "posts" });
    } else {
      res.render("posts", { title: "Posts", titleBd: posts, active: "posts" });
    }
  } catch (err) {
    res.render("posts", { title: err, active: "posts" });
  }
});

app.get("/posts/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    let id: number = Number(req.params.id)
    const post = await postsRepository.findOneBy({ postId: id });
    res.render("post", { title: `Post with ID: ${id}`, post: post, active: "-" });
  } catch (err) {
    res.render("post", { title: err, active: "-" });
  }
});

app.get("/write_post", (req: Request, res: Response) => {
  res.render("writePost", { title: "Write post", active: "writePost" });
});

app.post("/write_post/saved", async (req: Request, res: Response, next: NextFunction) => {
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

app.get("/posts/delete/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    let id: number = Number(req.params.id);
    const post = await postsRepository.delete({ postId: id });
    res.render("result", {
      title: `Post with ID ${id} has been deleted`,
      active: "-",
    });
  } catch (err) {
    res.render("postNotFound", { title: err, active: "posts" });
  }
});

app.get("/posts/update/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  res.render("updatePost", {
    title: `Update post, post ID: ${id}`,
    id: id,
    active: "-",
  });
});

app.get("/updated/:id", async (req: Request, res: Response, next: NextFunction) => {
  var reqBody = { ...req.query };
  let id: number = Number(req.params.id);
  try {
    const upPost = postsRepository.create(reqBody);
    const post = await postsRepository.findOneBy({ postId: id });
    postsRepository.merge(post, upPost);
    await postsRepository.save(post)
    let title = `Your post has been saved, post ID: ${id}`;
    res.render("writePost", { title: title, active: "writePost" });
  } catch (err) {
    res.render("writePost", { title: err, active: "writePost" });
  }
});