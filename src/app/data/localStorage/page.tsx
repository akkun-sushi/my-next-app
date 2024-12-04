const saveDataToLocalStorage = async <T,>(key: string, data: T[]) => {
  try {
    // ローカルストレージに保存する
    localStorage.setItem(key, JSON.stringify(data));

    console.log("Data saved to localStorage!");
  } catch (error) {
    console.error("Error saving data to localStorage:", error);
  }
};

const getDataFromLocalStorage = async <T,>(key: string): Promise<T | null> => {
  try {
    // ローカルストレージからデータを取得
    const storedData = localStorage.getItem(key);

    // データが存在しない場合はnullを返す
    if (!storedData) {
      console.log("No data found for the given key.");
      return null;
    }

    // JSON文字列をパースして返す
    const parsedData: T = JSON.parse(storedData);
    console.log("Data retrieved from localStorage!");
    return parsedData;
  } catch (error) {
    console.error("Error retrieving data from localStorage:", error);
    return null;
  }
};

const getLocalStorageSize = (unit: "KB" | "MB" = "KB") => {
  let totalSize = 0;

  // localStorage内のすべてのキーをループ
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
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

  console.log(`localStorageの使用容量: ${size.toFixed(2)} ${unit}`);

  return size;
};

export { saveDataToLocalStorage, getDataFromLocalStorage, getLocalStorageSize };
