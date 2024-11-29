"use client";

import React, { FormEvent, useRef, useState } from "react";
import { PropsForComponent } from "@/app/types";
import { supabase } from "@/app/supabase";

const AddWord = (props: PropsForComponent) => {
  const [term, setTerm] = useState("");
  const [meaning, setMeaning] = useState("");

  const { isEditing, isDeleting } = props;

  const inputRef = useRef<HTMLInputElement>(null);

  //用語追加
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    //編集中または削除中は追加不可
    if (isEditing === "NULL" && isDeleting === "NULL") {
      props.setIsAdding(true);
      await supabase.from("wordsList").insert([{ term, meaning }]).select();
      setTerm("");
      setMeaning("");
      if (inputRef.current) {
        inputRef.current.focus();
      }
      props.setIsAdding(false);
    }
  };

  return (
    <form
      className="flex flex-col items-center md:flex-row"
      onSubmit={handleSubmit}
    >
      <input
        ref={inputRef}
        type="text"
        placeholder="用語"
        className="rounded-lg border text-xl px-4 py-1 md:w-2/5 md:mr-3 md:text-3xl"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="意味"
        className="rounded-lg border text-xl px-4 py-1 mt-4 md:w-2/5 md:mr-3 md:mt-0 md:text-3xl"
        value={meaning}
        onChange={(e) => setMeaning(e.target.value)}
        required
      />
      <button
        type="submit"
        className="bg-green-400 text-white text-2xl w-2/5 mt-4 md:w-1/5 rounded-lg md:mt-0 md:py-1 md:text-3xl"
      >
        追加
      </button>
    </form>
  );
};

export default AddWord;
