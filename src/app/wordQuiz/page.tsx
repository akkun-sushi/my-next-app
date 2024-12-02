"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CombinedData, MultipleData } from "../types";
import { supabase } from "../supabase";
import { useRouter } from "next/navigation";
import SaveMultipleData from "../components/LearnWord/SaveMultipleData";

const WordQuiz = () => {
  const [firstData, setFirstData] = useState<CombinedData>();
  const [wordLimit, setWordLimit] = useState(30); // 初期値を10に設定
  const [language, setlanguage] = useState("en-US"); // デフォルトを英語に設定
  const [dataCount, setDataCount] = useState<number[]>([]); // [新規単語数, 復習日単語数, 勉強済み単語数]
  const [clicked, setClicked] = useState(false);
  const [displayNew, setDisplayNew] = useState<boolean>(false);

  const [sessionData, setSessionData] = useState<{
    data: CombinedData[];
    todayLearningData: CombinedData[];
    unlearnedData: CombinedData[];
    upcomingReviewData: CombinedData[];
  } | null>(null);

  const router = useRouter();

  useEffect(() => {
    SaveMultipleData();

    // 初回レンダリング時にsessionStorageからデータを取得
    const storedData = sessionStorage.getItem("data");
    const storedMultipleData = sessionStorage.getItem("multipleData");

    if (storedData && storedMultipleData) {
      const data: CombinedData[] = JSON.parse(storedData);
      const multipleData: MultipleData = JSON.parse(storedMultipleData);

      // データを結合
      const combinedData = {
        data: [...data],
        todayLearningData: [...multipleData.learning],
        unlearnedData: [...multipleData.unlearn],
        upcomingReviewData: [...multipleData.review],
      };

      console.log("sessionData:", combinedData);
      setSessionData(combinedData);
    }

    const storedWordLimit = sessionStorage.getItem("wordLimit");
    if (storedWordLimit) setWordLimit(Number(storedWordLimit));

    const storedLanguage = sessionStorage.getItem("language");
    if (storedLanguage) setlanguage(storedLanguage);
  }, []);

  useEffect(() => {
    if (sessionData) {
      const all = sessionData.data;
      const unlearned = sessionData.unlearnedData;
      const learning = sessionData.todayLearningData;
      const review = sessionData.upcomingReviewData;

      setDataCount([
        unlearned.length,
        review.length,
        all.length - unlearned.length,
      ]);

      // 既に `learningData` にあるデータ数を差し引いた残りのデータを追加
      const remainingLimit = Math.max(wordLimit - learning.length, 0);

      // reviewData から先に追加
      const limitedData = review.slice(0, remainingLimit);

      // もし reviewData が remainingLimit の数に満たない場合、newData から追加
      if (limitedData.length < remainingLimit) {
        const additionalLimit = remainingLimit - limitedData.length;
        const additionalData = unlearned.slice(0, additionalLimit);
        limitedData.push(...additionalData); // 残りのデータを追加
      }

      // learningDataの長さがwordLimit以上、またはdataが空であれば、isFinishをtrueに設定
      const isFinish = learning.length >= wordLimit || all.length === 0;

      // isFinishがtrueの場合はlearningData[0]を、falseの場合はdata[0]をfirstDataに設定
      setFirstData(isFinish ? learning[0] : limitedData[0]);

      // firstDataがnewDataの中に含まれる場合、newDisplayをtrueに設定
      const isNewData = unlearned.some(
        (item) => item.word_id === firstData?.word_id
      );
      setDisplayNew(isNewData);

      // sessionStorageの"finish"にisFinishの値に応じてtrueまたはfalseをセット
      sessionStorage.setItem("finish", isFinish ? "true" : "false");

      sessionStorage.setItem("limitedData", JSON.stringify(limitedData));
    }
  }, [sessionData, wordLimit, firstData]);

  /*
  useEffect(() => {
    const getData = async () => {
      const { data } = await supabase.from("wordsList").select("*");
      if (data) {
        const today = GetJapanDate();

        const { data: todayLearning, error } = await supabase
          .from("wordsList") // テーブル名
          .select("*") // 取得するカラム（`*` は全カラム）
          .gte("learned_at", today);

        if (error) {
          console.error("Error fetching users:", error);
          return;
        }

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

        // `reviewed_at` が古い日順にソート
        reviewData.sort((a, b) => {
          const dateA = new Date(a.reviewed_at);
          const dateB = new Date(b.reviewed_at);
          return dateA.getTime() - dateB.getTime(); // 日付が古い順に並べる
        });

        
         // limitedData の中から newData のみを抽出
      const extractedNewData = limitedData.filter((item) =>
        newData.some((newItem) => newItem.id === item.id)
      );

      setNewData(extractedNewData);
      
      }
    };
    getData(); // データ取得関数を実行
  }, [wordLimit, language]);

  //　sessionStorageの管理
  useEffect(() => {
    // learningDataの長さがwordLimit以上、またはdataが空であれば、isFinishをtrueに設定
    const isFinish = learningData.length >= wordLimit || data.length === 0;

    // isFinishがtrueの場合はlearningData[0]を、falseの場合はdata[0]をfirstDataに設定

    // sessionStorageの"finish"にisFinishの値に応じてtrueまたはfalseをセット
    sessionStorage.setItem("finish", isFinish ? "true" : "false");

    sessionStorage.setItem("data", JSON.stringify(data));
    sessionStorage.setItem("newData", JSON.stringify(newData));
  }, [data, newData, learningData, wordLimit]);


  //　newを表示
  useEffect(() => {
    console.log(firstData);
    // firstDataがnewDataの中に含まれる場合、newDisplayをtrueに設定
    if (sessionData) {
      const isNewData = sessionData.unlearnedData.some(
        (item) => item.word_id === firstData?.word_id
      );
      console.log(isNewData);
      setDisplayNew(isNewData);
    }
  }, [firstData]);
  */

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
              setlanguage(language);
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
              {clicked ? firstData?.meaning : firstData?.word}
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
