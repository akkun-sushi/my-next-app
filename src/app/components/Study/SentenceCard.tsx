"use client";

import Link from "next/link";
import { useState } from "react";
import { GiSpeaker } from "react-icons/gi";

const SentenceCard = () => {
  const [reverseSC, setReverseSC] = useState<boolean>(false); // 表示を反転するフラグ
  return (
    <main className="flex flex-col items-center w-screen min-h-screen bg-blue-100 py-8 px-4">
      {/* 上部セクション */}
      <section className="flex w-4/5 items-center justify-between px-4">
        <Link
          href="/"
          className="text-xl sm:text-2xl md:text-3xl font-bold text-black hover:text-red-500 transition-colors"
        >
          戻る
        </Link>
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mt-8 text-black text-center mx-auto">
          音声の後について発音してみましょう
        </h1>
      </section>

      {/* メインコンテンツ */}
      <section className="flex flex-col items-center justify-center w-full mt-5 md:mt-10">
        <>
          <div className="relative w-4/5 md:w-3/5 h-[200px] sm:h-[200px] md:h-[300px] rounded-2xl shadow-lg flex items-center justify-center px-4 py-8 transition-all duration-500 bg-white">
            <h1 className="md:text-3xl  font-bold text-center">
              たとえばこんなに長い文が含まれるよ
            </h1>
            <div className="absolute top-4 right-4 sm:text-5xl md:text-6xl cursor-pointer transition-all transform text-black hover:text-red-500">
              <GiSpeaker />
            </div>
            <button className="absolute top-20 right-4 px-4 py-1 rounded-lg shadow-md text-sm text-white font-bold sm:text-base transition-all bg-gray-500 hover:bg-gray-600">
              常に
            </button>
          </div>

          <div className="flex w-4/5 md:w-2/3 lg:w-1/2 mt-8 md:mt-10 justify-center font-bold text-white text-sm md:text-xl lg:text-2xl mx-auto space-x-6 sm:space-x-10 md:space-x-14 lg:space-x-20">
            <button className="px-6 py-4 bg-blue-500 rounded-xl shadow-md hover:bg-blue-600 transition-colors w-full">
              次へ
            </button>
          </div>
        </>
      </section>
    </main>
  );
};

export default SentenceCard;
