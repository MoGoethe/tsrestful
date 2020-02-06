import { Request, Response, NextFunction } from "express";
import { validateRegisterInput, validateLoginInput, LoginInputError } from "../utils/validator";
import HttpException from "../exceptions/HttpExceptions";
import { UNPROCESSABLE_ENTITY } from "http-status-codes";
import User, { IUserDocument } from "../models/User";
import bcrypt from "bcrypt";


const throwLoginValidateError = (errors: LoginInputError): never => {
  throw new HttpException(
    UNPROCESSABLE_ENTITY,
    "User login input error",
    errors,
  )
}

export const postRegister = async ( 
  req: Request, 
  res: Response, 
  next: NextFunction 
): Promise<void> => {
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
    const token: string = newUser.generateToken();
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

export const postLogin = async(
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const {username, password} = req.body;
    const {errors, valid} = validateLoginInput(username, password);

    if (!valid) {
      return throwLoginValidateError(errors);
    }

    const user = await User.findOne({username}).populate("like_posts");
    if (!user) {
      errors.general = "User not found";
      return throwLoginValidateError(errors);
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      errors.general = "Password error";
      return throwLoginValidateError(errors);
    }

    const token = user.generateToken();
    res.json({
      code: 1,
      data: {
        token,
      }
    });
  } catch(error) {
    next(error);
  }
}