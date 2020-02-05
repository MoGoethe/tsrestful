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

import HttpExceptions from "./exceptions/HttpExceptions";
import errorMiddleWare from "./middlewares/errror.middleware";

import {
  postRegister
} from "./controllers/user";

const app: Express = express();

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "hello world",
  })
})
app.post("/api/user/register", postRegister);

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
