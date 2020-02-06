import { Response, Request, NextFunction } from "express";
import HttpException from "../exceptions/HttpExceptions";
import { UNAUTHORIZED } from "http-status-codes";
import Post from "../models/Post";
import { IUserDocument } from "../models/User";
import { throwPostNotFoundError, throwCreateBodyError } from "../utils/throwError";
import { checkBody } from "../utils/validator";

export const getPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit = 2 } = req.query;
    const customLabels = {
      totalDocs: "total_count",
      docs: "posts",
      limit: "limit_value",
      page: "current_page",
      nextPage: "next",
      prevPage: "prev",
      totalPages: "num_pages",
      pagingCounter: "slNo",
      meta: "page"
    };
    const options = {
      page,
      limit,
      customLabels,
    }
    
    const posts = await Post.paginate({}, options);

    res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    next(error);
  }
}

export const getPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { key } = req.params;

    const post = await Post.findOne({key});

    if (post) {
      res.json({
        success: true,
        data: { post }
      });
    } else {
      throwPostNotFoundError();
    }
  } catch (error) {
    next(error);
  }
};

export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.currentUser as IUserDocument;
    const { body } = req.body;

    const {errors, valid} = checkBody(body);

    if (!valid) {
      return throwCreateBodyError(errors);
    }

    const post = new Post({
      body,
      createdAt: new Date().toISOString(),
      username: user.username,
      user: user.id,
    });

    await post.save();

    res.json({ 
      code: 1,
      message: "created successfully",
      data: { post },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { key } = req.params;
    const post = await Post.findOne({key});

    const { body } = req.body;
    const {errors, valid} = checkBody(body);
    if (!valid) {
      return throwCreateBodyError(errors);
    }

    const user = req.currentUser as IUserDocument;

    if (post) {
      if (post.username === user.username) {
        const resPost = await Post.findOneAndUpdate({key}, { body }, { new: true } );
        res.json({
          code: 1,
          message: "updated successfully",
          data: { post: resPost }
        });
      } else {
        throw new HttpException(UNAUTHORIZED, "Action not allowed");
      }
    } else {
      throwPostNotFoundError();
    }
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { key } = req.params;

    const post = await Post.findOne({key});

    const user = req.currentUser as IUserDocument;

    if (post) {
      if (post.username === user.username) {
        await Post.findOneAndDelete({key});

        res.json({
          code: 1,
          message: "deleted successfully",
        });
      } else {
        throw new HttpException(UNAUTHORIZED, "Action not allowed");
      }
    } else {
      throwPostNotFoundError();
    }
  } catch (error) {
    next(error);
  }
};

export const likePost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { key } = req.params;

    const post = await Post.findOne({key}).populate("user", "-password");

    const user = req.currentUser as IUserDocument;

    if (post) {
      if (post.likes.find(like => like.username === user.username)) {
        post.likes = post.likes.filter(like => like.username !== user.username);
        user.like_posts = user.like_posts.filter(id => !user.like_posts.includes(id));
      } else {
        user.like_posts.push(post.id);
        post.likes.push({
          username: user.username,
          createdAt: new Date().toISOString()
        });
      }

      await post.save();
      await user.save();

      res.json({
        success: true,
        data: { post }
      });
    } else {
      throwPostNotFoundError();
    }
  } catch (error) {
    next(error);
  }
};