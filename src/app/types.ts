import { Dispatch, SetStateAction } from "react";

export interface Data {
  id: string;
  term: string;
  meaning: string;
  created_at: string;
  learned_at: string;
  tomorrow: boolean;
  in_two_days: boolean;
  in_three_days: boolean;
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
