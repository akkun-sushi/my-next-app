"use client"; // Next.jsでクライアントサイドの処理を有効にする宣言

// 必要なモジュールやコンポーネントをインポート
import { UserWords } from "@/app/data/types"; // データ型の定義
import Link from "next/link"; // ページ間リンク用
import React, { useEffect, useState } from "react"; // Reactフックを使用
import { GiSpeaker } from "react-icons/gi";

import { GetJapanDate } from "@/app/components/LearnWord/GetJapanTime";
import {
  GetAllData,
  GetMultipleData,
  UpdateData,
} from "@/app/components/LearnWord/ProcessData";
import {
  PlayFailureSound,
  PlaySuccessSound,
  SpeakerSetting,
} from "@/app/components/LearnWord/Sound";

const LearnWord = () => {
  // ステートの定義
  const [data, setData] = useState<UserWords[]>([]); // 単語データを保持
  const [newData, setNewData] = useState<UserWords[]>([]);

  const [finish, setfinish] = useState(false);
  const [review, setReview] = useState<boolean>(false);

  const [index, setIndex] = useState<number>(0); // 現在の単語のインデックス
  const [card, setCard] = useState<string[]>([]); // フラッシュカードの[単語, 意味, 復習日]
  const [displayNew, setDisplayNew] = useState<boolean>(false);
  const [reverse, setReverse] = useState<boolean>(false); // 表示を反転するフラグ
  const [speakerIsClicked, setSpeakerIsClicked] = useState<boolean>(false);
  const [cardColor, setCardColor] = useState<string>(""); // 「わかった」「わからない」ボタンが押されたかどうかを管理する状態
  const [isRandom, setIsRandom] = useState(false);
  const [isAlwaysSpeak, setIsAlwaysSpeak] = useState(false);
  const today = GetJapanDate(); // 日本時間（年月日）を取得

  useEffect(() => {
    // セッションストレージから各種データを取得
    const storedMultipleData = sessionStorage.getItem("multipleData");
    if (storedMultipleData) {
      const multipleData = JSON.parse(storedMultipleData);
      setData(multipleData.limit);
      setNewData(multipleData.unlearn);
    }

    const storedFinish = sessionStorage.getItem("finish");
    if (storedFinish === "true") setfinish(true);
  }, []);

  // 現在の単語とその意味をステートに設定
  useEffect(() => {
    if (
      newData &&
      data[index] &&
      newData.find((item) => item.id === data[index].id) // ここで条件をチェック
    ) {
      setDisplayNew(true); // 見つかれば true を設定
    } else {
      setDisplayNew(false); // 見つからなければ false を設定
    }

    // Dateオブジェクトに変換
    const rawDate = new Date(data[index]?.reviewed_at);

    // フォーマットを変更して "2024/2/12" 形式に
    const formattedDate = rawDate.toLocaleDateString("ja-JP"); // 日本のローカルフォーマット
    setCard([data[index]?.term, data[index]?.meaning, formattedDate]); // 現在のインデックスに対応する単語
  }, [newData, data, index]);

  // 共通処理を行う関数
  const handleAnswer = (isCorrect: boolean) => {
    setCardColor(isCorrect ? "green" : "red");
    if (isCorrect) {
      PlaySuccessSound();
    } else {
      PlayFailureSound();
    }

    setTimeout(async () => {
      if (data) {
        if (!review) {
          const update: { learned_at: string; reviewed_at: string } = {
            learned_at: today,
            reviewed_at: "",
          };

          const reviewedAt = isCorrect
            ? data[index].reviewed_at
              ? calculateNextReviewDate(
                  data[index].learned_at,
                  data[index].reviewed_at
                )
              : new Date(today).getTime() + 1 * 24 * 60 * 60 * 1000
            : new Date(today).getTime() + 1 * 24 * 60 * 60 * 1000;

          update.reviewed_at = new Date(reviewedAt).toISOString().split("T")[0];

          const allData = GetAllData();
          if (!allData) return;

          // 更新したい単語を更新
          const updateData: UserWords[] = allData.map((item) =>
            item.id === data[index].id
              ? {
                  ...item,
                  learned_at: update.learned_at,
                  reviewed_at: update.reviewed_at,
                }
              : item
          );

          UpdateData(updateData); // 更新を保存
        }

        if (isAlwaysSpeak) SpeakerSetting(data[index + 1]?.term);

        if (index < data.length - 1) {
          setIndex((prevIndex) => prevIndex + 1);
        } else {
          finalizeReview(); // 学習完了処理
        }
      }
      setReverse(false); // 表示を元に戻す
      setCardColor("");
    }, 500);
  };

  // 次回復習日を計算する関数
  const calculateNextReviewDate = (learnedAt: string, reviewedAt: string) => {
    const learnedDate = new Date(learnedAt);
    const reviewedDate = new Date(reviewedAt);

    const differenceInDays = Math.floor(
      (reviewedDate.getTime() - learnedDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const reviewSchedule = [1, 2, 3, 7, 14, 30, 90, 180];
    const nextReviewDays =
      reviewSchedule.find((days) => days > differenceInDays) || 36525;

    return reviewedDate < new Date(today)
      ? new Date(today).getTime() + nextReviewDays * 24 * 60 * 60 * 1000
      : reviewedDate.getTime() + nextReviewDays * 24 * 60 * 60 * 1000;
  };

  // 学習完了時の処理
  const finalizeReview = () => {
    setIndex(0);
    setReview(false);
    setData([]);
    alert("すべて勉強しました!");
    if (!review) {
      setfinish(true);
      sessionStorage.setItem("finish", "true");
    }
  };

  const handleReview = async () => {
    const multipleData = GetMultipleData();
    if (multipleData) {
      const learning = multipleData.learning;
      // ランダムに並び替え
      if (isRandom) {
        learning.sort(() => Math.random() - 0.5);
      }
      setData(learning);
      setNewData(multipleData.unlearn);
    }

    if (isAlwaysSpeak) handleSpeak();

    setReview(true);
  };

  // 読み上げを開始する関数
  const handleSpeak = () => {
    // すでに読み上げが開始されていない場合のみ実行
    if (!speakerIsClicked) {
      setSpeakerIsClicked(true); // ボタンがクリックされた状態にする（読み上げ中）
      SpeakerSetting(card[0], () => setSpeakerIsClicked(false));
    }
  };

  // キーボード操作によるイベントハンドリング
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((data.length > 0 && !finish) || review) {
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
            handleAnswer(true);
          }
          break;

        case "2": // 2キー
          // 2キーが押された時に「理解していない」とマークする処理（handleNotGotIt）を呼び出し
          if (cardColor === "") {
            handleAnswer(false);
          }
          break;

        default:
          // 上記のいずれのキーも押されなかった場合、何もしない
          break;
      }
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

  useEffect(() => {
    if (isAlwaysSpeak) {
      SpeakerSetting(data[0]?.term);
    }
  }, [review, isAlwaysSpeak, data]); // isAlwaysSpeak と data を依存配列に追加

  return (
    <main className="flex flex-col items-center w-screen min-h-screen bg-blue-100 py-8 px-4">
      {/* 上部セクション */}
      <section className="flex w-4/5 items-center justify-between px-4">
        {/* 戻るボタン */}
        <Link
          href="/wordQuiz"
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
        {data.length === 0 && !review && finish ? (
          <div className="flex flex-col items-center">
            {/* 今日のタスクが終わったことを知らせるテキスト */}
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-16 mt-12 md:mb-20 md:mt-24 text-red-500">
              今日のタスクは終わりました！
              <br />
              お疲れ様です！
            </h2>

            {/* ランダムボタン */}
            <button
              onClick={() => setIsRandom((prev) => !prev)}
              className={`px-6 py-3 md:px-10 md:py-5 mb-8 text-white text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold rounded-xl shadow-md transition-colors duration-300 ${
                isRandom
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-gray-500 hover:bg-gray-600"
              }`}
            >
              {isRandom ? "ランダムオン" : "ランダムオフ"}
            </button>

            {/* 復習ボタン */}
            <button
              onClick={handleReview}
              className="px-6 py-3 md:px-10 md:py-5 bg-blue-500 text-white text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold rounded-xl shadow-md hover:bg-blue-600 transition-colors"
            >
              復習しますか？
            </button>
          </div>
        ) : data.length > 0 ? (
          // 単語カードとボタンセクション
          <>
            <div
              onClick={() => {
                // スピーカーがクリックされていない場合のみリバース処理を行う
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
                {reverse ? card[1] : card[0]}
              </h1>
              {/* New ラベルを左上に表示 */}
              {displayNew && (
                <div className="absolute top-4 left-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-500">
                  New
                </div>
              )}
              {/* 次回の学習日を左下に表示 */}
              {!displayNew && (
                <div className="absolute bottom-4 left-4 sm:text-lg md:text-xl text-black">
                  次回学習日: {card[2]}
                  {/* nextStudyDate は適切な変数に変更してください */}
                </div>
              )}
              <div
                onClick={(e) => {
                  e.stopPropagation(); // イベントのバブリングを止める
                  handleSpeak(); // 読み上げを開始
                }}
                className={`absolute top-4 right-4 text-4xl sm:text-5xl md:text-6xl cursor-pointer transition-all transform ${
                  speakerIsClicked ? "text-red-500" : "text-black"
                } hover:text-red-500`}
              >
                <GiSpeaker />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAlwaysSpeak((prev) => !prev);
                  if (!isAlwaysSpeak) handleSpeak();
                }}
                className={`absolute top-20 right-4 px-4 py-1 rounded-lg shadow-md text-sm text-white font-bold sm:text-base md:text-lg transition-all ${
                  isAlwaysSpeak
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-500 hover:bg-gray-600"
                }`}
              >
                常に
              </button>
            </div>

            <div className="flex w-4/5 md:w-2/3 lg:w-1/2 mt-8 sm:mt-12 md:mt-16 justify-between font-bold text-white text-sm md:text-xl lg:text-2xl mx-auto space-x-6 sm:space-x-10 md:space-x-14 lg:space-x-20">
              <button
                onClick={() => {
                  if (cardColor === "") {
                    handleAnswer(true);
                  }
                }}
                className="flex-1 px-6 py-4 bg-green-500 rounded-xl shadow-md hover:bg-green-600 transition-colors"
              >
                わかった
              </button>
              <button
                onClick={() => {
                  if (cardColor === "") {
                    handleAnswer(false);
                  }
                }}
                className="flex-1 px-6 py-4 bg-red-500 rounded-xl shadow-md hover:bg-red-600 transition-colors"
              >
                わからない
              </button>
            </div>
          </>
        ) : // 何も表示しない
        null}
      </section>
    </main>
  );
};

export default LearnWord;
