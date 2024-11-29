"use client"; // Next.jsでクライアントサイドの処理を有効にする宣言

// 必要なモジュールやコンポーネントをインポート
import { GetAll } from "@/app/api/route"; // データ取得用API関数
import { Data } from "@/app/api/types"; // データ型の定義
import { supabase } from "@/app/supabase";
import Link from "next/link"; // ページ間リンク用
import React, { useEffect, useState } from "react"; // Reactフックを使用
import { GiSpeaker } from "react-icons/gi";

const LearnWord = () => {
  // ステートの定義
  const [data, setData] = useState<Data[]>([]); // 単語データを保持
  const [index, setIndex] = useState<number>(0); // 現在の単語のインデックス
  const [term, setTerm] = useState<string>(""); // 現在の単語
  const [meaning, setMeaning] = useState<string>(""); // 現在の単語の意味
  const [reverse, setReverse] = useState<boolean>(false); // 表示を反転するフラグ
  const [SpeakerIsClicked, setSpeakerIsClicked] = useState<boolean>(false);

  // データ取得処理（初回レンダリング時のみ実行）
  useEffect(() => {
    const getAll = async () => {
      const data = await GetAll(); // データ取得
      if (data) {
        const selectedFields = data.map((item) => {
          const typedItem = item as Data;

          // 他のフィールドをフィルタリングして、tomorrowの値を更新
          return Object.fromEntries(
            Object.entries(typedItem).map(([key, value]) => {
              if (value === true) {
                // learned_atの日付を基に計算
                const learnedAtDate = new Date(item.learned_at);

                // keyによって異なる日数を加算
                let targetDate = new Date(learnedAtDate);
                if (key === "tomorrow") {
                  targetDate.setDate(targetDate.getDate() + 1); // 翌日
                } else if (key === "in_two_days") {
                  targetDate.setDate(targetDate.getDate() + 2); // 2日後
                } else if (key === "in_three_days") {
                  targetDate.setDate(targetDate.getDate() + 3); // 3日後
                }

                // 新しい日付を"YYYY-MM-DD"形式で取得
                const reviewDate = targetDate.toISOString().split("T")[0];
                const today = getJapanTime();

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

        displayData?.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setData(displayData);
      }
    };
    getAll(); // データ取得関数を実行
  }, []);

  // 現在の単語とその意味をステートに設定
  useEffect(() => {
    setTerm(data[index]?.term); // 現在のインデックスに対応する単語
    setMeaning(data[index]?.meaning); // 現在のインデックスに対応する意味
  }, [data, index]); // `data` や `index` が変更されるたびに実行

  // キーボード操作によるイベントハンドリング
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "Enter": // Enterキーで表示反転
      case "ArrowUp": // 上矢印キーで表示反転
      case "ArrowDown": // 下矢印キーで表示反転
        setReverse(!reverse); // 表示反転フラグを切り替え
        break;
      case "ArrowLeft": // 左矢印キーで前の単語へ
        if (index > 0) {
          setIndex((prevIndex) => prevIndex - 1);
          setReverse(false); // 表示を元に戻す
        }
        break;
      case "ArrowRight": // 右矢印キーで次の単語へ
        if (index < data.length - 1) {
          setIndex((prevIndex) => prevIndex + 1);
          setReverse(false); // 表示を元に戻す
        }
        break;
      default: // 他のキーは何もしない
        break;
    }
  };

  // キーボードイベントリスナーを登録・解除
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown); // イベントリスナーを登録
    return () => {
      window.removeEventListener("keydown", handleKeyDown); // クリーンアップ時に解除
    };
  });

  // 読み上げを開始する関数
  const handleSpeak = () => {
    if (!SpeakerIsClicked) {
      setSpeakerIsClicked(true);
      const utterance = new SpeechSynthesisUtterance(term);
      utterance.lang = "en-US"; //言語設定

      utterance.onend = () => {
        setSpeakerIsClicked(false);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const getJapanTime = (): string => {
    const date = new Date()
      .toLocaleDateString("ja-JP", {
        timeZone: "Asia/Tokyo",
        year: "numeric", // 4桁で年を表示
        month: "2-digit", // 月を2桁で表示
        day: "2-digit", // 日を2桁で表示
      })
      .replace(/\//g, "-");
    return date; // 例: "2024/11/27"
  };

  const handleGotIt = async () => {
    const today = getJapanTime(); // 日本時間（年月日）を取得

    if (data) {
      const reviewDates = [
        { name: "tomorrow", value: data[index].tomorrow },
        { name: "in_two_days", value: data[index].in_two_days },
        { name: "in_three_days", value: data[index].in_three_days },
      ];

      const reviewDateIndex = reviewDates.findIndex(
        (item) => item.value === true
      );
      if (reviewDateIndex === -1) {
        reviewDates[0].value = true;
      } else {
        if (reviewDateIndex !== 2) {
          reviewDates[reviewDateIndex].value = false;
          reviewDates[reviewDateIndex + 1].value = true;
        }
      }

      const updateFields = {
        learned_at: today, // learned_at を更新
        tomorrow: reviewDates[0].value,
        in_two_days: reviewDates[1].value,
        in_three_days: reviewDates[2].value,
      };

      // Supabaseにデータを保存
      const { data: response, error } = await supabase
        .from("wordsList")
        .update(updateFields)
        .eq("id", data[index].id)
        .select();

      if (error) {
        console.error("Error saving date:", error.message);
      } else {
        console.log("Date saved successfully:", response);
      }

      if (index < data.length - 1) {
        setIndex((prevIndex) => prevIndex + 1);
        setReverse(false); // 表示を元に戻す
      } else if (index === data.length - 1) {
        setIndex(0);
        alert("すべて勉強しました");
      }
    }
  };

  const handleNotGotIt = async () => {
    const today = getJapanTime(); // 日本時間（年月日）を取得
    const updateFields = {
      learned_at: today, // learned_at を更新
      tomorrow: true,
      in_two_days: false,
      in_three_days: false,
    };

    // Supabaseにデータを保存
    const { data: response, error } = await supabase
      .from("wordsList")
      .update(updateFields)
      .eq("id", data[index].id)
      .select();

    if (error) {
      console.error("Error saving date:", error.message);
    } else {
      console.log("Date saved successfully:", response);
    }

    if (index < data.length - 1) {
      setIndex((prevIndex) => prevIndex + 1);
      setReverse(false); // 表示を元に戻す
    } else if (index === data.length - 1) {
      setIndex(0);
      alert("すべて勉強しました");
    }
  };

  return (
    <main className="flex flex-col items-center w-screen min-h-screen bg-blue-100 py-8 px-4">
      {/* 上部セクション */}
      <section className="flex w-4/5 items-center justify-between px-4">
        {/* 戻るボタン */}
        <Link
          href="/"
          className="text-xl sm:text-2xl md:text-3xl font-bold text-black hover:text-red-500 transition-colors"
        >
          戻る
        </Link>
        {/* ページタイトル */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black text-center mx-auto">
          学習
        </h1>
      </section>

      {/* メインコンテンツ */}
      <section className="flex flex-col items-center justify-center w-full h-full mt-5 md:mt-10">
        {/* 単語カード */}
        <div className="relative w-4/5 md:w-3/5 h-[200px] sm:h-[300px] md:h-[400px] bg-white rounded-2xl shadow-lg flex items-center justify-center px-4 py-8">
          {/* 単語または意味の表示 */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-center">
            {reverse ? meaning : term}
          </h1>
          {/* スピーカーアイコン */}
          <div
            onClick={handleSpeak}
            className={`absolute top-4 right-4 text-4xl sm:text-5xl md:text-6xl cursor-pointer transition-all transform ${
              SpeakerIsClicked ? "text-red-500" : "text-black"
            } hover:text-red-500`}
          >
            <GiSpeaker />
          </div>
        </div>

        {/* ボタンセクション */}
        <div className="flex w-4/5 md:w-2/3 lg:w-1/2 mt-8 sm:mt-12 md:mt-16 justify-between font-bold text-white text-sm md:text-xl lg:text-2xl mx-auto space-x-6 sm:space-x-10 md:space-x-14 lg:space-x-20">
          {/* わかったボタン */}
          <button
            onClick={handleGotIt}
            className="flex-1 px-6 py-4 bg-green-500 rounded-xl shadow-md hover:bg-green-600 transition-colors"
          >
            わかった
          </button>
          {/* わからないボタン */}
          <button
            onClick={handleNotGotIt}
            className="flex-1 px-6 py-4 bg-red-500 rounded-xl shadow-md hover:bg-red-600 transition-colors"
          >
            わからない
          </button>
        </div>
      </section>
    </main>
  );
};

export default LearnWord; // コンポーネントをエクスポート
