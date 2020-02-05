import { Schema, model, Model, Document, HookNextFunction } from "mongoose";
import bcrypt from "bcrypt";
import uuid from "uuid/v4";

enum Role {
  basic = "basic",
  admin = "admin",
}

interface Address {
  city: string;
  street: string;
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
  }
});

userSchema.pre<IUserDocument>("save", async function save(next: HookNextFunction) {
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

const User: Model<IUserDocument> = model<IUserDocument>("User", userSchema);

export default User;