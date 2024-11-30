const GetJapanTime = (): string => {
  // 現在の日本時間を取得し、フォーマットを "YYYY-MM-DD" に変換
  const date = new Date()
    .toLocaleDateString("ja-JP", {
      timeZone: "Asia/Tokyo", // タイムゾーンを東京時間に設定
      year: "numeric", // 年を4桁で表示
      month: "2-digit", // 月を2桁で表示
      day: "2-digit", // 日を2桁で表示
    })
    .replace(/\//g, "-"); // スラッシュをハイフンに置き換え
  return date; // フォーマット済みの日付を返す (例: "2024-11-27")
};

export default GetJapanTime;
