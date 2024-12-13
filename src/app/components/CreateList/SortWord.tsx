import { PropsForComponent, SortType } from "@/app/data/types";
import { supabase } from "@/app/data/supabase/client";
import React, { ChangeEvent, useEffect } from "react";

const SortWord = (props: PropsForComponent) => {
  const { setData, sortType, isAdding, isEditing, isDeleting } = props;

  useEffect(() => {
    //全データ取得
    const getAll = async () => {
      const { data } = await supabase.from("wordsList").select("*");
      switch (sortType) {
        case "CREATION_ASC":
          data?.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
          break;
        case "CREATION_DES":
          data?.sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          );
          break;
        case "ALPHABETICAL_ASC":
          data?.sort((a, b) => a.term.localeCompare(b.term));
          break;
        case "ALPHABETICAL_DES":
          data?.sort((a, b) => b.term.localeCompare(a.term));
          break;
        case "JAPANESE_ASC":
          data?.sort((a, b) => a.meaning.localeCompare(b.meaning, "ja"));
          break;
        case "JAPANESE_DES":
          data?.sort((a, b) => b.meaning.localeCompare(a.meaning, "ja"));
          break;
      }
      setData(data || []);
    };
    //状態が変更され次第、画面更新
    getAll();
  }, [setData, sortType, isAdding, isEditing, isDeleting]);

  return (
    <select
      value={sortType}
      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
        props.setSortType(e.target.value as SortType)
      }
      className="text-lg border-2 border-black p-1 mx-4 md:text-2xl"
    >
      <option value={"CREATION_ASC"}>作成順（昇順）</option>
      <option value={"CREATION_DES"}>作成順（降順）</option>
      <option value={"ALPHABETICAL_ASC"}>定義：アルファベット順（昇順）</option>
      <option value={"ALPHABETICAL_DES"}>定義：アルファベット順（降順）</option>
      <option value={"JAPANESE_ASC"}>意味：五十音順（昇順）</option>
      <option value={"JAPANESE_DES"}>意味：五十音順（降順）</option>
    </select>
  );
};

export default SortWord;
