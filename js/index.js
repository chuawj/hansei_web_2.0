window.onload = function() {
    try {
      // initialization
      let currentSemester = localStorage.getItem('currentSemester') || '2';
      const semesterElem = document.getElementById('semester-' + currentSemester);
      if (semesterElem) semesterElem.checked = true;
      
      window.currentSemester = currentSemester;
      
      document.querySelectorAll('input[name="semester"]').forEach(radio => {
        radio.onchange = function() {
          currentSemester = this.value;
          window.currentSemester = currentSemester;
          localStorage.setItem('currentSemester', currentSemester);
        };
      });
      
      let queueEnabled = true;
      if(localStorage.getItem('queueEnabled')!==null) {
        queueEnabled = localStorage.getItem('queueEnabled')==='true';
      }
      const queueToggle = document.getElementById('queue-toggle');
      const queueStatus = document.getElementById('queue-status');
      const queueSelector = document.getElementById('queue-selector');
      const queueSelect = document.getElementById('queue-select');
      
      if(queueToggle && queueStatus) {
        queueToggle.checked = queueEnabled;
        queueStatus.textContent = queueEnabled ? 'ON' : 'OFF';
        if (queueSelector) queueSelector.style.display = queueEnabled ? 'block' : 'none';
        
        queueToggle.onchange = function() {
          queueEnabled = queueToggle.checked;
          localStorage.setItem('queueEnabled', queueEnabled);
          if (queueStatus) queueStatus.textContent = queueEnabled ? 'ON' : 'OFF';
          if (queueSelector) queueSelector.style.display = queueEnabled ? 'block' : 'none';
          if (queueSelect && !queueEnabled) queueSelect.value = '';
        };
      }
      
      if (queueSelect) {
        const savedQueue = localStorage.getItem('selectedQueue') || '';
        queueSelect.value = savedQueue;
        queueSelect.onchange = function() {
          localStorage.setItem('selectedQueue', this.value);
        };
      }
    const tabMap = {
      notice: 'front/notice.html',
      subject: 'front/subject.html',
      basket: 'front/basket.html',
      register: 'front/register.html',
      history: 'front/history.html'
    };

    // 변수를 먼저 선언 (탭 이벤트 바인딩 전)
    let timerInterval = null;
    // 전역 타이머 상태를 통일하여 다른 모듈과 공유
    window.globalOpenTime = window.globalOpenTime || null;
    const timerStatus = document.getElementById('timer-status');
    const mainFrame = document.getElementById('main-frame');
    const registerBtn = document.querySelector('.tab-btn[data-page="register"]');
    const timerNotOpenedModal = document.getElementById('timer-not-opened-modal');
    const timerModalCloseBtn = document.getElementById('timer-modal-close-btn');

    // 모달 닫기 버튼
    if (timerModalCloseBtn) {
      timerModalCloseBtn.onclick = function() {
        if (timerNotOpenedModal) timerNotOpenedModal.style.display = 'none';
      };
    }

    // 탭 버튼 이벤트 (openTime은 전역 상태 window.globalOpenTime 사용)
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.onclick = function() {
        const pageType = this.dataset.page;
        
        // 수강신청 탭 접근 시 전역 타이머 확인
        if (pageType === 'register' && !window.globalOpenTime) {
          console.log('[INFO] register tab clicked but timer not set', { pageType: pageType, openTime: window.globalOpenTime });
          if (timerNotOpenedModal) {
            timerNotOpenedModal.style.display = 'flex';
          } else {
            alert('아직 수강신청이 열리지 않았습니다.\n왼쪽 메뉴에서 타이머를 설정한 후\n시간이 되면 접근해주세요.');
          }
          return; // 탭 전환 중단
        }

        document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
        this.classList.add('active');
        if (pageType === 'register') {
          localStorage.setItem('registerQueueRequired', 'true');
          mainFrame.src = tabMap[pageType] + '?t=' + Date.now(); // 강제 새로고침
        } else {
          mainFrame.src = tabMap[pageType];
        }
        mainFrame.style.height = '700px';
      }
    });

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

      // 전역 상태에 오픈 시간을 저장
      window.globalOpenTime = newOpenTime;

      // 타이머 설정 시 모달 닫기
      if (timerNotOpenedModal) timerNotOpenedModal.style.display = 'none';

      timerStatus.textContent = "남은 시간: 계산중...";
      if (registerBtn) {
        registerBtn.classList.add('disabled');
        registerBtn.style.opacity = 0.5;
      }

      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        const now2 = new Date();
        let diff = Math.floor((window.globalOpenTime - now2) / 1000);
        if (diff <= 0) {
          clearInterval(timerInterval);
          timerStatus.textContent = "수강신청이 열렸습니다!";
          if (registerBtn) {
            registerBtn.classList.remove('disabled');
            registerBtn.style.opacity = 1;
          }
        } else {
          const h = Math.floor(diff / 3600);
          const m = Math.floor((diff % 3600) / 60);
          const s = diff % 60;
          timerStatus.textContent = `남은 시간: ${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        }
      }, 500);
    };
    if (registerBtn) {
      registerBtn.classList.add('disabled');
      registerBtn.style.opacity = 0.5;
    }
  document.getElementById('reset-btn').onclick = function() {
      localStorage.removeItem('registerList');
      localStorage.removeItem('basketList');
      if (registerBtn) {
        registerBtn.classList.add('disabled');
        registerBtn.style.opacity = 0.5;
      }
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  const noticeBtnReset = document.querySelector('.tab-btn[data-page="notice"]');
  if (noticeBtnReset) noticeBtnReset.classList.add('active');
  if (mainFrame) {
    mainFrame.src = tabMap['notice'];
    mainFrame.style.height = '520px';
  }
      if (timerStatus) timerStatus.textContent = '초기화 완료!';
      setTimeout(()=>{ if (timerStatus) timerStatus.textContent = ''; }, 1500);
    };
    } catch (err) {
      console.error('[Init Error]', err);
    }
}