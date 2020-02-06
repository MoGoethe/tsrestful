import isEmail from "validator/lib/isEmail";
import isEmpty from "validator/lib/isEmpty";
import equals from "validator/lib/equals";
import { IUserDocument } from "../models/User"

export interface RegisterInputError extends Partial<IUserDocument>{
  confirmPassword?: string;
}

export interface LoginInputError extends Partial<IUserDocument>{
  general?: string;
}

export interface CreateBodyError extends Partial<IUserDocument>{
  body?: string;
}

export const validateRegisterInput = (
  username: IUserDocument["username"],
  password: IUserDocument["password"],
  confirmPassword: IUserDocument["password"],
  email: IUserDocument["email"]
) => {
  let errors: RegisterInputError = {};

  if (isEmpty(username)) {
    errors.username = "Username must not be empty";
  }

  if (isEmpty(password)) {
    errors.password = "Password must not be empty";
  }

  if (isEmpty(confirmPassword)) {
    errors.confirmPassword = "Confirmed password must not be empty";
  }

  if (!equals(password, confirmPassword)) {
    errors.confirmPassword = "Passwords must match";
  }

  if (isEmpty(email)) {
    errors.email = "Email must not be empty";
  }

  if (!isEmail(email)) {
    errors.email = "Email must be a valid email address";
  }

  return { errors, valid: Object.keys(errors).length < 1 };
};


export const validateLoginInput = (
  username: IUserDocument["username"],
  password: IUserDocument["password"],
) => {
  let errors: LoginInputError = {};

  if (isEmpty(username)) {
    errors.username = "Username must not be empty";
  }

  if (isEmpty(password)) {
    errors.password = "Password must not be empty";
  }

  return { errors, valid: Object.keys(errors).length < 1 };
};

export const checkBody = (body: string) => {
  let errors: CreateBodyError = {};
  if (isEmpty(body.trim())) {
    errors.body = "Password must not be empty";
  }
  return { errors, valid: Object.keys(errors).length < 1 };
};