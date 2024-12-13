"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Words, WordWithDate } from "./data/types";
import { getAllData } from "./data/supabase/queries";

const Home = () => {
  const router = useRouter();
  useEffect(() => {
    const initialize = async () => {
      // Supabaseから全単語のデータを取得
      const wordsData: Words[] = await getAllData("español");

      // LocalStorageから既存のデータを取得
      const existingData: WordWithDate[] = JSON.parse(
        localStorage.getItem("español") || "[]"
      );

      // 新しい単語データを生成
      const newWordsData: WordWithDate[] = wordsData.map((word) => ({
        ...word,
        learnDate: "",
        reviewDate: "",
        count: { flag: false, correct: 0, wrong: 0 },
      }));

      // 重複を確認し、新しいデータのみを追加
      const updatedData: WordWithDate[] = [
        ...existingData,
        ...newWordsData.filter(
          (newWord) =>
            !existingData.some((existingWord) => existingWord.id === newWord.id) // idで重複確認
        ),
      ];

      // 更新されたデータをLocalStorageに保存
      localStorage.setItem("español", JSON.stringify(updatedData));

      localStorage.setItem(
        "reviewMode",
        JSON.stringify({
          state: { finish: false, review: false, newLearning: false },
          random: false,
          type: "all",
          count: 0,
        })
      );

      localStorage.setItem("index", "0");

      router.push("/wordQuiz");
    };

    initialize();
  }, [router]);
};

export default Home;
