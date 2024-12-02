"use client";

import { useEffect } from "react";
import { CombinedData, UserWordsData, WordsData } from "../types";
import { supabase } from "../supabase";
import { useRouter } from "next/navigation";
import { GetJapanDate } from "../components/LearnWord/GetJapanTime";
import SaveMultipleData from "../components/LearnWord/SaveMultipleData";

// ローディング画面のコンポーネント
const Loading = () => {
  const router = useRouter();

  // コンポーネントがマウントされたときに実行
  useEffect(() => {
    // 非同期関数として定義
    const getUserWords = async () => {
      // Step 1: 全単語のIDを取得
      const { data: wordsData, error: wordsError } = await supabase
        .from("words_list")
        .select("*");

      if (wordsError) {
        console.error("Error fetching words:", wordsError.message);
        return;
      }

      // Step 2: ユーザー情報を取得
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user:", userError.message);
        return;
      }

      // Step 3: ユーザーが存在する場合に処理を続ける
      if (userData?.user) {
        const user = userData.user;

        // 各単語にユーザーIDを紐付けたデータを作成
        const userWords = wordsData.map((word) => ({
          user_id: user.id,
          word_id: word.id,
        }));

        // `user_words` テーブルにデータを挿入または更新
        const { data: userWordsData, error: userWordsError } = await supabase
          .from("user_words")
          .upsert(userWords, { onConflict: "user_id, word_id" })
          .select();

        if (userWordsError) {
          console.error(
            "Error inserting/updating user words:",
            userWordsError.message
          );
        } else {
          console.log(
            "User words inserted/updated successfully.",
            userWordsData
          );

          // 取得したデータを次の処理に渡す
          combineData(wordsData, userWordsData);
        }
      }
    };

    // 非同期関数を呼び出し、終了後に遷移
    const loadData = async () => {
      await getUserWords();
      // データ処理が終わったらクイズ画面へ遷移
      router.push("/wordQuiz");
    };

    loadData(); // 非同期処理を呼び出す
  }, [router]);

  // ユーザーデータとワードデータを合体
  const combineData = (
    wordsData: WordsData[],
    userWordsData: UserWordsData[]
  ) => {
    // wordsListDataをマッピング（word_idをキーとする辞書を作成）
    const wordsMap = new Map(
      wordsData.map((item) => [
        item.id,
        { word: item.word, meaning: item.meaning },
      ])
    );

    // dataにtermとmeaningを結合
    const data = userWordsData.map((item) => {
      const wordInfo = wordsMap.get(item.word_id);
      return {
        ...item,
        word: wordInfo?.word || "Unknown Term",
        meaning: wordInfo?.meaning || "Unknown Meaning",
      };
    });

    // 取得したデータをセッションに保存する
    sessionStorage.setItem("data", JSON.stringify(data));
  };

  return <div>Loading...</div>;
};

export default Loading;
