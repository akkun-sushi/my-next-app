import { Sentence, SentenceAndWords, Word, WordIdsWithDates } from "../types";
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

const getSentencesAndWords = async (): Promise<SentenceAndWords[]> => {
  try {
    // 例文データを取得
    const sentencesData: Sentence[] = await getAllData<Sentence>(
      "sentences_list"
    );

    // 単語データを取得
    const wordsData: Word[] = await getAllData<Word>("words_list");

    // 例文IDごとに単語を整理
    const sentencesMap: SentenceAndWords[] = sentencesData.map((sentence) => {
      // その例文に関連する単語をフィルタリング
      const relatedWords = wordsData.filter(
        (word) => word.sentence_id === sentence.sentence_id
      );

      // 整形されたデータを返す
      return {
        ...sentence,
        words: relatedWords,
      };
    });

    console.log("Successfully fetched and mapped sentences and words data.");
    return sentencesMap;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

const getWordIdsWithDates = async (): Promise<WordIdsWithDates[]> => {
  // 単語データを取得
  const wordsData: Word[] = await getAllData<Word>("words_list");

  const wordIdsWithdates = wordsData.map((word) => ({
    word_id: word.word_id,
    learnDate: "", // 空文字で初期化
    reviewDate: "", // 空文字で初期化
  }));

  if (wordIdsWithdates)
    console.log("Successfully fetched and transformed word Ids with dates.");
  return wordIdsWithdates;
};

export { getAllData, getSentencesAndWords, getWordIdsWithDates };
