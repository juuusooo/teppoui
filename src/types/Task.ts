import { Comment } from "./Comment";
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  _id: string;
  columnId: string;
  title: string;
  description: string;
  priority: Priority;
  tags: String[];
  color: string;
  comments: Comment[];
  likes: string[];
  dislikes: string[];
  createdAt: Date;
  updatedAt: Date;
}