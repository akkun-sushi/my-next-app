"use client"; // Next.jsでクライアントサイドの処理を有効にする宣言

// 必要なモジュールやコンポーネントをインポート
import { Data } from "@/app/types"; // データ型の定義
import { supabase } from "@/app/supabase";
import Link from "next/link"; // ページ間リンク用
import React, { useEffect, useState } from "react"; // Reactフックを使用
import { GiSpeaker } from "react-icons/gi";

const LearnWord = () => {
  // ステートの定義
  const [data, setData] = useState<Data[]>([]); // 単語データを保持
  const [LearnedWords] = useState<Data[]>([]);
  const [review, setReview] = useState<boolean>(false);
  const [index, setIndex] = useState<number>(0); // 現在の単語のインデックス
  const [term, setTerm] = useState<string>(""); // 現在の単語
  const [meaning, setMeaning] = useState<string>(""); // 現在の単語の意味
  const [reverse, setReverse] = useState<boolean>(false); // 表示を反転するフラグ
  const [SpeakerIsClicked, setSpeakerIsClicked] = useState<boolean>(false);
  const [cardColor, setCardColor] = useState<string>(""); // 「わかった」「わからない」ボタンが押されたかどうかを管理する状態

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

  useEffect(() => {
    // クライアントサイドでのみ実行
    const storedData = JSON.parse(sessionStorage.getItem("data") || "[]");
    if (storedData) {
      setData(storedData);
    }
    const storedLearnedData = JSON.parse(
      sessionStorage.getItem("learnedData") || "[]"
    );
    if (storedLearnedData) {
      setData(storedLearnedData);
    }
  }, []);

  // 現在の単語とその意味をステートに設定
  useEffect(() => {
    setTerm(data[index]?.term); // 現在のインデックスに対応する単語
    setMeaning(data[index]?.meaning); // 現在のインデックスに対応する意味
  }, [data, index]); // `data` や `index` が変更されるたびに実行

  // キーボード操作によるイベントハンドリング
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case " ": // スペースキー
        // スペースキーが押された時に表示反転フラグ（reverse）を切り替え
        if (cardColor === "") {
          setReverse(!reverse);
        }
        break;

      case "s": // sキー
        // sキーが押された時に音声を再生する処理（handleSpeak）を呼び出し
        if (cardColor === "") {
          handleSpeak();
        }
        break;

      case "1": // 1キー
        // 1キーが押された時に「理解した」とマークする処理（handleGotIt）を呼び出し
        if (cardColor === "") {
          handleGotIt();
        }
        break;

      case "2": // 2キー
        // 2キーが押された時に「理解していない」とマークする処理（handleNotGotIt）を呼び出し
        if (cardColor === "") {
          handleNotGotIt();
        }
        break;

      default:
        // 上記のいずれのキーも押されなかった場合、何もしない
        break;
    }
  };

  // キーボードイベントリスナーを登録・解除
  useEffect(() => {
    // コンポーネントがマウントされたときに、windowオブジェクトにkeydownイベントリスナーを登録
    window.addEventListener("keydown", handleKeyDown);

    // クリーンアップ関数：コンポーネントがアンマウントされるか、依存が変更される時に
    // イベントリスナーを解除して、メモリリークを防ぐ
    return () => {
      window.removeEventListener("keydown", handleKeyDown); // イベントリスナーの解除
    };
  }); // 空の依存配列なので、このeffectはコンポーネントがマウントされたときだけ実行

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

  const handleGotIt = () => {
    setCardColor("green");
    setTimeout(async () => {
      const today = getJapanTime(); // 日本時間（年月日）を取得
      if (data) {
        if (!review) {
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
        }

        if (index < data.length - 1) {
          setIndex((prevIndex) => prevIndex + 1);
          setReverse(false); // 表示を元に戻す
        } else if (index === data.length - 1) {
          setIndex(0);
          setReverse(false);
          setReview(false);
          alert("すべて勉強しました");
          setData([]);
        }
      }
      setCardColor("");
    }, 500);
  };

  const handleNotGotIt = () => {
    setCardColor("red");
    setTimeout(async () => {
      const today = getJapanTime(); // 日本時間（年月日）を取得
      if (data) {
        if (!review) {
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
        }
      }

      if (index < data.length - 1) {
        setIndex((prevIndex) => prevIndex + 1);
        setReverse(false); // 表示を元に戻す
      } else if (index === data.length - 1) {
        setIndex(0);
        setReverse(false);
        setReview(false);
        alert("すべて勉強しました");
        setData([]);
      }
      setCardColor("");
    }, 500);
  };

  const handleReview = () => {
    setData(LearnedWords);
    setReview(true);
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
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mt-8 text-black text-center mx-auto">
          学習
        </h1>
      </section>

      {/* メインコンテンツ */}
      <section className="flex flex-col items-center justify-center w-full h-full mt-5 md:mt-10">
        {/* 今日のタスクが終わった場合 */}
        {data.length === 0 ? (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-16 mt-12 md:mb-28 md:mt-24 text-red-500">
              今日のタスクは終わりました！
              <br />
              お疲れ様です！
            </h2>
            <button
              onClick={handleReview}
              className="px-6 py-3 md:px-10 md:py-5 bg-blue-500 text-whit text-xl sm:text-3xl md:text-4xl lg:text-5xl text-white font-bold rounded-xl shadow-md hover:bg-blue-600 transition-colors"
            >
              復習しますか？
            </button>
          </div>
        ) : (
          <>
            {/* 単語カード */}
            <div
              onClick={() => {
                if (cardColor === "") {
                  setReverse(!reverse);
                }
              }}
              className={`relative w-4/5 md:w-3/5 h-[200px] sm:h-[300px] md:h-[400px] rounded-2xl shadow-lg flex items-center justify-center px-4 py-8 transition-all duration-500 ${
                cardColor === "green"
                  ? "bg-green-300"
                  : cardColor === "red"
                  ? "bg-red-300"
                  : "bg-white"
              }`}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-center">
                {reverse ? meaning : term}
              </h1>
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
              <button
                onClick={() => {
                  if (cardColor === "") {
                    handleGotIt();
                  }
                }}
                className="flex-1 px-6 py-4 bg-green-500 rounded-xl shadow-md hover:bg-green-600 transition-colors"
              >
                わかった
              </button>
              <button
                onClick={() => {
                  if (cardColor === "") {
                    handleNotGotIt();
                  }
                }}
                className="flex-1 px-6 py-4 bg-red-500 rounded-xl shadow-md hover:bg-red-600 transition-colors"
              >
                わからない
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
};

export default LearnWord; // コンポーネントをエクスポート
