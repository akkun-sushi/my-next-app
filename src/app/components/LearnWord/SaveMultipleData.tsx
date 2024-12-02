import { CombinedData, MultipleData } from "@/app/types";
import { GetJapanDate } from "./GetJapanTime";

// 複数のデータを処理し、セッションに保存
const SaveMultipleData = () => {
  const storedData = sessionStorage.getItem("data");
  if (!storedData) return;
  
  const data: CombinedData[] = JSON.parse(storedData);

  const today = GetJapanDate();

  const learning = data.filter((item) => {
    if (item.learned_at === null) {
      return false;
    }

    const learnedAtDate = new Date(item.learned_at).toISOString().split("T")[0];
    return learnedAtDate === today;
  });

  const unlearn: CombinedData[] = [];
  const review: CombinedData[] = [];

  data.forEach((item) => {
    if (item.learned_at === null) {
      unlearn.push(item);
    } else {
      const learnedAt = new Date(item.learned_at);
      const reviewedAt = new Date(item.reviewed_at);

      const learnedToReviewedDiff = Math.floor(
        (reviewedAt.getTime() - learnedAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      const learnedToTodayDiff = Math.floor(
        (new Date(today).getTime() - learnedAt.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (learnedToTodayDiff >= learnedToReviewedDiff) {
        review.push(item);
      }
    }
  });

  review.sort((a, b) => {
    const dateA = new Date(a.reviewed_at);
    const dateB = new Date(b.reviewed_at);
    return dateA.getTime() - dateB.getTime();
  });

  const multipleData: MultipleData = {
    learning,
    unlearn,
    review,
  };

  sessionStorage.setItem("multipleData", JSON.stringify(multipleData));
};

export default SaveMultipleData;
