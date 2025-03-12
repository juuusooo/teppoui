export interface Comment {
  _id: string;
  commenterId: string;
  commenterUsername: string;
  text: string;
  likes: number;
  dislikes: number;
  createdAt: Date;
}