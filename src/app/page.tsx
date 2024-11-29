"use client";

import React, { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Data } from "./types";
import { supabase } from "./supabase";

const WordQuiz = () => {
  const [data, setData] = useState<Data[]>([]);
  const [learnedData, setLearnedData] = useState<Data[]>([]);
  const [firstData, setFirstData] = useState<Data>();
  const [clicked, setClicked] = useState(false);
  const [wordLimit, setWordLimit] = useState(10); // 初期値を10に設定

  useEffect(() => {
    sessionStorage.setItem("wordLimit", wordLimit.toString());
    const getData = async () => {
      const { data } = await supabase.from("wordsList").select("*");
      if (data) {
        const today = new Date() // 今日の日付
          .toLocaleDateString("ja-JP", {
            timeZone: "Asia/Tokyo",
            year: "numeric", // 4桁で年を表示
            month: "2-digit", // 月を2桁で表示
            day: "2-digit", // 日を2桁で表示
          })
          .replace(/\//g, "-");

        // 今日の `learned_at` のデータをフィルタリングして `Learning` にセット
        const todayLearning = data.filter((item) => {
          const learnedAt = new Date(item.learned_at); // learned_at を Date オブジェクトに変換
          const learnedAtDate = learnedAt.toISOString().split("T")[0]; // YYYY-MM-DD 形式
          return learnedAtDate === today; // 今日の日付と比較
        });
        todayLearning.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setLearnedData(todayLearning); // 今日の学習データをセット

        const selectedFields = data.map((item) => {
          const typedItem = item as Data;

          // 他のフィールドをフィルタリングして、tomorrowの値を更新
          return Object.fromEntries(
            Object.entries(typedItem).map(([key, value]) => {
              if (value === true) {
                // learned_atの日付を基に計算
                const learnedAtDate = new Date(item.learned_at);

                // keyによって異なる日数を加算
                const targetDate = new Date(learnedAtDate);
                if (key === "tomorrow") {
                  targetDate.setDate(targetDate.getDate() + 1); // 翌日
                } else if (key === "in_two_days") {
                  targetDate.setDate(targetDate.getDate() + 2); // 2日後
                } else if (key === "in_three_days") {
                  targetDate.setDate(targetDate.getDate() + 3); // 3日後
                }

                // 新しい日付を"YYYY-MM-DD"形式で取得
                const reviewDate = targetDate.toISOString().split("T")[0];

                if (today < reviewDate) {
                  return [key, reviewDate];
                }
              }

              // 値がtrueでない場合はそのままkeyとvalueを返す
              return [key, value];
            })
          );
        }) as Data[];

        const displayData: Data[] = selectedFields.filter((item) => {
          // 1. itemの中でvalueがtrueのフィールドを探す
          const hasTrueField = Object.values(item).includes(true);

          // 2. itemに"tomorrow"や"in_two_days", "in_three_days"がすべてfalseであることをチェック
          const hasAllFalseFields =
            item.hasOwnProperty("tomorrow") &&
            item.tomorrow === false &&
            item.hasOwnProperty("in_two_days") &&
            item.in_two_days === false &&
            item.hasOwnProperty("in_three_days") &&
            item.in_three_days === false;

          // 条件を満たす場合はそのitemを返す
          return hasTrueField || hasAllFalseFields;
        });

        setData(displayData);
      }
    };
    getData(); // データ取得関数を実行
  }, []);

  useEffect(() => {
    if (data.length === 0) {
      setFirstData(learnedData[0]);
      sessionStorage.setItem("finish", "true");
    } else {
      sessionStorage.setItem("finish", "false");
      setFirstData(data[0]);
    }
    if (learnedData.length >= wordLimit) {
      sessionStorage.setItem("finish", "true");
      setFirstData(learnedData[0]);
    }
  }, [data, learnedData, wordLimit]);

  const handleWordLimitChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(event.target.value); // 選択された値を数値に変換
    setWordLimit(value); // 状態を更新
    sessionStorage.setItem("wordLimit", value.toString()); // セッションストレージに保存
  };

  return (
    <main className="flex flex-col items-center fullscreen w-screen h-screen bg-blue-200 py-8">
      <Link
        href="/wordQuiz/createList"
        className="text-4xl md:text-5xl font-bold border-4 border-black p-2 md:p-4 rounded-lg"
      >
        リスト作成
      </Link>

      <section className="w-full h-full flex flex-col items-center">
        <div className="mt-6 md:mt-10 flex space-x-4 sm:space-x-10 md:space-x-20 items-center">
          <Link
            href="/wordQuiz/learnWord"
            className="text-xl sm:text-3xl md:text-4xl font-bold bg-green-400 text-white px-6 md:px-12 py-2 rounded-2xl"
          >
            学習
          </Link>
          {/* トグル */}
          <div>
            <label
              htmlFor="word-limit"
              className="mr-4 text-xl sm:text-3xl md:text-4xl font-bold"
            >
              単語数
            </label>
            <select
              id="word-limit"
              value={wordLimit}
              onChange={handleWordLimitChange}
              className="text-xl md:text-2xl font-bold bg-gray-200 px-4 py-2 rounded-md"
            >
              <option value={10}>10</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        <div
          onClick={() => setClicked(!clicked)}
          className="w-4/5 md:w-3/5 h-1/4 md:h-1/2 bg-white rounded-2xl m-auto mt-4 md:mt-6 px-3 py-5"
        >
          <div className="h-4/5 flex items-center justify-center">
            <h1 className="text-4xl md:text-6xl font-bold break-words">
              {clicked ? firstData?.meaning : firstData?.term}
            </h1>
          </div>
          <h3 className="w-full md:text-2xl text-center">
            タップしたら
            <span className="font-bold">{clicked ? "用語" : "意味"}</span>
            を表示
          </h3>
        </div>
      </section>
    </main>
  );
};

export default WordQuiz;
