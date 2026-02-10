const tabMap = {
  notice: 'front/notice.html',
  subject: 'front/subject.html',
  basket: 'front/basket.html',
  register: 'front/register.html'
};

let timerInterval = null;
window.globalOpenTime = null;

// 네비게이션 클릭
document.querySelectorAll('.nav-menu li').forEach(li => {
  li.onclick = function() {
    const pageType = this.dataset.page;
    
    if (pageType === 'register' && !window.globalOpenTime) {
      document.getElementById('timer-modal').style.display = 'flex';
      return;
    }

    document.querySelectorAll('.nav-menu li').forEach(l => l.classList.remove('is-active'));
    this.classList.add('is-active');
    document.getElementById('main-frame').src = tabMap[pageType];
  };
});

// 타이머 설정
document.getElementById('set-timer-btn').onclick = function() {
  const hour = parseInt(document.getElementById('timer-hour').value, 10) || 0;
  const min = parseInt(document.getElementById('timer-min').value, 10) || 0;
  const sec = parseInt(document.getElementById('timer-sec').value, 10) || 0;

  const now = new Date();
  let openHour = now.getHours() + hour;
  let openMin = now.getMinutes() + min;
  let openSec = now.getSeconds() + sec;

  if (openSec >= 60) {
    openMin += Math.floor(openSec / 60);
    openSec = openSec % 60;
  }
  if (openMin >= 60) {
    openHour += Math.floor(openMin / 60);
    openMin = openMin % 60;
  }
  if (openHour >= 24) {
    openHour = openHour % 24;
  }

  const newOpenTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), openHour, openMin, openSec);
  if (newOpenTime <= now) {
    newOpenTime.setDate(newOpenTime.getDate() + 1);
  }

  window.globalOpenTime = newOpenTime;
  if (timerInterval) clearInterval(timerInterval);
  updateTimer();
};

// 초기화
document.getElementById('reset-btn').onclick = function() {
  localStorage.removeItem('registerList');
  localStorage.removeItem('basketList');
  window.globalOpenTime = null;
  if (timerInterval) clearInterval(timerInterval);
  document.getElementById('timer-display').textContent = '설정 필요';
  document.getElementById('timer-status').textContent = '';
};

// 타이머 업데이트
function updateTimer() {
  if (!window.globalOpenTime) return;
  
  const update = () => {
    const now = new Date();
    let diff = Math.floor((window.globalOpenTime - now) / 1000);
    
    if (diff <= 0) {
      clearInterval(timerInterval);
      document.getElementById('timer-display').textContent = '00:00 (오픈됨)';
      document.getElementById('timer-status').textContent = '';
    } else {
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      document.getElementById('timer-display').textContent = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    }
  };
  
  update();
  timerInterval = setInterval(update, 500);
}

// 총 학점 업데이트
function updateTotalCredit() {
  try {
    const registerList = JSON.parse(localStorage.getItem('registerList') || '[]');
    const totalCredit = registerList.reduce((sum, course) => sum + parseInt(course.credit, 10), 0);
    document.getElementById('total-credit').textContent = totalCredit;
  } catch (e) {
    console.error('Credit error:', e);
  }
}

// 서버 시간 표시 (현재 시간)
function updateServerTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('server-time').textContent = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
}

updateServerTime();
setInterval(updateServerTime, 1000);
setInterval(updateTotalCredit, 500);
updateTotalCredit();
