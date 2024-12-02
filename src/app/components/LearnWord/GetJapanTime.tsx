const GetJapanTime = () => {
  const offset = 9 * 60; // 日本標準時 (JST) のオフセットは UTC+9
  const now = new Date();
  const japanTime = new Date(now.getTime() + offset * 60000);
  return japanTime;
};

const GetJapanDate = () => {
  const japanDate = GetJapanTime().toISOString().split("T")[0];
  return japanDate;
};

export { GetJapanTime, GetJapanDate };
