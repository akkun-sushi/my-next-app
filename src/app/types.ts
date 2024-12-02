import { Dispatch, SetStateAction } from "react";

export interface Data {
  id: string;
  term: string;
  meaning: string;
  created_at: string;
  learned_at: string;
  reviewed_at: string;
}

export interface WordsData {
  id: string;
  word: string;
  meaning: string;
}

export interface UserWordsData {
  user_id: string;
  word_id: string;
  learned_at: string;
  reviewed_at: string;
}

export interface CombinedData {
  user_id: string;
  word_id: string;
  word: string;
  meaning: string;
  learned_at: string;
  reviewed_at: string;
}

export interface MultipleData {
  learning: CombinedData[];
  unlearn: CombinedData[];
  review: CombinedData[];
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
  data: Data[];
  setData: Dispatch<SetStateAction<Data[]>>;
  sortType: SortType;
  setSortType: Dispatch<SetStateAction<SortType>>;
  isAdding: boolean;
  setIsAdding: Dispatch<SetStateAction<boolean>>;
  isEditing: IsEditing;
  setIsEditing: Dispatch<SetStateAction<IsEditing>>;
  isDeleting: IsDeleting;
  setIsDeleting: Dispatch<SetStateAction<IsDeleting>>;
}

export type WordCardProps = Data & PropsForComponent;
