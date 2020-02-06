import { IUserDocument } from "../models/User"

export interface JwtPayload {
  key: IUserDocument["key"];
}