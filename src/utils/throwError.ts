import HttpException from "../exceptions/HttpExceptions";
import { 
  NOT_FOUND, 
  UNPROCESSABLE_ENTITY,
  NOT_ACCEPTABLE,
} from "http-status-codes";
import { CreateBodyError } from "../utils/validator";

export const throwPostNotFoundError = (): never => {
  throw new HttpException(NOT_FOUND, "Post not found");
};

export const throwCreateBodyError = (errors: CreateBodyError): never => {
  throw new HttpException(UNPROCESSABLE_ENTITY, "Body must be not empty", errors);
}

export const throwCommentNotFoundError = (): never => {
  throw new HttpException(NOT_FOUND, "Comment Not Found");
}
export const throwActionNotAllowedError = (): never => {
  throw new HttpException(NOT_ACCEPTABLE, "Not Arrowed");
}