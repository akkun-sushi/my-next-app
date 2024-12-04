import { Dispatch, SetStateAction } from "react";

export interface Word {
  word_id: number;
  sentence_id: number;
  word: string;
  meaning: string;
}

export interface Sentence {
  sentence_id: number;
  sentence: string;
  meaning: string;
}

export interface SentenceAndWords extends Sentence {
  words: Word[];
}

export interface WordIdsWithDates {
  word_id: number;
  learnDate: string;
  reviewDate: string;
}

//
//
//
//
//

export interface List {
  id: string;
  word: string;
  meaning: string;
}

export interface Data {
  id: string;
  term: string;
  meaning: string;
  created_at: string;
  learned_at: string;
  reviewed_at: string;
}

export interface UserWords extends Data {
  user_id: string;
}

export interface MultipleData {
  learning: UserWords[];
  unlearn: UserWords[];
  review: UserWords[];
  limit: UserWords[];
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
