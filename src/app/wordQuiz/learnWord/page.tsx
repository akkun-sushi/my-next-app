"use client"; // Next.jsでクライアントサイドの処理を有効にする宣言

// 必要なモジュールやコンポーネントをインポート
import {
  MultipleData,
  ReviewMode,
  Update,
  WordWithDate,
} from "@/app/data/types"; // データ型の定義
import Link from "next/link"; // ページ間リンク用
import React, { useEffect, useState } from "react"; // Reactフックを使用
import { GiSpeaker } from "react-icons/gi";
import { GetJapanDate } from "@/app/components/LearnWord/GetJapanTime";
import ProcessData from "@/app/components/LearnWord/ProcessData";
import {
  PlayFailureSound,
  PlaySuccessSound,
  SpeakerSetting,
} from "@/app/components/LearnWord/Sound";
import {
  getDataFromLocal,
  saveDataToLocal,
} from "@/app/data/localStorage/local";
import { RxCross2 } from "react-icons/rx";
import Review from "@/app/components/LearnWord/Review/Review";

const LearnWord = () => {
  // ステートの定義
  const [data, setData] = useState<WordWithDate[]>([]);
  const [newData, setNewData] = useState<WordWithDate[]>([]);
  const [reviewMode, setReviewMode] = useState<ReviewMode>({
    state: { finish: false, review: false, newLearning: false },
    random: false,
    type: "all",
    count: 0,
  });
  const [index, setIndex] = useState<number>(0);

  const [card, setCard] = useState<string[]>([]); // フラッシュカードの[単語, 意味, 復習日]
  const [displayNew, setDisplayNew] = useState<boolean>(false);
  const [reverse, setReverse] = useState<boolean>(false); // 表示を反転するフラグ
  const [speakerIsClicked, setSpeakerIsClicked] = useState<boolean>(false);
  const [cardColor, setCardColor] = useState<string>(""); // 「わかった」「わからない」ボタンが押されたかどうかを管理する状態
  const [isAlwaysSpeak, setIsAlwaysSpeak] = useState(false);

  const today = GetJapanDate(); // 日本時間（年月日）を取得

  // データ初期化関数
  const initializeData = () => {
    const storedData = localStorage.getItem("data");
    const storedMultipleData = sessionStorage.getItem("multipleData");
    if (storedMultipleData) {
      const multipleData: MultipleData = JSON.parse(storedMultipleData);
      if (storedData) {
        setData(JSON.parse(storedData));
      } else {
        saveDataToLocal("data", multipleData.limit);
        setData(multipleData.limit);
      }
    }
  };

  const initializeNewData = () => {
    const storedMultipleData = sessionStorage.getItem("multipleData");
    if (storedMultipleData) {
      const multipleData: MultipleData = JSON.parse(storedMultipleData);
      setNewData(multipleData.unlearn);
    }
  };

  const initializeReviewMode = () => {
    const storedReviewMode = localStorage.getItem("reviewMode");
    if (storedReviewMode) {
      setReviewMode(JSON.parse(storedReviewMode));
    }
  };

  const initializeIndex = () => {
    const storedIndex = localStorage.getItem("index");
    setIndex(storedIndex ? Number(storedIndex) : 0);
  };

  // useEffectで初期化処理を実行
  useEffect(() => {
    initializeData();
    initializeNewData();
    initializeReviewMode();
    initializeIndex();
  }, []); // 初回レンダリング時のみ実行

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
    const rawDate = new Date(data[index]?.reviewDate);

    // フォーマットを変更して "2024/2/12" 形式に
    const formattedDate = rawDate.toLocaleDateString("ja-JP"); // 日本のローカルフォーマット
    setCard([data[index]?.word, data[index]?.meaning, formattedDate]); // 現在のインデックスに対応する単語
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
        if (!reviewMode.state.review) {
          const update: Update = {
            learnDate: today,
            reviewDate: "",
            count: {
              flag: false,
              correct: data[index].count.correct,
              wrong: data[index].count.wrong,
            },
          };

          if (isCorrect) {
            update.count.flag = true;
            update.count.correct += 1;
          } else {
            update.count.flag = false;
            update.count.wrong += +1;
          }

          const reviewedAt = isCorrect
            ? data[index].reviewDate
              ? calculateNextReviewDate(
                  data[index].learnDate,
                  data[index].reviewDate
                )
              : new Date(today).getTime() + 1 * 24 * 60 * 60 * 1000
            : new Date(today).getTime() + 1 * 24 * 60 * 60 * 1000;

          update.reviewDate = new Date(reviewedAt).toISOString().split("T")[0];

          const allData: WordWithDate[] = getDataFromLocal("español");
          if (!allData) return;

          // 更新したい単語を更新
          const updateData: WordWithDate[] = allData.map((item) =>
            item.id === data[index].id
              ? {
                  ...item,
                  learnDate: update.learnDate,
                  reviewDate: update.reviewDate,
                  count: {
                    flag: update.count.flag,
                    correct: update.count.correct,
                    wrong: update.count.wrong,
                  },
                }
              : item
          );

          saveDataToLocal("español", updateData);
        }

        if (isAlwaysSpeak) SpeakerSetting(data[index + 1]?.word);

        if (index < data.length - 1) {
          localStorage.setItem("index", (index + 1).toString());
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
    if (reviewMode.state.newLearning) {
      saveReviewMode("newLearning", false);
    }

    saveReviewMode("review", false);

    if (!reviewMode.state.review) {
      console.log("hey");
      saveReviewMode("finish", true);
    }

    if (reviewMode.state.review) {
      saveReviewMode("count", reviewMode.count + 1);
    }

    localStorage.setItem("index", "0");
    setIndex(0);

    saveData([]);
    alert("すべて勉強しました!");
  };

  function saveReviewMode(
    key: keyof ReviewMode["state"] | "random" | "type" | "count",
    value: boolean | string | number
  ) {
    const storedReviewMode = localStorage.getItem("reviewMode");

    const currentValue: ReviewMode =
      storedReviewMode && key !== "newLearning"
        ? JSON.parse(storedReviewMode)
        : {
            state: { finish: false, review: false, newLearning: false },
            random: false,
            type: "all",
            count: 0,
          };

    const updatedValue = { ...currentValue };

    if (key === "finish" || key === "review" || key === "newLearning") {
      updatedValue.state[key] = value as boolean;
    } else if (key == "random") {
      updatedValue.random = value as boolean;
    } else if (key == "type") {
      updatedValue.type = value as "all" | "new" | "wrong";
    } else if (key == "count") {
      updatedValue.count = value as number;
    }

    if (key === "newLearning") {
      const multipleData = ProcessData(true);
      sessionStorage.setItem("multipleData", JSON.stringify(multipleData));
      saveData(multipleData.limit);
      setNewData(multipleData.unlearn);
    }

    localStorage.setItem("reviewMode", JSON.stringify(updatedValue));
    setReviewMode(updatedValue);
  }

  function saveData(data: WordWithDate[]) {
    saveDataToLocal("data", data);
    setData(data);
  }

  const handleReview = async () => {
    const multipleData = ProcessData();

    const learning = multipleData.learning;
    // ランダムに並び替え
    if (reviewMode.random) {
      learning.sort(() => Math.random() - 0.5);
    }

    if (reviewMode.type === "all") {
      saveData(learning);
    } else if (reviewMode.type === "new") {
      const unlearn = learning.filter(
        ({ count: { correct, wrong } }) =>
          (correct === 1 && wrong === 0) || (correct === 0 && wrong === 1)
      );
      if (unlearn.length === 0) {
        alert("新規単語がありません。");
        return;
      } else saveData(unlearn);
    } else {
      const wrong = learning.filter((item) => !item.count.flag);
      if (wrong.length === 0) {
        alert("間違えた単語がありません。");
        return;
      } else saveData(wrong);
    }

    setNewData(multipleData.unlearn);

    if (isAlwaysSpeak) handleSpeak();

    saveReviewMode("review", true);
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
    if (
      data.length > 0 ||
      !reviewMode.state.finish ||
      reviewMode.state.review
    ) {
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
      SpeakerSetting(data[0]?.word);
    }
  }, [reviewMode, isAlwaysSpeak, data]); // isAlwaysSpeak と data を依存配列に追加

  return (
    <main className="w-screen h-screen bg-blue-100">
      {
        data.length === 0 &&
        !reviewMode.state.review &&
        reviewMode.state.finish ? (
          <Review
            reviewMode={reviewMode}
            saveReviewMode={saveReviewMode}
            handleReview={handleReview}
          />
        ) : data.length > 0 ? (
          // 単語カードとボタンセクション
          <div className="flex flex-col items-center justify-center">
            {/* 上部セクション */}
            <section className="flex w-4/5 items-center justify-between px-4">
              {/* 戻るボタン */}
              <Link
                href="/wordQuiz"
                className="text-xl sm:text-4xl md:text-5xl font-bold text-black hover:text-red-500 transition-colors"
              >
                <RxCross2 />
              </Link>
              {/* ページタイトル */}
              <h1 className="text-3xl sm:text-4xl md:text-3xl lg:text-4xl font-bold mt-8 text-black text-center mx-auto mb-10">
                例文が入る予定
              </h1>
            </section>

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
              <h1
                className={`${
                  reverse
                    ? "text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl"
                    : "text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
                } font-bold text-center`}
              >
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
                className={`absolute top-4 right-6 text-4xl sm:text-5xl md:text-6xl cursor-pointer transition-all transform ${
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
                className={`absolute top-14 right-4 px-4 py-1 rounded-lg shadow-md text-sm text-white font-bold sm:text-base md:text-lg transition-all ${
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
          </div>
        ) : null // 何も表示しない
      }
    </main>
  );
};

export default LearnWord;
