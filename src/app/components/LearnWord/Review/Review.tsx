import { ReviewMode } from "@/app/data/types";
import React from "react";
import Chart from "./Chart";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";
import Link from "next/link";
import { RxCross2 } from "react-icons/rx";

interface ReviewProps {
  reviewMode: ReviewMode;
  saveReviewMode: (
    key: keyof ReviewMode["state"] | "random" | "type" | "count",
    value: boolean | string | number
  ) => void;
  handleReview: () => void;
}

const Review: React.FC<ReviewProps> = ({
  reviewMode,
  saveReviewMode,
  handleReview,
}) => {
  const { width, height } = useWindowSize();

  // ランダムモードを切り替える関数
  const toggleRandomMode = () => {
    saveReviewMode("random", !reviewMode.random);
  };

  // 問題の種類を切り替える関数
  const toggleType = () => {
    const newType =
      reviewMode.type === "all"
        ? "new"
        : reviewMode.type === "new"
        ? "wrong"
        : "all";

    saveReviewMode("type", newType);
  };

  // 新しい単語を学ぶモードに切り替える関数
  const startNewLearning = () => {
    saveReviewMode("newLearning", true);
  };

  return (
    <>
      {/* 花火のエフェクト */}
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={400}
        gravity={0.2}
      />

      <div className="w-full h-full max-w-screen max-h-screen grid grid-rows-[15%_60%_25%] overflow-hidden py-4">
        {/* 上部セクション */}
        <section className="relative w-full flex justify-center items-center px-4 sm:px-12 md:px-20 pt-6">
          {/* 戻るボタン */}
          <div className="absolute left-4 sm:left-8 md:left-12 lg:left-16 top-4">
            <Link
              href="/wordQuiz"
              className="text-xl sm:text-3xl md:text-5xl text-black"
            >
              <RxCross2 />
            </Link>
          </div>
          {/* ページタイトル */}
          <h1 className="text-sm xs:text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold text-black text-center">
            すべての単語を学習し終えました！
          </h1>
        </section>

        {/* グラフ*/}
        <section className="w-full">
          <Chart />
        </section>

        {/* ボタンセクション */}
        <section className="w-full pb-4">
          <div className="w-full grid grid-rows-2 md:grid-cols-2 gap-4 md:gap-8 px-6 sm:px-12 md:px-20 text-xs sm:text-sm md:text-lg lg:text-xl">
            <button
              onClick={toggleRandomMode}
              className={`w-full py-3 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 ${
                reviewMode.random
                  ? "bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:scale-105"
                  : "bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 hover:scale-105"
              }`}
            >
              {reviewMode.random ? "ランダム: オン" : "ランダム: オフ"}
            </button>
            <button
              onClick={toggleType}
              className={`w-full py-3 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 ${
                reviewMode.type === "all"
                  ? "bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:scale-105"
                  : reviewMode.type === "new"
                  ? "bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 hover:scale-105"
                  : "bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:scale-105"
              }`}
            >
              {reviewMode.type === "all"
                ? "すべての問題"
                : reviewMode.type === "new"
                ? "新しい問題"
                : "間違った問題"}
            </button>
          </div>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 mt-4 px-6 sm:px-12 md:px-20">
            <button
              onClick={handleReview}
              className="w-full py-3 text-white font-semibold rounded-lg shadow-lg bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:scale-105 hover:brightness-110 transition-all duration-300"
            >
              復習する
            </button>
            {reviewMode.count >= 3 && (
              <button
                onClick={startNewLearning}
                className="w-full py-3 text-white font-semibold rounded-lg shadow-lg bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:scale-105 hover:brightness-110 transition-all duration-500"
              >
                新しい問題を学習する
              </button>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Review;
