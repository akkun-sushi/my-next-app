"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Data } from "./types";
import { supabase } from "./supabase";

const WordQuiz = () => {
  const [data, setData] = useState<Data[]>([]);
  const [firstData, setFirstData] = useState<Data>({
    id: "",
    term: "",
    meaning: "",
    created_at: "",
    learned_at: "",
    tomorrow: false,
    in_two_days: false,
    in_three_days: false,
  });
  const [clicked, setClicked] = useState(false);

  //データ取得
  useEffect(() => {
    const getAll = async () => {
      const { data } = await supabase.from("wordsList").select("*");
      setData(data || []);
      setFirstData(data?.[data?.length - 1]);
    };
    getAll();
  }, []);

  return (
    <main className="flex flex-col items-center fullscreen w-screen h-screen bg-blue-200 py-8">
      <Link
        href="/wordQuiz/createList"
        className="text-4xl md:text-5xl font-bold border-4 border-black p-2 md:p-4 rounded-lg"
      >
        リスト作成
      </Link>
      {data.length > 0 && (
        <section className="w-full h-full ">
          <div className="mt-6 md:mt-10 flex justify-between items-center">
            <h1 className="my-2 ml-6 md:ml-60 text-2xl md:text-4xl font-bold">
              最新のリスト
            </h1>
            <Link
              href="/wordQuiz/learnWord"
              className="mr-10 md:mr-60 text-2xl md:text-4xl font-bold bg-green-400 text-white px-6 md:px-12 py-2 rounded-2xl"
            >
              学習
            </Link>
            <Link href="/wordQuiz/speech"></Link>
          </div>
          <div
            onClick={() => setClicked(!clicked)}
            className="w-4/5 md:w-3/5 h-1/4 md:h-1/2 bg-white rounded-2xl m-auto mt-4 md:mt-6 px-3 py-5"
          >
            <div className="h-4/5 flex items-center justify-center">
              <h1 className="text-4xl md:text-6xl font-bold break-words">
                {clicked ? firstData.meaning : firstData.term}
              </h1>
            </div>
            <h3 className="w-full md:text-2xl text-center">
              タップしたら
              <span className="font-bold">{clicked ? "用語" : "意味"}</span>
              を表示
            </h3>
          </div>
        </section>
      )}
    </main>
  );
};

export default WordQuiz;
