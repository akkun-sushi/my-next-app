"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Data } from "./types";
import { supabase } from "./supabase";
import GetJapanTime from "./components/LearnWord/GetJapanTime";

const WordQuiz = () => {
  const [data, setData] = useState<Data[]>([]);
  const [newData, setNewData] = useState<Data[]>([]);
  const [learningData, setlearningData] = useState<Data[]>([]);
  const [firstData, setFirstData] = useState<Data>();
  const [wordLimit, setWordLimit] = useState(10); // 初期値を10に設定
  const [language, setlanguage] = useState("en-US"); // デフォルトを英語に設定
  const [dataCount, setDataCount] = useState<number[]>([]); // [新規単語数, 復習日単語数, 勉強済み単語数]
  const [clicked, setClicked] = useState(false);
  const [displayNew, setDisplayNew] = useState<boolean>(false);

  useEffect(() => {
    // セッションストレージに選択された言語を保存
    sessionStorage.setItem("language", language);

    const getData = async () => {
      const { data } = await supabase.from("wordsList").select("*");
      if (data) {
        const today = GetJapanTime();

        const { data: todayLearning, error } = await supabase
          .from("wordsList") // テーブル名
          .select("*") // 取得するカラム（`*` は全カラム）
          .gte("learned_at", today);

        if (error) {
          console.error("Error fetching users:", error);
          return;
        }

        todayLearning.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setlearningData(todayLearning); // 今日の学習データをセット

        const newData: Data[] = [];
        const reviewData: Data[] = [];

        data.forEach((item) => {
          if (item.learned_at === null) {
            newData.push(item); // learned_at が null の場合 newData に追加
          } else {
            const learnedAt = new Date(item.learned_at);
            const reviewedAt = new Date(item.reviewed_at);

            // `learned_at` と `reviewed_at` の日数差を計算
            const learnedToReviewedDiff = Math.floor(
              (reviewedAt.getTime() - learnedAt.getTime()) /
                (1000 * 60 * 60 * 24)
            );

            // `learned_at` と `today` の日数差を計算
            const learnedToTodayDiff = Math.floor(
              (new Date(today).getTime() - learnedAt.getTime()) /
                (1000 * 60 * 60 * 24)
            );

            // `learned_to_today_diff` が `learned_to_reviewed_diff` より大きければ、復習日を設定
            if (learnedToTodayDiff >= learnedToReviewedDiff) {
              reviewData.push(item); // learned_at が null でない場合 reviewData に追加
            }
          }
        });

        setDataCount([
          newData.length,
          reviewData.length,
          data.length - newData.length,
        ]);

        // `reviewed_at` が古い日順にソート
        reviewData.sort((a, b) => {
          const dateA = new Date(a.reviewed_at);
          const dateB = new Date(b.reviewed_at);
          return dateA.getTime() - dateB.getTime(); // 日付が古い順に並べる
        });

        // 既に `learningData` にあるデータ数を差し引いた残りのデータを追加
        const remainingLimit = Math.max(wordLimit - todayLearning.length, 0);

        // reviewData から先に追加
        const limitedData = reviewData.slice(0, remainingLimit);

        // もし reviewData が remainingLimit の数に満たない場合、newData から追加
        if (limitedData.length < remainingLimit) {
          const additionalLimit = remainingLimit - limitedData.length;
          const additionalData = newData.slice(0, additionalLimit);
          limitedData.push(...additionalData); // 残りのデータを追加
        }

        // limitedData の中から newData のみを抽出
        const extractedNewData = limitedData.filter((item) =>
          newData.some((newItem) => newItem.id === item.id)
        );

        setNewData(extractedNewData);
        setData(limitedData); // 最終的なデータをセット
      }
    };
    getData(); // データ取得関数を実行
  }, [wordLimit, language]);

  //　sessionStorageの管理
  useEffect(() => {
    // learningDataの長さがwordLimit以上、またはdataが空であれば、isFinishをtrueに設定
    const isFinish = learningData.length >= wordLimit || data.length === 0;

    // isFinishがtrueの場合はlearningData[0]を、falseの場合はdata[0]をfirstDataに設定
    setFirstData(isFinish ? learningData[0] : data[0]);

    // sessionStorageの"finish"にisFinishの値に応じてtrueまたはfalseをセット
    sessionStorage.setItem("finish", isFinish ? "true" : "false");

    sessionStorage.setItem("data", JSON.stringify(data));
    sessionStorage.setItem("newData", JSON.stringify(newData));
  }, [data, newData, learningData, wordLimit]);

  //　newを表示
  useEffect(() => {
    // firstDataがnewDataの中に含まれる場合、newDisplayをtrueに設定
    const isNewData = newData.some((item) => item.id === firstData?.id);
    setDisplayNew(isNewData);
  }, [firstData]);

  return (
    <main className="flex flex-col items-center fullscreen w-screen h-screen bg-blue-200 py-8">
      {/* リスト作成ボタン */}
      <section className="text-4xl md:text-5xl font-bold border-4 border-black p-2 md:p-4 rounded-lg">
        <Link href="/wordQuiz/createList">リスト作成</Link>
      </section>

      {/* 学習オプションセクション */}
      <section className="mt-6 md:mt-10 w-full flex space-x-4 sm:space-x-8 md:space-x-14 justify-center">
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
            htmlFor="word-limit"
            className="mr-4 text-xl sm:text-2xl md:text-4xl font-bold"
          >
            単語数
          </label>
          <select
            id="word-limit"
            value={wordLimit}
            onChange={(e) => setWordLimit(Number(e.target.value))}
            className="text-lg md:text-xl font-bold bg-gray-200 px-4 py-2 rounded-md"
          >
            <option value={10}>10</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* 言語トグル（ドロップダウン） */}
        <div className="flex flex-col sm:flex-row items-center">
          <label
            htmlFor="language-select"
            className="mr-4 text-xl sm:text-2xl md:text-4xl font-bold"
          >
            言語
          </label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => setlanguage(e.target.value)}
            className="text-lg md:text-xl font-bold bg-gray-200 px-4 py-2 rounded-md"
          >
            <option value="en-US">英語</option>
            <option value="es-ES">スペイン語</option>
            <option value="fr-FR">フランス語</option>
            <option value="de-DE">ドイツ語</option>
            <option value="ru-RU">ロシア語</option>
          </select>
        </div>
      </section>

      {/* メインのフラッシュカード表示セクション */}
      <section className="w-full">
        {/* フラッシュカード部分 */}
        <div
          onClick={() => setClicked(!clicked)}
          className="w-4/5 md:w-3/4 lg:w-3/5 h-[170px] sm:h-[220px] md:h-[270px] bg-white rounded-2xl m-auto mt-4 md:mt-6 px-3 py-5 relative"
        >
          {/* カード中央の内容部分 */}
          <div className="h-4/5 flex items-center justify-center">
            <h1 className="text-4xl md:text-6xl font-bold break-words">
              {clicked ? firstData?.meaning : firstData?.term}
            </h1>
          </div>

          {/* displayNewがtrueのときのみ表示される「New」ラベル */}
          {displayNew && (
            <div className="absolute top-4 left-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-500">
              New
            </div>
          )}

          {/* フラッシュカードの操作ガイド */}
          <h3 className="w-full md:text-2xl text-center">
            タップしたら
            <span className="font-bold">{clicked ? "用語" : "意味"}</span>
            を表示
          </h3>
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
