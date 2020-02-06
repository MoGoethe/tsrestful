import { Request, Response, NextFunction } from "express"
import HttpExceptions from "../exceptions/HttpExceptions";
import { UNAUTHORIZED } from "http-status-codes";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { JwtPayload } from "../types/Jwt";

const checkAuthMiddleware = async (
  req: Request, 
  _res: Response, 
  next: NextFunction
) => {
  const token = req.headers["authorization"];

  if (token) {
    try{
      const jwtData = jwt.verify(token, process.env.JWT_SECRET_KEY!) as JwtPayload;
      const user = await User.findOne({key: jwtData.key});
      if (user) {
        req.currentUser = user;
        return next();
      }
      return next(new HttpExceptions(UNAUTHORIZED, "No such user"));
    } catch (error) {
      return next(new HttpExceptions(UNAUTHORIZED, "Invalid/Expired token"));
    }
  }

  return next(
    new HttpExceptions(UNAUTHORIZED, "Authorization header must be provide")
  );
}

export default checkAuthMiddleware;