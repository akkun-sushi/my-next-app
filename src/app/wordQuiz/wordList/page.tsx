"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const WordListPage = () => {
  const content = ["language", "difficulty", "category"];
  const [isSearching, setIsSearching] = useState<string>(content[0]);
  const [language, setLanguage] = useState<string>("en");
  const [difficulty, setDifficulty] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  const handleSelect = (direction: "forward" | "back") => {
    const currentIndex = content.indexOf(isSearching);

    if (
      (isSearching === "difficulty" && !difficulty) ||
      (isSearching === "language" && !language)
    ) {
      alert("選択が完了していない項目があります。");
      return; // 進行を停止
    }

    if (direction === "forward") {
      setIsSearching(content[currentIndex + 1]);
    } else if (direction === "back") {
      setIsSearching(content[currentIndex - 1]);
    }
  };

  const handleSearch = async () => {
    /*
    try {
      // Add the new friend!
      const id = await db.Search.add({
        language,
        difficulty,
        category,
      });
      console.log(`successfully added. Got id ${id}`);
    } catch (error) {
      console.log(`Failed to add : ${error}`);
    }
  
    const search = await db.Search.get(2); // IDが1の友達を取得
    console.log(search); // { id: 1, name: 'Alice', age: 25 }s
        */
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-8 bg-gradient-to-r from-blue-300 to-teal-200">
      {/* 上部セクション */}
      <section className="w-full mt-4">
        {/* 戻るボタン */}
        <div className="ml-10 -mb-4">
          <div className="flex justify-start">
            <motion.button
              className="text-white bg-gradient-to-r from-purple-400 to-pink-500 py-3 px-8 rounded-2xl transform transition-all duration-300 hover:scale-110 text-2xl font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              戻る
            </motion.button>
          </div>
        </div>
        {/* タイトル */}
        <div className="flex justify-center items-center mb-12">
          <motion.h1
            className="text-5xl font-extrabold text-gray-900 dark:text-gray-100 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            学習する単語リストを検索
          </motion.h1>
        </div>
      </section>

      {/* メインコンテンツ */}
      <motion.div
        className={`bg-white p-10 rounded-xl shadow-xl w-full sm:w-96 lg:w-2/5 ${
          isSearching === "language" && "mt-14"
        }`}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 1 }}
        key={isSearching}
      >
        {isSearching === "language" ? (
          <div className="mb-8">
            <label
              htmlFor="language"
              className="block text-gray-700 text-xl font-bold mb-4"
            >
              言語を選択
            </label>
            <select
              id="language"
              name="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="block w-full px-6 py-3 border rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ease-in-out duration-300 transform text-lg font-bold text-gray-700 "
            >
              <option value="en">英語</option>
              <option value="es">スペイン語</option>
              <option value="fr">フランス語</option>
            </select>
          </div>
        ) : isSearching === "difficulty" ? (
          <div className="mb-8">
            <label
              htmlFor="list-type"
              className="block text-gray-700 text-xl font-bold mb-4"
            >
              難易度を選択
            </label>
            <div className="space-y-4">
              <button
                onClick={() => setDifficulty("beginner")}
                className={`w-full py-3 px-6 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg hover:bg-green-500 focus:outline-none text-lg font-semibold transition-all duration-1000 ${
                  difficulty !== "beginner" ? "opacity-40" : "opacity-100"
                }`}
              >
                初級
              </button>
              <button
                onClick={() => setDifficulty("intermediate")}
                className={`w-full py-3 px-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:bg-yellow-500 focus:outline-none text-lg font-semibold transition-all duration-1000 ${
                  difficulty !== "intermediate" ? "opacity-40" : "opacity-100"
                }`}
              >
                中級
              </button>
              <button
                onClick={() => setDifficulty("advanced")}
                className={`w-full py-3 px-6 bg-gradient-to-r from-pink-400 to-red-500 text-white rounded-lg hover:bg-pink-500 focus:outline-none text-lg font-semibold  transition-all duration-1000 ${
                  difficulty !== "advanced" ? "opacity-40" : "opacity-100"
                }`}
              >
                上級
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <label
              htmlFor="genre-type"
              className="block text-gray-700 text-xl font-bold mb-4"
            >
              カテゴリーを選択
            </label>
            <div className="space-y-4">
              <button
                onClick={() => setCategory("speech")}
                className={`w-full py-3 px-6 bg-gradient-to-r from-purple-400 to-indigo-500 text-white rounded-lg hover:bg-purple-500 focus:outline-none text-lg font-semibold transition-all duration-1000 ${
                  category !== "speech" ? "opacity-40" : "opacity-100"
                }`}
              >
                品詞別
              </button>
              <button
                onClick={() => setCategory("genre")}
                className={`w-full py-3 px-6 bg-gradient-to-r from-teal-400 to-cyan-500 text-white rounded-lg hover:bg-teal-500 focus:outline-none text-lg font-semibold transition-all duration-1000 ${
                  category !== "genre" ? "opacity-40" : "opacity-100"
                }`}
              >
                ジャンル別
              </button>
              <button
                onClick={() => setCategory("alphabet")}
                className={`w-full py-3 px-6 bg-gradient-to-r from-pink-400 to-yellow-400 text-white rounded-lg hover:bg-yellow-400 focus:outline-none text-lg font-semibold transition-all duration-1000 ${
                  category !== "alphabet" ? "opacity-40" : "opacity-100"
                }`}
              >
                五十音別
              </button>
            </div>
          </div>
        )}

        {/* リストを検索ボタン */}

        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="flex space-x-6">
            {isSearching !== "language" && (
              <button
                onClick={() => handleSelect("back")}
                className="w-full bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-400 transform transition-all hover:scale-105 text-xl font-bold"
              >
                前へ
              </button>
            )}
            {isSearching !== "category" && (
              <button
                onClick={() => handleSelect("forward")}
                className="w-full bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-400 transform transition-all hover:scale-105 text-xl font-bold"
              >
                次へ
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* 検索エリア：全てが埋まったら表示 */}
      {language && difficulty && category && (
        <div className="absolute bottom-10 right-10 bg-white p-6 rounded-lg shadow-lg w-64 text-gray-700 ">
          <h3 className="text-xl font-semibold mb-4">検索内容</h3>
          <p>
            <strong>言語:</strong>{" "}
            {language === "en"
              ? "英語"
              : language === "ja"
              ? "日本語"
              : language === "es"
              ? "スペイン語"
              : "フランス語"}
          </p>
          <p>
            <strong>難易度:</strong>{" "}
            {difficulty === "beginner"
              ? "初級"
              : difficulty === "intermediate"
              ? "中級"
              : "上級"}
          </p>
          <p>
            <strong>カテゴリー:</strong>{" "}
            {category === "level"
              ? "レベル別"
              : category === "genre"
              ? "ジャンル別"
              : "五十音別"}
          </p>
          <button
            onClick={handleSearch}
            className="mt-4 w-full bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-400 transform transition-all hover:scale-105 "
          >
            検索
          </button>
        </div>
      )}
    </div>
  );
};

export default WordListPage;
