function SpeakerSetting(text: string, onEndCallback?: () => void) {
  const utterance = new SpeechSynthesisUtterance(text);

  // 使用する言語を設定
  utterance.lang = "es-ES";

  // 利用可能な音声リストを取得し、スペイン語の音声を設定
  const voices = window.speechSynthesis.getVoices();
  const spanishVoice = voices.find((voice) => voice.lang === "es-ES");

  if (spanishVoice) {
    utterance.voice = spanishVoice;
  } else {
    console.warn("スペイン語の音声が見つかりませんでした。");
  }

  // 読み上げ終了時のコールバック
  if (onEndCallback) {
    utterance.onend = onEndCallback;
  }

  // 読み上げを実行
  window.speechSynthesis.speak(utterance);
}


// 正解音を再生して5秒後に停止する関数
const PlaySuccessSound = () => {
  const audio = new Audio("/success.mp3"); // publicフォルダ内の音声ファイル
  audio.play(); // 音声を再生

  // 5秒後に音声を停止する
  setTimeout(() => {
    audio.pause(); // 音声を停止
    audio.currentTime = 0; // 再生位置を先頭に戻す
  }, 5000); // 5000ms = 5秒
};

// 不正解音を再生して5秒後に停止する関数
const PlayFailureSound = () => {
  const audio = new Audio("/failure.mp3"); // publicフォルダ内の音声ファイル
  audio.play(); // 音声を再生

  // 5秒後に音声を停止する
  setTimeout(() => {
    audio.pause(); // 音声を停止
    audio.currentTime = 0; // 再生位置を先頭に戻す
  }, 5000); // 5000ms = 5秒
};

export { SpeakerSetting, PlaySuccessSound, PlayFailureSound };
