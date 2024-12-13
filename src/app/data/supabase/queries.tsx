import { supabase } from "./client";

const getAllData = async <T,>(
  tableName: string,
  maxRecords = 3000
): Promise<T[]> => {
  let allData: T[] = [];
  const batchSize = 1000; // supabaseの無料版では一回のクエリで1000件まで
  let start = 0;
  let end = batchSize - 1;

  try {
    while (start < maxRecords) {
      const { data: batchData, error } = await supabase
        .from(tableName)
        .select("*")
        .range(start, end);

      if (error) {
        throw new Error(
          `Error fetching words from range ${start}-${end}: ${error.message}`
        );
      }

      if (!batchData || batchData.length === 0) {
        break; // データがこれ以上ない場合に終了
      }

      allData = [...allData, ...batchData];

      // 範囲を次のバッチに更新
      start += batchSize;
      end += batchSize;
    }

    console.log(`Fetched ${allData.length} records!`);
    return allData;
  } catch (error) {
    console.error(error);
    return []; // エラー時は空配列を返す
  }
};

export { getAllData };