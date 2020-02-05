import {
  Request,
  Response,
  NextFunction,
} from "express";
import HttpExceptions from "../exceptions/HttpExceptions";
import { INTERNAL_SERVER_ERROR } from "http-status-codes"

const errorMiddleWare = (error: HttpExceptions, _request: Request, response: Response, next: NextFunction) => {

  const {
    status = INTERNAL_SERVER_ERROR, 
    message = "Server Error",
    errors,
  } = error;

  response.status(status).json({
    status,
    code: 0,
    message,
    errors,
  });
  next();
}

export default errorMiddleWare;