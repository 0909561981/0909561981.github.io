async function fetchPlayerInfo(account) {
  try {
    const data = await ApiService.postToBackend('/get_player_info', { account });

    if (data && data.success) {
      console.log('✅ 玩家資料取得成功：', data);
      return data;
    } else {
      console.warn('⚠️ 找不到該玩家資訊：', data);
      return undefined;
    }
  } catch (error) {
    console.error('🚨 請求玩家資訊時發生錯誤：', error);
    return undefined;
  }
}
