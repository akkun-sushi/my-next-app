import { supabase } from "../supabase";

//全データ取得
export const GetAll = async () => {
  const { data } = await supabase.from("wordsList").select("*");
  return data;
};

//データ追加
export const Insert = async (term: string, meaning: string) => {
  await supabase.from("wordsList").insert([{ term, meaning }]).select();
};

//データ更新
export const Update = async (id: string, term: string, meaning: string) => {
  await supabase
    .from("wordsList")
    .update({ term, meaning })
    .eq("id", id)
    .select();
};

//データ削除
export const Delete = async (id: string) => {
  await supabase.from("wordsList").delete().eq("id", id);
};
