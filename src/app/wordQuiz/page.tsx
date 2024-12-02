"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MultipleData, UserWords } from "../types";
import { supabase } from "../supabase";
import { useRouter } from "next/navigation";
import {
  GetAllData,
  GetMultipleData,
} from "../components/LearnWord/ProcessData";

const WordQuiz = () => {
  const [allData, setAllData] = useState<UserWords[] | null>(null);
  const [multipleData, setMultipleData] = useState<MultipleData | null>(null);
  const [firstData, setFirstData] = useState<UserWords | null>(null);
  const [wordLimit, setWordLimit] = useState<number>(0); // 初期単語数
  const [language, setLanguage] = useState<string>(""); // 言語
  const [dataCount, setDataCount] = useState<number[]>([]); // 単語の種類ごとのカウント
  const [clicked, setClicked] = useState(false); // カードがクリックされたか
  const [displayNew, setDisplayNew] = useState(false); // 新規単語表示フラグ

  const router = useRouter();

  //初期設定
  useEffect(() => {
    setAllData(GetAllData() || null); // ローカルストレージからデータを取得
    setWordLimit(Number(sessionStorage.getItem("wordLimit") || 30)); // 単語数設定
    setLanguage(sessionStorage.getItem("language") || "en-US"); // 言語設定
  }, []);

  // 単語リストの更新
  useEffect(() => {
    if (allData) setMultipleData(GetMultipleData(wordLimit) || null);
  }, [wordLimit, allData]);

  //統計データの登録、最初に表示される単語の設定、新規単語の判定
  useEffect(() => {
    // データが揃ったら情報を更新
    if (allData && multipleData) {
      const { unlearn, learning, review, limit } = multipleData;

      //統計データ
      setDataCount([
        unlearn.length,
        review.length,
        allData.length - unlearn.length,
      ]);

      // learningDataの長さがwordLimit以上であれば、isFinishをtrueに設定
      const isFinish = learning.length >= wordLimit;

      // isFinishがtrueの場合はlearningData[0]を、falseの場合はlimit[0]をfirstDataに設定
      setFirstData(isFinish ? learning[0] : limit[0]);

      // 新規データの表示判定
      setDisplayNew(unlearn.some((item) => item.id === firstData?.id));

      // sessionStorageの"finish"にisFinishの値に応じてtrueまたはfalseをセット
      sessionStorage.setItem("finish", isFinish ? "true" : "false");
    }
  }, [allData, multipleData, firstData, wordLimit]);

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
            onChange={(e) => {
              const wordLimit = e.target.value;
              setWordLimit(Number(wordLimit));
              sessionStorage.setItem("wordLimit", wordLimit);
            }}
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
            onChange={(e) => {
              const language = e.target.value;
              setLanguage(language);
              sessionStorage.setItem("language", language);
            }}
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

      <button
        onClick={async () => {
          // サインアウト処理
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error("サインアウトエラー:", error.message);
          } else {
            console.log("サインアウト成功");
            router.push("/"); // サインアウト後にリダイレクトするページを指定
          }
        }}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
      >
        サインアウト
      </button>
    </main>
  );
};

export default WordQuiz;
