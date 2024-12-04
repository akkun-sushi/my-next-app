import { getDataFromLocalStorage } from "../localStorage/page";
import { WordIdsWithDates } from "../types";

const saveDataToSessionStorage = async <T,>(key: string, data: T[]) => {
  try {
    // セッションストレージに保存する
    sessionStorage.setItem(key, JSON.stringify(data));

    console.log("Data saved to sessionStorage!");
  } catch (error) {
    console.error("Error saving data to sessionStorage:", error);
  }
};

const getDataFromSessionStorage = async <T,>(
  key: string
): Promise<T | null> => {
  try {
    // セッションストレージからデータを取得
    const storedData = sessionStorage.getItem(key);

    // データが存在しない場合はnullを返す
    if (!storedData) {
      console.log("No data found for the given key.");
      return null;
    }

    // JSON文字列をパースして返す
    const parsedData: T = JSON.parse(storedData);
    console.log("Data retrieved from sessionStorage!");
    return parsedData;
  } catch (error) {
    console.error("Error retrieving data from sessionStorage:", error);
    return null;
  }
};

const getSessionStorageSize = (unit: "KB" | "MB" = "KB") => {
  let totalSize = 0;

  // sessionStorage内のすべてのキーをループ
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key) {
      const value = sessionStorage.getItem(key);
      if (value) totalSize += key.length + value.length;
    }
  }

  // サイズの単位に応じて変換
  let size: number;
  if (unit === "MB") {
    size = totalSize / (1024 * 1024); // MB単位に変換
  } else {
    size = totalSize / 1024; // KB単位に変換
  }

  console.log(`sessionStorageの使用容量: ${size.toFixed(2)} ${unit}`);

  return size;
};

// 複数のデータを処理し、セッションに保存
const saveMultipleToSessionStorage = async (
  wordLimit?: number
): MultipleData | undefined => {
  // 全データを取得
  const IWD = await getDataFromLocalStorage<WordIdsWithDates[]>(
    "WordIdsWithDates"
  );
  if (!IWD) return;

  const learning: UserWords[] = []; // 今日学んだ単語
  const unlearn: UserWords[] = []; // 学んでいない単語
  const review: UserWords[] = []; // 復習対象の単語
  const limit: UserWords[] = []; // 制限に基づく単語リスト

  // データの処理
  IWD.forEach((iwd) => {
    if (item.learnDate === null) {
      unlearn.push(item); // learned_at が null の場合は unlearn に追加
    } else {
      const today = GetJapanDate();
      const learnedAt = new Date(item.learned_at);
      const learnedAtDate = learnedAt.toISOString().split("T")[0];

      if (learnedAtDate === today) learning.push(item); // 今日学んだ単語は learning に追加

      const reviewedAt = new Date(item.reviewed_at);

      const learnedToReviewedDiff = Math.floor(
        (reviewedAt.getTime() - learnedAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      const learnedToTodayDiff = Math.floor(
        (new Date(today).getTime() - learnedAt.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (learnedToTodayDiff >= learnedToReviewedDiff) {
        review.push(item); // 復習対象の単語は review に追加
      }
    }
  });

  // 復習対象の単語を reviewed_at の順でソート
  review.sort((a, b) => {
    const dateA = new Date(a.reviewed_at);
    const dateB = new Date(b.reviewed_at);
    return dateA.getTime() - dateB.getTime();
  });

  // 既に `learningData` にあるデータ数を差し引いた残りのデータを追加
  const remainingLimit = wordLimit ? wordLimit - learning.length : 0;

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

  // セッションストレージにデータを保存
  sessionStorage.setItem("multipleData", JSON.stringify(multipleData));

  // 保存が成功したことをログに出力
  console.log("Multiple data has been successfully saved to sessionStorage.");

  return multipleData;
};

export {
  saveDataToSessionStorage,
  getDataFromSessionStorage,
  getSessionStorageSize,
};
