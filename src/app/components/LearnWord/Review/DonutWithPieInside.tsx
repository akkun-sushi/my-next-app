import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// データの型定義
interface DonutData {
  correctCount: number;
  wrongCount: number;
  unlearnCount: number;
  learnedCount: number;
}

const COLORS = ["#82ca9d", "#FF7043"];
const COLORS2 = ["#FFB74D", "#4A90E2"];

interface DonutWithPieInsideProps {
  data: DonutData; // dataの型を指定
}

export const DonutWithPieInside: React.FC<DonutWithPieInsideProps> = ({
  data,
}) => {
  const { correctCount, wrongCount, unlearnCount, learnedCount } = data;

  const data01 = useMemo(
    () => [
      { name: "正解した問題", value: correctCount },
      { name: "間違えた問題", value: wrongCount },
    ],
    [correctCount, wrongCount]
  );

  const data02 = useMemo(
    () => [
      { name: "新規問題", value: unlearnCount },
      { name: "復習問題", value: learnedCount },
    ],
    [unlearnCount, learnedCount]
  );

  return (
    <ResponsiveContainer
      width="100%"
      height={window.innerWidth < 768 ? 250 : 400} // 小さい画面では高さを縮小
    >
      <PieChart>
        {/* 外側のドーナツグラフ */}
        <Pie
          className="focus:outline-none"
          data={data01}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={window.innerWidth < 768 ? 100 : 150} // 小さい画面では半径を縮小
          innerRadius={window.innerWidth < 768 ? 70 : 120} // 小さい画面では半径を縮小
          isAnimationActive={true}
          animationDuration={1000}
          animationEasing="ease-out"
        >
          {data01.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              strokeWidth={2}
            />
          ))}
        </Pie>

        {/* 内側の円グラフ */}
        <Pie
          className="focus:outline-none"
          data={data02}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={window.innerWidth < 768 ? 60 : 100} // 小さい画面では半径を縮小
          isAnimationActive={true}
          animationDuration={1000}
          animationEasing="ease-out"
        >
          {data02.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS2[index % COLORS2.length]}
              strokeWidth={2}
            />
          ))}
        </Pie>

        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};
