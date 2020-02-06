import { Request, Response, NextFunction } from "express";
import { IUserDocument } from "../models/User";
import { checkBody } from "../utils/validator";
import Post from "../models/Post";
import { 
  throwCreateBodyError, 
  throwPostNotFoundError,
  throwCommentNotFoundError,
  throwActionNotAllowedError,
} from "../utils/throwError";

export const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.currentUser as IUserDocument;

    const { key } = req.params;
    const { body } = req.body;

    const {errors, valid} = checkBody(body);

    if (!valid) {
      return throwCreateBodyError(errors);
    }

    const post = await Post.findOne({key});

    if (post) {
      post.comments.unshift({
        username: user.username,
        createdAt: new Date().toISOString(),
        body
      });

      await post.save();

      res.json({
        code: 1,
        message: "comment was created successfully",
        data: post,
      });
    } else {
      throwPostNotFoundError();
    }
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username } = req.currentUser as IUserDocument;

    const { key, commentId } = req.params;

    const post = await Post.findOne({key});

    if (post) {
      const commentIndex = post.comments.findIndex(c => c.id === commentId);

      const comment = post.comments[commentIndex];

      if (!comment) {
        throwCommentNotFoundError();
      }

      if (comment.username === username) {
        post.comments.splice(commentIndex, 1);

        await post.save();

        res.json({
          success: true,
          data: { message: "comment was deleted successfully", post }
        });
      } else {
        throwActionNotAllowedError();
      }
    } else {
      throwPostNotFoundError();
    }
  } catch (error) {
    next(error);
  }
};