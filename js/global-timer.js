window.renderGlobalTimer = function(containerId) {
  const html = `
    <div id="timer-setup-global" style="display:flex;align-items:center;gap:12px;margin-bottom:18px;justify-content:center;">
      <label style="font-weight:bold;">수강신청 오픈 시간</label>
      <input type="datetime-local" id="open-time-global" style="height:32px;font-size:1em;">
      <button id="set-timer-btn-global" class="btn">타이머 설정</button>
      <span id="server-time-global" style="margin-left:24px;color:#1976d2;font-weight:bold;"></span>
      <span id="timer-remaining-global" style="margin-left:12px;color:#d32f2f;font-weight:bold;"></span>
    </div>
  `;
  document.getElementById(containerId).innerHTML = html;
  async function fetchNaverTime() {
    try {
      const res = await fetch('https://worldtimeapi.org/api/timezone/Asia/Seoul');
      const data = await res.json();
      return new Date(data.datetime);
    } catch(e) {
      return new Date();
    }
  }
  let openTime = null;
  let timerInterval = null;
  window.globalOpenTime = window.globalOpenTime || null;
  async function updateServerTimeAndTimer() {
    const now = await fetchNaverTime();
    document.getElementById('server-time-global').textContent = '현재 시각: ' + now.toLocaleString();
    if(openTime) {
      const diff = openTime - now;
      if(diff > 0) {
        document.getElementById('timer-remaining-global').textContent = '남은 시간: ' + Math.floor(diff/1000) + '초';
        window.globalTimerActive = false;
        window.globalOpenTime = openTime;
      } else {
        document.getElementById('timer-remaining-global').textContent = '수강신청 가능!';
        window.globalTimerActive = true;
        window.globalOpenTime = openTime;
      }
    } else {
      document.getElementById('timer-remaining-global').textContent = '';
      window.globalTimerActive = true;
      window.globalOpenTime = null;
    }
  }
  document.getElementById('set-timer-btn-global').onclick = function() {
    const val = document.getElementById('open-time-global').value;
    if(!val) { alert('오픈 시간을 입력하세요!'); return; }
    openTime = new Date(val);
    window.globalOpenTime = openTime;
    if(timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateServerTimeAndTimer, 1000);
    updateServerTimeAndTimer();
  };
  fetchNaverTime().then(now => {
    document.getElementById('server-time-global').textContent = '현재 시각: ' + now.toLocaleString();
  });
};
