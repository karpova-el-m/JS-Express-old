require('dotenv').config();
const env = process.env
const { DataSource } = require('typeorm');
const path = require('node:path');
const postsFile = require("./Posts.ts");
const Posts = postsFile.Posts;

const databasePath = path.join(__dirname, "dataBase.db")

export const AppDataSource = new DataSource({
    type: env.SQLITE3,
    database: databasePath,
    synchronize: true,
    entities: [Posts],
  })
  
  export const initDataSource = async () => {
    await AppDataSource.initialize();
    console.log("Database connected")
  }
  
  initDataSource().catch((err) =>
    console.log(`Database connection error: ${err}`)
  )