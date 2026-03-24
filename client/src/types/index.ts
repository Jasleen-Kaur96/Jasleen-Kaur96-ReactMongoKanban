import { Dispatch, SetStateAction } from "react";

export type Card = {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
};

export type Column = {
  id: string;
  index?: number;
  title: string;
  cardIds: string[];
};

export type BoardState = {
  cards: Record<string, Card>;
  columns: Record<string, Column>;
  columnOrder: string[];
};


export type ColumnProps = {
  index: number;
  column: Column;
  cards: Record<string, Card>;
  active: String[];
};

export type CreateEditCardProps = {
  title: string;
  description: string;
  setTitle:Dispatch<SetStateAction<string>>;
  setDescription:Dispatch<SetStateAction<string>>; 
  createNewTask:()=>void; 
  toggleNewCard:()=>void;
}

export type UserProps = {
  _id: string;
  name: string;
  email: string;
};

export type UserScreenProps = {
   users:UserProps[],
   active: String[], 
   toggleActive :(index: string)=>void;
}
