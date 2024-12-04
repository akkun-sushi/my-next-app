
import SentenceCard from "@/app/components/Study/SentenceCard";
import WordCard from "@/app/components/Study/WordCard";
import Link from "next/link";
import { GiSpeaker } from "react-icons/gi";

const Study = () => {
  // return <SentenceCard />;
  return <WordCard />
};

export default Study;

/*
 <main className="flex flex-col items-center w-screen min-h-screen bg-blue-100 py-8 px-4">
   
      <section className="flex w-4/5 items-center justify-between px-4">

        <Link
          href="/wordQuiz"
          className="text-xl sm:text-2xl md:text-3xl font-bold text-black hover:text-red-500 transition-colors"
        >
          戻る
        </Link>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mt-8 text-black text-center mx-auto">
          学習
        </h1>
      </section>
  

      <section className="flex flex-col items-center justify-center w-full h-full mt-5 md:mt-10">
     

        {false && !false ? ( // 仮にfalseの部分を置き換えた条件にする
          <div className="flex flex-col items-center">
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-16 mt-12 md:mb-20 md:mt-24 text-red-500">
              今日のタスクは終わりました！
              <br />
              お疲れ様です！
            </h2>
            <button
              className="px-6 py-3 md:px-10 md:py-5 mb-8 text-white text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold rounded-xl shadow-md transition-colors duration-300 bg-gray-500 hover:bg-gray-600"
            >
              ランダムオフ
            </button>
            <button
              className="px-6 py-3 md:px-10 md:py-5 bg-blue-500 text-white text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold rounded-xl shadow-md hover:bg-blue-600 transition-colors"
            >
              復習しますか？
            </button>
          </div>
        ) : false ? (
          
          <>
            <div
              className={`relative w-4/5 md:w-3/5 h-[200px] sm:h-[300px] md:h-[400px] rounded-2xl shadow-lg flex items-center justify-center px-4 py-8 transition-all duration-500 bg-white`}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-center">
                単語
              </h1>
              <div className="absolute top-4 left-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-500">
                New
              </div>
              <div className="absolute bottom-4 left-4 sm:text-lg md:text-xl text-black">
                次回学習日: 2024/12/05
              </div>
              <div
                className="absolute top-4 right-4 text-4xl sm:text-5xl md:text-6xl cursor-pointer transition-all transform text-black hover:text-red-500"
              >
                <GiSpeaker />
              </div>
              <button
                className={`absolute top-20 right-4 px-4 py-1 rounded-lg shadow-md text-sm text-white font-bold sm:text-base md:text-lg transition-all bg-gray-500 hover:bg-gray-600`}
              >
                常に
              </button>
            </div>
  
            <div className="flex w-4/5 md:w-2/3 lg:w-1/2 mt-8 sm:mt-12 md:mt-16 justify-between font-bold text-white text-sm md:text-xl lg:text-2xl mx-auto space-x-6 sm:space-x-10 md:space-x-14 lg:space-x-20">
              <button
                className="flex-1 px-6 py-4 bg-green-500 rounded-xl shadow-md hover:bg-green-600 transition-colors"
              >
                わかった
              </button>
              <button
                className="flex-1 px-6 py-4 bg-red-500 rounded-xl shadow-md hover:bg-red-600 transition-colors"
              >
                わからない
              </button>
            </div>
          </>
        }) : null} 
      </section>
    </main> */
