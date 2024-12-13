import { supabase } from "@/app/data/supabase/client";
import GoogleIcon from "./GoogleIcon";
//google認証
const GoogleSignIn = () => {
  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        //サインイン時にユーザーの確認を求める
        queryParams: { prompt: "consent" },
        //認証後にリダイレクトするURL
        redirectTo: process.env.NEXT_PUBLIC_REDIRECT_URL,
      },
    });
    if (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-700 p-4">
      {/* Word Quiz タイトル */}
      <h1 className="text-6xl font-extrabold text-white mb-8 md:text-7xl">
        Word Quiz
      </h1>

      {/* カード */}
      <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md text-center space-y-6 w-full md:max-w-lg">
        {/* 挨拶 */}
        <h2 className="text-3xl font-extrabold text-gray-800">こんにちは！</h2>
        <p className="text-gray-600">続けるにはサインインしてください</p>

        {/* Google サインインボタン */}
        <div className="flex justify-center">
          <button
            onClick={handleSignIn}
            className="flex items-center space-x-4 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-black border-black border rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105"
          >
            <GoogleIcon width={6} height={6} />
            <span className="font-semibold">Googleでサインイン</span>
          </button>
        </div>

        {/* 利用規約とプライバシーポリシー */}
        <p className="text-sm text-gray-500">
          サインインすることで、{" "}
          <a href="#" className="text-blue-500 hover:underline">
            利用規約
          </a>{" "}
          および{" "}
          <a href="#" className="text-blue-500 hover:underline">
            プライバシーポリシー
          </a>{" "}
          に同意したものとみなされます。
        </p>
      </div>
    </div>
  );
};

export default GoogleSignIn;
