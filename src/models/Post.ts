import { Schema, model, Document, PaginateModel } from "mongoose";
import uuid from "uuid/v4";
import { IUserDocument } from "./User";
import mongoosePaginate from "mongoose-paginate-v2";

interface Like{
  username: IUserDocument["username"];
  createdAt: IUserDocument["createdAt"];
}

interface Comment{
  username: IUserDocument["username"];
  body: IPostDocument["body"];
  createdAt: IUserDocument["createdAt"];
  id?: IPostDocument["id"];
}

export interface IPostDocument extends Document {
  body: string;
  username: IUserDocument["username"];
  user: IUserDocument["_id"];
  key: string;
  likes: Like[];
  comments: Comment[];
}

export interface IPostModel extends PaginateModel<IPostDocument>{}

// interface IPostModel extends Model<IPostDocument> {
//   paginate: any;
// }

const postSchema: Schema = new Schema({
  body: String,
  username: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  key:{
    type: String,
    default: uuid(),
  },
  likes: [
    {
      username: String,
      createdAt: String,
    }
  ],
  comments: [{
    username: String,
    body: String,
    createdAt: String,
  }]
}, {timestamps: true});

postSchema.plugin(mongoosePaginate);

const Post: IPostModel = model<IPostDocument, IPostModel>("Post", postSchema);

export default Post;