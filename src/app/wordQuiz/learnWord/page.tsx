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
  const [learnedData, setLearnedData] = useState<Data[]>([]);
  const [wordLimit, setWordLimit] = useState<string | null>(null); // 初期値を10に設定
  const [finish, setfinish] = useState(false);
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
    const storedFinish = sessionStorage.getItem("finish");
    if (storedFinish === "true") setfinish(true);
    setWordLimit(sessionStorage.getItem("wordLimit"));
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
        const todayLearning: Data[] = data.filter((item) => {
          const learnedAt = new Date(item.learned_at); // learned_at を Date オブジェクトに変換
          const learnedAtDate = learnedAt.toISOString().split("T")[0]; // YYYY-MM-DD 形式
          return learnedAtDate === today; // 今日の日付と比較
        });
        todayLearning.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setLearnedData(todayLearning); // 今日の学習データをセット

        const wordLimit = sessionStorage.getItem("wordLimit");

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
                } else if (key === "two_days_later") {
                  targetDate.setDate(targetDate.getDate() + 2); // 2日後
                } else if (key === "three_days_later") {
                  targetDate.setDate(targetDate.getDate() + 3); // 3日後
                } else if (key === "one_week_later") {
                  targetDate.setDate(targetDate.getDate() + 7); // 1週間後
                } else if (key === "two_weeks_later") {
                  targetDate.setDate(targetDate.getDate() + 14); // 2週間後
                } else if (key === "one_month_later") {
                  targetDate.setMonth(targetDate.getMonth() + 1); // 1ヶ月後
                } else if (key === "three_months_later") {
                  targetDate.setMonth(targetDate.getMonth() + 3); // 3ヶ月後
                } else if (key === "six_months_later") {
                  targetDate.setMonth(targetDate.getMonth() + 6); // 6ヶ月後
                } else if (key === "do_not_review") {
                  // 出題しない場合は何も変更しない
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
          // 各フィールドがtrueかどうかを判定
          const tomorrowIsTrue =
            item.hasOwnProperty("tomorrow") && item.tomorrow === true;
          const twoDaysLaterIsTrue =
            item.hasOwnProperty("two_days_later") &&
            item.two_days_later === true;
          const threeDaysLaterIsTrue =
            item.hasOwnProperty("three_days_later") &&
            item.three_days_later === true;
          const oneWeekLaterIsTrue =
            item.hasOwnProperty("one_week_later") &&
            item.one_week_later === true;
          const twoWeeksLaterIsTrue =
            item.hasOwnProperty("two_weeks_later") &&
            item.two_weeks_later === true;
          const oneMonthLaterIsTrue =
            item.hasOwnProperty("one_month_later") &&
            item.one_month_later === true;
          const threeMonthsLaterIsTrue =
            item.hasOwnProperty("three_months_later") &&
            item.three_months_later === true;
          const sixMonthsLaterIsTrue =
            item.hasOwnProperty("six_months_later") &&
            item.six_months_later === true;

          // 各フィールドがfalseかどうかを判定
          const tomorrowIsFalse =
            item.hasOwnProperty("tomorrow") && item.tomorrow === false;
          const twoDaysLaterIsFalse =
            item.hasOwnProperty("two_days_later") &&
            item.two_days_later === false;
          const threeDaysLaterIsFalse =
            item.hasOwnProperty("three_days_later") &&
            item.three_days_later === false;
          const oneWeekLaterIsFalse =
            item.hasOwnProperty("one_week_later") &&
            item.one_week_later === false;
          const twoWeeksLaterIsFalse =
            item.hasOwnProperty("two_weeks_later") &&
            item.two_weeks_later === false;
          const oneMonthLaterIsFalse =
            item.hasOwnProperty("one_month_later") &&
            item.one_month_later === false;
          const threeMonthsLaterIsFalse =
            item.hasOwnProperty("three_months_later") &&
            item.three_months_later === false;
          const sixMonthsLaterIsFalse =
            item.hasOwnProperty("six_months_later") &&
            item.six_months_later === false;
          const doNotReviewIsFalse =
            item.hasOwnProperty("do_not_review") &&
            item.do_not_review === false;

          // 全てのフィールドがfalseの場合
          const hasAllFalseFields =
            tomorrowIsFalse &&
            twoDaysLaterIsFalse &&
            threeDaysLaterIsFalse &&
            oneWeekLaterIsFalse &&
            twoWeeksLaterIsFalse &&
            oneMonthLaterIsFalse &&
            threeMonthsLaterIsFalse &&
            sixMonthsLaterIsFalse &&
            doNotReviewIsFalse;

          // 条件を満たす場合はそのitemを返す（順番を逆に変更）
          return (
            sixMonthsLaterIsTrue ||
            threeMonthsLaterIsTrue ||
            oneMonthLaterIsTrue ||
            twoWeeksLaterIsTrue ||
            oneWeekLaterIsTrue ||
            threeDaysLaterIsTrue ||
            twoDaysLaterIsTrue ||
            tomorrowIsTrue ||
            hasAllFalseFields
          );
        });

        interface ReviewData {
          tomorrow: boolean;
          two_days_later: boolean;
          three_days_later: boolean;
          one_week_later: boolean;
          two_weeks_later: boolean;
          one_month_later: boolean;
          three_months_later: boolean;
          six_months_later: boolean;
          do_not_review: boolean;
        }
        // displayDataのソート
        const sortedDisplayData = displayData.sort(
          (a: ReviewData, b: ReviewData) => {
            // フィールドがtrueの順番を月日が大きいものから並べ替える
            const priority: (keyof ReviewData)[] = [
              "six_months_later",
              "three_months_later",
              "one_month_later",
              "two_weeks_later",
              "one_week_later",
              "three_days_later",
              "two_days_later",
              "tomorrow",
            ];

            // aとbのそれぞれがtrueであるフィールドをチェック
            for (const field of priority) {
              const aValue = a[field] === true;
              const bValue = b[field] === true;

              // aがtrueでbがfalseならaを先に、bがtrueでaがfalseならbを先に
              if (aValue !== bValue) {
                return aValue ? -1 : 1;
              }
            }

            // もしどちらもtrueのフィールドがない場合はそのまま
            return 0;
          }
        );
        const limitedData = sortedDisplayData.slice(0, Number(wordLimit));
        setData(limitedData); // wordLimitに従ったデータをセット
      }
    };
    getData(); // データ取得関数を実行
  }, []);

  // 現在の単語とその意味をステートに設定
  useEffect(() => {
    setTerm(data[index]?.term); // 現在のインデックスに対応する単語
    setMeaning(data[index]?.meaning); // 現在のインデックスに対応する意味
  }, [data, index]); // `data` や `index` が変更されるたびに実行

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
            { name: "in_two_days", value: data[index].two_days_later },
            { name: "in_three_days", value: data[index].three_days_later },
            { name: "in_one_week", value: data[index].one_week_later },
            { name: "in_two_weeks", value: data[index].two_weeks_later },
            { name: "in_one_month", value: data[index].one_month_later },
            { name: "in_three_months", value: data[index].three_months_later },
            { name: "in_six_months", value: data[index].six_months_later },
            { name: "do_not_review", value: data[index].do_not_review },
          ];

          // 値がtrueの最初のインデックスを探す
          const reviewDateIndex = reviewDates.findIndex(
            (item) => item.value === true
          );

          // もしtrueのフィールドがなければ、最初のフィールド（tomorrow）をtrueに設定
          if (reviewDateIndex === -1) {
            reviewDates[0].value = true;
          } else {
            // trueに設定されたフィールドが最後でない場合、次のフィールドにtrueを設定
            if (reviewDateIndex !== reviewDates.length - 1) {
              reviewDates[reviewDateIndex].value = false; // 現在のtrueフィールドをfalseにする
              reviewDates[reviewDateIndex + 1].value = true; // 次のフィールドをtrueに設定
            }
          }

          // updateFieldsを作成
          const updateFields = {
            learned_at: today, // learned_at を更新
            tomorrow: reviewDates[0].value,
            two_days_later: reviewDates[1].value,
            three_days_later: reviewDates[2].value,
            one_week_later: reviewDates[3].value,
            two_weeks_later: reviewDates[4].value,
            one_month_later: reviewDates[5].value,
            three_months_later: reviewDates[6].value,
            six_months_later: reviewDates[7].value,
            do_not_review: reviewDates[8].value,
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
          if (!review) {
            setfinish(true);
            sessionStorage.setItem("finish", "true");
          }
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
            two_days_later: false,
            three_days_later: false,
            one_week_later: false,
            two_weeks_later: false,
            one_month_later: false,
            three_months_later: false,
            six_months_later: false,
            do_not_review: false,
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
          if (!review) {
            setfinish(true);
            sessionStorage.setItem("finish", "true");
          }
        }
      }
      setCardColor("");
    }, 500);
  };

  const handleReview = () => {
    setData(learnedData);
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
        {(data.length === 0 || learnedData.length >= Number(wordLimit)) &&
        !review &&
        finish ? (
          // お疲れ様でしたメッセージ
          <div className="flex flex-col items-center">
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-16 mt-12 md:mb-28 md:mt-24 text-red-500">
              今日のタスクは終わりました！
              <br />
              お疲れ様です！
            </h2>
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
        ) : // 何も表示しない
        null}
      </section>
    </main>
  );
};

export default LearnWord; // コンポーネントをエクスポート
