import { 
  Schema, 
  model, 
  Model, 
  Document, 
  HookNextFunction,
  DocumentQuery,
} from "mongoose";
import bcrypt from "bcrypt";
import uuid from "uuid/v4";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/Jwt";
import { IPostDocument } from "./Post"

enum Role {
  basic = "basic",
  admin = "admin",
}

interface Address {
  city: string;
  street: string;
}

interface IUserModel extends Model<IUserDocument>{
  admin: () => DocumentQuery<IUserDocument | null, IUserDocument, {}>;
}

export interface IUserDocument extends Document {
  key: string,
  username: string;
  email: string;
  password: string;
  createdAt: string;
  addresses: Address[];
  role: Role;
  _doc: IUserDocument;
  like_posts: IPostDocument["_id"][];
  generateToken: () => string;
}

const addressSchema: Schema = new Schema({
  city: String,
  street: String,
})

const userSchema: Schema = new Schema({
  key: {
    type: String,
    default: uuid(),
  },
  username: {
    type: String,
    required: [true, "Username must not be empty"],
    minlength: [6, "Username must be at least 6 characters long"]
  },
  email: {
    type: String,
    trim: true,
    // validate: {
    //   validator: isEmail
    // }
    match: /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/,
  },
  password: String,
  role: {
    type: String,
    enum: ["basic", "admin"],
    default: "basic"
  },
  createdAt: String,
  address: {
    type: [addressSchema]
  },
  like_posts: [{
    type: Schema.Types.ObjectId,
    ref: "Post",
  }]
}, {timestamps: true});

userSchema.methods.generateToken = function(): string {
  const payload: JwtPayload = {key: this.key}
  return jwt.sign(payload, process.env.JWT_SECRET_KEY!, {expiresIn: "1h"});
}

userSchema.static("admin", (): DocumentQuery<IUserDocument | null, IUserDocument, {}> => {
  return User.findOne({username: "seaseeyoul"});
})

userSchema.pre<IUserDocument>("save", async function save(this: IUserDocument, next: HookNextFunction) {
  
  // if (this.isNew) {
  //   this.createdAt = new Date().toDateString();
  // }

  if (!this.isModified("password")) {
    return next();
  }
  try{
    const hashPassword = await bcrypt.hash(this.password, 10);
    this.password = hashPassword;
    next();
  } catch(error) {
    next(error);
  }
})

userSchema.index({username: 1});

const User: IUserModel = model<IUserDocument, IUserModel>("User", userSchema);

export default User;