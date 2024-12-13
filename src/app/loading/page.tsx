"use client";

import { useEffect } from "react";
import { Words, WordWithDate } from "../data/types";
import { useRouter } from "next/navigation";
import { getAllData } from "../data/supabase/queries";
import { localStorageSize, saveDataToLocal } from "../data/localStorage/local";

const Loading = () => {
  const router = useRouter();

  // コンポーネントがマウントされたときに実行
  useEffect(() => {
    const initialize = async () => {
      const storedData = localStorage.getItem("duo");
      if (!storedData) {
        // Supabaseから全単語のデータを取得
        const wordsData: Words[] = await getAllData("duo");

        const wordWithDate: WordWithDate[] = wordsData.map((word) => ({
          ...word,
          learnDate: "",
          reviewDate: "",
          count: { flag: false, correct: 0, wrong: 0 },
        }));

        saveDataToLocal("duo", wordWithDate);

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
      }
      localStorageSize();
      router.push("/wordQuiz");
    };

    initialize();
  }, [router]); // コンポーネントの初回レンダリング後に実行される

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-700">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white border-opacity-50"></div>

        <p className="text-white text-xl font-bold animate-pulse">
          読み込み中...
        </p>
      </div>
    </div>
  );
};

export default Loading;
