import { Request, Response, NextFunction } from "express";
import { validateRegisterInput } from "../utils/validator";
import HttpException from "../exceptions/HttpExceptions";
import { UNPROCESSABLE_ENTITY } from "http-status-codes";
import User, { IUserDocument } from "../models/User";
import jwt from "jsonwebtoken";

export const postRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password, confirmPassword, email } = req.body;

    const { errors, valid } = validateRegisterInput(
      username,
      password,
      confirmPassword,
      email
    );

    if (!valid) {
      throw new HttpException(
        UNPROCESSABLE_ENTITY,
        "User register input error",
        errors
      );
    }
    const oldUser = await User.findOne({username});

    if (oldUser) {
      throw new HttpException(
        UNPROCESSABLE_ENTITY,
        "username has been token",
        errors
      );
    }

    const user: IUserDocument = new User({
      username,
      email,
      password
    });

    const newUser: IUserDocument = await user.save();
    const token = jwt.sign({key: newUser.key}, process.env.JWT_SECKET_KEY!, {expiresIn: "1h"})
    res.json({
      code: 1,
      data: {
        // user: newUser._doc,
        token
      }
    })
  } catch (error) {
    next(error);
  }
};