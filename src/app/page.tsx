"use client";

import { useRouter } from "next/navigation";
import { supabase } from "./supabase";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import GoogleSignIn from "./components/SignIn/GoogleSignIn";

const Home = () => {
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  //認証状態の変更を監視するリスナー設定
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        //ユーザーがサインインして、セッションが存在する場合
        if (session) {
          setSession(session);
          console.log("Event:", event);

          const { user } = session;
          //データベースからサインインしたidと一致するレコードを取得
          const { data: firstSignIn } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id);

          //初回サインイン（＝サインアップ）時はデータベースにidとemailを記録
          if (firstSignIn?.length === 0) {
            const { error } = await supabase
              .from("users")
              .insert([{ id: user.id, email: user.email }]);
            if (error) {
              console.error(
                "Error inserting user into database:",
                error.message
              );
            } else {
              console.log("User inserted into database successfully!");
            }
          }
          router.push("/loading");
        }
      }
    );
    return () => {
      //コンポーネントがアンマウントされる際に、リスナーを解除
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  if (session === null) {
    return <GoogleSignIn />;
  }
};

export default Home;
