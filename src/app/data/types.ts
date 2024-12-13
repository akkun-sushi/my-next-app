import { Dispatch, SetStateAction } from "react";

export interface Words {
  id: string;
  word: string;
  meaning: string;
}

export interface Update {
  learnDate: string;
  reviewDate: string;
  count: { flag: boolean; correct: number; wrong: number };
}

export interface WordWithDate extends Words, Update {}

export interface MultipleData {
  learning: WordWithDate[];
  unlearn: WordWithDate[];
  review: WordWithDate[];
  limit: WordWithDate[];
}

export interface MultipleValue {
  finish?: boolean;
  review?: boolean;
  newLearning?: boolean;
  count?: number;
}

export interface ReviewMode {
  state: { finish: boolean; review: boolean; newLearning: boolean };
  random: boolean;
  type: "all" | "new" | "wrong";
  count: number;
}

export type SortType =
  | "CREATION_ASC"
  | "CREATION_DES"
  | "ALPHABETICAL_ASC"
  | "ALPHABETICAL_DES"
  | "JAPANESE_ASC"
  | "JAPANESE_DES";

export type IsEditing = "FINISH" | "EDIT" | "NULL";
export type IsDeleting = "FINISH" | "DELETE" | "NULL";

export interface PropsForComponent {
  data: WordWithDate[];
  setData: Dispatch<SetStateAction<WordWithDate[]>>;
  sortType: SortType;
  setSortType: Dispatch<SetStateAction<SortType>>;
  isAdding: boolean;
  setIsAdding: Dispatch<SetStateAction<boolean>>;
  isEditing: IsEditing;
  setIsEditing: Dispatch<SetStateAction<IsEditing>>;
  isDeleting: IsDeleting;
  setIsDeleting: Dispatch<SetStateAction<IsDeleting>>;
}

export type WordCardProps = WordWithDate & PropsForComponent;
