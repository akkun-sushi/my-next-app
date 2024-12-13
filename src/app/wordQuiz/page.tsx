"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MultipleData, ReviewMode, WordWithDate } from "../data/types";

import { getDataFromLocal } from "../data/localStorage/local";
import ProcessData from "../components/LearnWord/ProcessData";
import { saveDataToSession } from "../data/sessionStorage/session";
import { GetJapanDate } from "../components/LearnWord/GetJapanTime";

const WordQuiz = () => {
  const [wordLimit, setWordLimit] = useState<string>("30"); // 初期単語数
  const [dataCount, setDataCount] = useState<number[]>([]); // 単語の種類ごとのカウント
  const today = GetJapanDate();

  //初期設定
  useEffect(() => {
    const storedData: WordWithDate[] = getDataFromLocal("español");
    const multipleData: MultipleData = ProcessData();

    saveDataToSession("multipleData", multipleData);

    const storedReviewMode = localStorage.getItem("reviewMode");
    const index = localStorage.getItem("index");
    if (storedReviewMode && index) {
      const reviewMode: ReviewMode = JSON.parse(storedReviewMode);
      if (
        !reviewMode.state.review &&
        !reviewMode.state.newLearning &&
        index === "0"
      ) {
        localStorage.setItem("data", JSON.stringify(multipleData.limit));
      } else if (
        multipleData.limit.some(
          (wordWithDate) => wordWithDate.reviewDate === today
        )
      ) {
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
        localStorage.setItem("data", JSON.stringify(multipleData.limit));
      }
    }

    const { unlearn, learning, review } = multipleData;

    setDataCount([
      unlearn.length,
      review.length,
      storedData.length - unlearn.length,
    ]);

    // learningDataの長さがwordLimit以上であれば、isFinishをtrueに設定
    const isFinish = learning.length >= Number(wordLimit);

    // sessionStorageの"finish"にisFinishの値に応じてtrueまたはfalseをセット
    sessionStorage.setItem("finish", isFinish ? "true" : "false");

    // 単語数設定
    const storedWordLimit = sessionStorage.getItem("wordLimit");
    if (storedWordLimit) {
      setWordLimit(storedWordLimit);
    } else {
      sessionStorage.setItem("wordLimit", wordLimit);
    }
  }, [wordLimit, today]);

  return (
    <main className="flex flex-col items-center fullscreen w-screen h-screen bg-blue-200 py-8">
      {/* 学習オプションセクション */}
      <section className="mt-6 md:mt-10 w-full flex space-x-4 sm:space-x-8 md:space-x-14 justify-center">
        <Link
          href="/"
          className="text-xl sm:text-3xl md:text-4xl font-bold bg-yellow-400 text-white px-4 sm:px-6 md:px-12 sm:py-2 rounded-2xl flex items-center"
        >
          更新
        </Link>
        {/* 学習ページへのリンク */}
        <Link
          href="/wordQuiz/learnWord"
          className="text-xl sm:text-3xl md:text-4xl font-bold bg-green-400 text-white px-4 sm:px-6 md:px-12 sm:py-2 rounded-2xl flex items-center"
        >
          学習
        </Link>

        {/* 単語数トグル（ドロップダウン） */}
        <div className="flex flex-col sm:flex-row items-center">
          <label
            htmlFor="wordLimit"
            className="mr-4 text-xl sm:text-2xl md:text-4xl font-bold"
          >
            単語数
          </label>
          <select
            id="wordLimit"
            value={wordLimit}
            onChange={(e) => {
              const wordLimit = e.target.value;
              setWordLimit(wordLimit);
              sessionStorage.setItem("wordLimit", wordLimit);
            }}
            className="text-lg md:text-xl font-bold bg-gray-200 px-4 py-2 rounded-md"
          >
            <option value="10">10</option>
            <option value="30">30</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="300">300</option>
          </select>
        </div>
      </section>

      {/* 統計情報を表示するセクション */}
      <section className="w-full flex justify-center items-center space-x-8 md:space-x-16 lg:space-x-32 mt-4 md:mt-10 text-sm sm:text-lg md:text-xl lg:text-2xl font-bold">
        {/* 新規単語の表示ブロック */}
        <div className="border-4 border-black rounded-xl p-2 flex-col justify-center items-center">
          <h2 className="">新規単語</h2>
          <p className="text-center">{dataCount[0]}</p>
        </div>

        {/* 復習日単語の表示ブロック */}
        <div className="border-4 border-black rounded-xl p-2 flex-col justify-center items-center">
          <h2 className="">復習日単語</h2>
          <p className="text-center">{dataCount[1]}</p>{" "}
        </div>

        {/* 勉強済み単語の表示ブロック */}
        <div className="border-4 border-black rounded-xl p-2 flex-col justify-center items-center">
          <h2 className="">勉強済み単語</h2>
          <p className="text-center">{dataCount[2]}</p>{" "}
        </div>
      </section>
    </main>
  );
};

export default WordQuiz;
