"use client";

import { useEffect } from "react";
import { List, UserWords } from "../data/types";
import { supabase } from "../data/supabase/client";
import { useRouter } from "next/navigation";
import { fetchAllWords } from "../data/supabase/queries";

// ローディング画面のコンポーネント
const Loading = () => {
  const router = useRouter();

  // コンポーネントがマウントされたときに実行
  useEffect(() => {
    // 非同期関数としてデータの保存処理を定義
    const saveDataToLocalStorage = async (): Promise<void> => {
      const wordsData: List[] = await fetchAllWords(100);

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

        const getLocalStorageSize = () => {
          let totalSize = 0;

          // localStorage内のすべてのキーをループ
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
              const value = localStorage.getItem(key);
              if (value) totalSize += key.length + value.length;
            }

            // 各アイテムのサイズを計算（文字列のバイト数）
          }

          // サイズをKBに変換して表示
          const sizeInKB = totalSize / 1024;
          console.log(`localStorageの使用容量: ${sizeInKB.toFixed(2)} KB`);

          return sizeInKB;
        };

        // 使用例
        getLocalStorageSize();

        //router.push("/wordQuiz");
      }
    };

    saveDataToLocalStorage();
  }, [router]); // コンポーネントの初回レンダリング後に実行される

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-700">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white border-opacity-50"></div>

        <p className="text-white text-xl font-bold animate-pulse">
          読み込み中...
        </p>
      </div>
    </div>
  ); // ローディング画面
};

export default Loading;
