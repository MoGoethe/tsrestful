import express, {
  Express,
  Request,
  Response,
  NextFunction,
} from "express";
import mongoose from "mongoose";
import {
  NOT_FOUND
} from "http-status-codes";
import "dotenv/config";

// // @ts-ignore
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";

import HttpExceptions from "./exceptions/HttpExceptions";
import errorMiddleWare from "./middlewares/errror.middleware";
import checkAuthMiddleware from "./middlewares/checkAuth.middleware";
import * as userController from "./controllers/user";
import * as postController from "./controllers/post";
import * as commentController from "./controllers/comment";

const app: Express = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());
app.use(cors());

app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "hello world",
  })
})
app.post("/api/user/register", userController.postRegister);
app.post("/api/user/login", userController.postLogin);

app.get("/api/posts", postController.getPosts);
app.post("/api/posts", checkAuthMiddleware, postController.createPost);

app.get("/api/posts/:key", postController.getPost);
app.put("/api/posts/:key", checkAuthMiddleware, postController.updatePost);
app.delete("/api/posts/:key", checkAuthMiddleware, postController.deletePost);

app.post("/api/posts/:key/like", checkAuthMiddleware, postController.likePost);
app.post("/api/posts/:key/comment", checkAuthMiddleware, commentController.createComment);
app.delete("/api/posts/:key/comment/:commentId", checkAuthMiddleware, commentController.deleteComment);


app.use((_req: Request, _res: Response, next: NextFunction) => {
  const error = new HttpExceptions(NOT_FOUND, "Router Not Found");
  next(error);
})
app.use(errorMiddleWare);

const port: any = process.env.PORT || 7000;

const main = async () => {
  mongoose.set("useCreateIndex", true);
  await mongoose.connect("mongodb://localhost:27017/tsrestfulapi", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });

  app.listen(port, () => {
    console.log(`server running on http://localhost:${port}`);
  });
}

main();
