"use client";

import { useEffect } from "react";
import { UserWords } from "../types";
import { supabase } from "../supabase";
import { useRouter } from "next/navigation";

//　ローディング画面のコンポーネント
//　セッションデータにユーザー情報を保存
//　ローカルデータにユーザーID付き全データを保存
const Loading = () => {
  const router = useRouter();

  // コンポーネントがマウントされたときに実行
  useEffect(() => {
    // 非同期関数としてデータの保存処理を定義
    const saveDataToLocalStorage = async () => {
      // Step 1: Supabaseから全単語のデータを取得
      const { data: wordsData, error: wordsError } = await supabase
        .from("wordsList")
        .select("*");

      if (wordsError) {
        console.error("Error fetching words:", wordsError.message);
        return;
      }

      // Step 2: Supabaseからユーザー情報を取得
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user:", userError.message);
        return;
      }

      // Step 3: ユーザーが存在する場合に処理を続ける
      if (userData?.user) {
        const user = userData.user;
        sessionStorage.setItem("user", JSON.stringify(user));

        // Step 4: 各単語にユーザーIDを紐付けたデータを作成
        const userWords = wordsData.map((word) => ({
          user_id: user.id,
          ...word,
        }));

        // Step 5: ローカルストレージから既存のデータを取得
        const storedData = localStorage.getItem(`data_${user.id}`);
        let existingData: UserWords[] = [];
        if (storedData) {
          existingData = JSON.parse(storedData);

          // Step 6: 既存データに含まれない新しい単語を抽出
          const newWords = userWords.filter(
            (word) =>
              !existingData.some((existingWord) => existingWord.id === word.id)
          );

          // Step 7: 新しい単語が存在する場合にローカルストレージを更新
          if (newWords.length > 0) {
            const newData = [...existingData, ...newWords];

            try {
              localStorage.setItem(`data_${user.id}`, JSON.stringify(newData));
              console.log(
                `${newWords.length} new data have been added to localStorage for user ${user.id}.`
              );
            } catch (error) {
              console.error("Error writing new data to localStorage:", error);
            }
          }
        } else {
          // Step 8: ローカルストレージにデータがない場合、全データを保存
          try {
            localStorage.setItem(`data_${user.id}`, JSON.stringify(userWords));
            console.log(
              `${userWords.length} Data for user ${user.id} has been successfully saved to localStorage.`
            );
          } catch (error) {
            console.error("Error writing to localStorage:", error);
          }
        }

        router.push("/wordQuiz");
      }
    };

    saveDataToLocalStorage();
  }, [router]); // コンポーネントの初回レンダリング後に実行される

  return <div>Loading...</div>; // ローディング画面
};

export default Loading;
