const saveDataToSession = <T,>(key: string, data: T | T[]) => {
  try {
    // セッションストレージに保存する
    sessionStorage.setItem(key, JSON.stringify(data));

    console.log("Data saved to sessionStorage!");
  } catch (error) {
    console.error("Error saving data to sessionStorage:", error);
  }
};

const getDataFromSession = <T,>(key: string): T | [] => {

    // セッションストレージからデータを取得
    const storedData = sessionStorage.getItem(key);

    // データが存在しない場合はnullを返す
    if (!storedData) {
      console.log("No data found for the given key.");
      return [];
    }

    // JSON文字列をパースして返す
    const parsedData: T = JSON.parse(storedData);
    console.log("Data retrieved from sessionStorage!");
    return parsedData;
};

const sessionStorageSize = (unit: "KB" | "MB" = "KB") => {
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

export { saveDataToSession, getDataFromSession, sessionStorageSize };
