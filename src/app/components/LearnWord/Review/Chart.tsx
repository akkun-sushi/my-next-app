import { FaCheck, FaPencilAlt } from "react-icons/fa";
import { DonutWithPieInside } from "./DonutWithPieInside";
import { MdRefresh } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import ProcessData from "../ProcessData";

const Chart = () => {
  // データの取得と処理
  const multipleData = ProcessData();

  const learning = multipleData.learning;
  const correctCount = learning.filter((item) => item.count.flag).length;
  const wrongCount = learning.filter((item) => !item.count.flag).length;
  const unlearnCount = learning.filter(
    ({ count: { correct, wrong } }) =>
      (correct === 1 && wrong === 0) || (correct === 0 && wrong === 1)
  ).length;
  const learnedCount = learning.length - unlearnCount;

  console.log(multipleData);

  // 子コンポーネントに渡すデータをまとめる
  const data = {
    correctCount,
    wrongCount,
    unlearnCount,
    learnedCount,
  };

  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 place-items-center px-8 sm:px-12 md:px-16 pb-6 gap-6 md:gap-12">
      {/* ドーナツグラフ */}
      <div className="w-full flex justify-center md:justify-end">
        <DonutWithPieInside data={data} />
      </div>
      {/* 統計情報 */}
      <div className="w-11/12 sm:w-3/4 flex flex-col justify-center items-center space-y-3 md:space-y-6 px-4 py-4 md:p-6 bg-white shadow-lg rounded-lg border border-gray-200 text-sm sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-700">
        <h1>
          新規問題: &nbsp;
          <span className="text-blue-500 font-bold inline-flex items-center">
            {data.unlearnCount}
            <FaPencilAlt className="ml-1 text-blue-500" />
          </span>
        </h1>
        <h1>
          復習問題: &nbsp;
          <span className="text-yellow-500 font-bold inline-flex items-center">
            {data.learnedCount}
            <MdRefresh className="ml-1 text-yellow-500" />
          </span>
        </h1>
        <h1>
          正解した問題: &nbsp;
          <span className="text-green-500 font-bold inline-flex items-center">
            {data.correctCount}
            <FaCheck className="ml-1 text-green-500" />
          </span>
        </h1>
        <h1>
          間違えた問題: &nbsp;
          <span className="text-red-500 font-bold inline-flex items-center">
            {data.wrongCount}
            <RxCross2 className="ml-1 text-red-500" />
          </span>
        </h1>
      </div>
    </div>
  );
};

export default Chart;
