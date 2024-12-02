import { MultipleData, UserWords } from "@/app/types";
import { GetJapanDate } from "./GetJapanTime";
import { User } from "@supabase/supabase-js";

// セッションストレージからユーザーデータを取得
const getUser = (): User | undefined => {
  const storedUser = sessionStorage.getItem("user");
  if (!storedUser) return; // ユーザー情報がない場合は処理を終了
  const user: User = JSON.parse(storedUser);
  return user;
};

// ローカルストレージから全データを取得
const GetAllData = (): UserWords[] | undefined => {
  const user = getUser();
  if (!user) return;

  const storedData = localStorage.getItem(`data_${user.id}`);
  if (!storedData) return; // データがない場合は処理を終了
  const data: UserWords[] = JSON.parse(storedData);

  // データが存在する場合はコンソールに出力し、返り値として返す
  if (data) {
    console.log("All Data has been retrieved!");
    return data;
  }

  return undefined; // 万が一データが空の配列だった場合に備えて
};

// 複数のデータを処理し、セッションに保存
const GetMultipleData = (wordLimit?: number): MultipleData | undefined => {
  // 全データを取得
  const data = GetAllData();
  if (!data) return;

  const learning: UserWords[] = []; // 今日学んだ単語
  const unlearn: UserWords[] = []; // 学んでいない単語
  const review: UserWords[] = []; // 復習対象の単語
  const limit: UserWords[] = []; // 制限に基づく単語リスト

  // データの処理
  data.forEach((item) => {
    if (item.learned_at === null) {
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

//ローカルストレージに保存されているユーザ別データを更新
const UpdateData = (updateData: UserWords[]) => {
  const user = getUser();
  if (!user) return;

  localStorage.setItem(`data_${user.id}`, JSON.stringify(updateData));

  console.log("User word updated successfully.");
};

export { GetAllData, GetMultipleData, UpdateData};
