import { Column } from "./Column";

export interface Board {
  _id: string;
  owner: string;
  collaborators: string[];
  title: string;
  columns: Column[];
}
