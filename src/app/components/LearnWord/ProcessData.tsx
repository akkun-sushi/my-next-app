import { MultipleData, WordWithDate } from "@/app/data/types";
import { GetJapanDate } from "./GetJapanTime";

const ProcessData = (newOnly: boolean = false): MultipleData => {
  const storedData = localStorage.getItem("español");
  const storedWordLimit = sessionStorage.getItem("wordLimit");
  let data: WordWithDate[] = [];
  let wordLimit: number = 0;

  if (storedData && storedWordLimit) {
    data = JSON.parse(storedData);
    wordLimit = Number(storedWordLimit);
  }

  const today = GetJapanDate();
  const learning: WordWithDate[] = []; // 今日学んだ単語
  const unlearn: WordWithDate[] = []; // 学んでいない単語
  const review: WordWithDate[] = []; // 復習対象の単語
  const limit: WordWithDate[] = []; // 制限に基づく単語リスト

  // データの処理
  data.forEach((item) => {
    if (item.learnDate === "") {
      unlearn.push(item);
    } else {
      const learnAt = new Date(item.learnDate);

      if (item.learnDate === today) learning.push(item); // 今日学んだ単語は learning に追加

      const reviewAt = new Date(item.reviewDate);

      const learnToReviewDiff = Math.floor(
        (reviewAt.getTime() - learnAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      const learnToTodayDiff = Math.floor(
        (new Date(today).getTime() - learnAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (learnToTodayDiff >= learnToReviewDiff) {
        review.push(item); // 復習対象の単語は review に追加
      }
    }
  });

  review.sort((a, b) => {
    const DateA = new Date(a.reviewDate);
    const DateB = new Date(b.reviewDate);
    return DateA.getTime() - DateB.getTime();
  });

  let remainingLimit: number = 0;

  if (newOnly) {
    if (wordLimit) remainingLimit = wordLimit;
  } else {
    // 既に `learningData` にあるデータ数を差し引いた残りのデータを追加
    remainingLimit = wordLimit ? wordLimit - learning.length : 0;
  }

  // reviewData から先に追加
  limit.push(...review.slice(0, remainingLimit));

  // もし reviewData が remainingLimit の数に満たない場合、unlearnData から追加
  if (limit.length < remainingLimit) {
    const additionalLimit = remainingLimit - limit.length;
    const additionalData = unlearn.slice(0, additionalLimit);
    limit.push(...additionalData); // 残りのデータを追加
  }

  // 複数のデータをまとめたオブジェクト
  const multipleData: MultipleData = {
    learning,
    unlearn,
    review,
    limit,
  };

  return multipleData;
};

export default ProcessData;
