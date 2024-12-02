function SpeakerSetting(text: string, onEndCallback?: () => void) {
  const language = sessionStorage.getItem("language");
  const utterance = new SpeechSynthesisUtterance(text);

  // 設定された言語を設定
  if (language !== null) {
    utterance.lang = language;
  }

  // onend コールバックが渡されていれば、読み上げ終了後にその関数を呼ぶ
  if (onEndCallback) {
    utterance.onend = onEndCallback;
  }

  // 読み上げを実行
  window.speechSynthesis.speak(utterance);
}

export default SpeakerSetting;
