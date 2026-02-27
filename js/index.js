document.addEventListener('DOMContentLoaded', function() {
	const tabMap = {
		notice: 'front/notice.html',
		subject: 'front/subject.html',
		basket: 'front/basket.html',
		register: 'front/register.html'
	};

	let timerInterval = null;
	window.globalOpenTime = null;

	// 학기 선택 변경 시 즉시 반영
	window.updateGradeSetting = function() {
		const semVal = document.getElementById('grade-select').value;
		localStorage.setItem('currentSemester', semVal);
		updateNavigation();
	};

	// 네비게이션 클릭
	document.querySelectorAll('.nav-menu li').forEach(li => {
		li.onclick = function() {
			const pageType = this.dataset.page;

// 학기 기반 예비수강 제한 체크
		if (pageType === 'basket') {
			const semester = localStorage.getItem('currentSemester') || '2';
			if (semester === '1') {
				document.getElementById('freshman-basket-modal').querySelector('.message').textContent = '1학기에는 예비수강신청 기능을 사용할수없습니다.';
					document.getElementById('freshman-basket-modal').style.display = 'flex';
					return;
				}
			}

			// 비활성화된 메뉴는 클릭 불가
			if (this.classList.contains('is-disabled')) {
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
		window.timerOpenTime = newOpenTime; // register.html에서 사용
		window.timerBasedRegistrationEnabled = true; // 타이머 기반 신청 활성화
		
		if (timerInterval) clearInterval(timerInterval);
		updateTimer();

		// register iframe으로 타이머 기반 신청 시간 전달
		try {
			const iframe = document.getElementById('main-frame');
			if (iframe && iframe.contentWindow) {
				iframe.contentWindow.initTimerBasedRegistration?.(newOpenTime);
			}
		} catch (e) {
			console.log('iframe communication failed');
		}
	};

	// 초기화
	document.getElementById('reset-btn').onclick = function() {
		localStorage.removeItem('registerList');
		localStorage.removeItem('basketList');
		window.globalOpenTime = null;
		window.timerOpenTime = null;
		window.timerBasedRegistrationEnabled = false;
		if (timerInterval) clearInterval(timerInterval);

		const timerDisplay = document.getElementById('timer-display');
		const timerStatus = document.getElementById('timer-status');
		if (timerDisplay) timerDisplay.textContent = '설정 필요';
		if (timerStatus) timerStatus.textContent = '';
	};

	// 네비게이션 업데이트 (학년에 따라 메뉴 활성/비활성화)
	function updateNavigation() {
		const grade = localStorage.getItem('userGrade') || '2';
		const semester = localStorage.getItem('currentSemester') || '2';
		const basketMenu = document.querySelector('[data-page="basket"]');

		// 예비수강은 1학기일 때만 제한
		if (semester === '1') {
			basketMenu.classList.add('is-disabled');
		} else {
			basketMenu.classList.remove('is-disabled');
		}
	}

	// 설정 저장
	window.saveSettings = function() {
		const queueEnabled = document.getElementById('queue-toggle').checked;
		// 현재 셀렉트는 학기를 선택하도록 UI가 되어 있다.
		const sem = document.getElementById('grade-select').value; // 1 or 2
		localStorage.setItem('queueEnabled', JSON.stringify(queueEnabled));
		// 이전에 저장된 userGrade는 건드리지 않음
		localStorage.setItem('currentSemester', sem);

		updateNavigation();
		
		// iframe으로 학기 변경 메시지 전달
		try {
			const iframe = document.getElementById('main-frame');
			if (iframe && iframe.contentWindow) {
				iframe.contentWindow.postMessage({type:'semester-changed', value: sem}, '*');
			}
		} catch (e) {}

		// 수강신청 페이지가 열려있으면 새로고침 (Tab-1 비활성화 반영)
		const currentPage = document.querySelector('.nav-menu li.is-active')?.getAttribute('data-page');
		if (currentPage === 'register') {
			const iframe = document.getElementById('main-frame');
			iframe.src = iframe.src; // iframe 새로고침
		}

		alert('설정이 저장되었습니다.');
		document.getElementById('settings-modal').style.display = 'none';
	};

	// 설정 로드
	function loadSettings() {
		const queueEnabled = JSON.parse(localStorage.getItem('queueEnabled') || 'false');
		const semester = localStorage.getItem('currentSemester') || '2';
	
		document.getElementById('queue-toggle').checked = queueEnabled;
		document.getElementById('grade-select').value = semester;
		// iframe에 학기 정보 전달
		try {
			const iframe = document.getElementById('main-frame');
			if (iframe && iframe.contentWindow) {
				iframe.contentWindow.postMessage({type:'semester-changed', value: semester}, '*');
			}
		} catch(e) {}

		// 직접 select 변경 시에도 즉시 반영
		document.getElementById('grade-select').onchange = function() {
			const semVal = this.value;
			localStorage.setItem('currentSemester', semVal);
			updateNavigation();
			try {
				const iframe = document.getElementById('main-frame');
				if (iframe && iframe.contentWindow) {
					iframe.contentWindow.postMessage({type:'semester-changed', value: semVal}, '*');
				}
			} catch(e) {}
		};
	}

	// 초기 설정 로드 및 네비게이션 업데이트
	loadSettings();
	updateNavigation();

	// 타이머 업데이트
	function updateTimer() {
		if (!window.globalOpenTime) return;
		const timerDisplay = document.getElementById('timer-display');
		const timerStatus = document.getElementById('timer-status');
		if (!timerDisplay || !timerStatus) return;

		const update = () => {
			const now = new Date();
			let diff = Math.floor((window.globalOpenTime - now) / 1000);

			if (diff <= 0) {
				clearInterval(timerInterval);
				timerDisplay.textContent = '00:00 (오픈됨)';
				timerStatus.textContent = '';
			} else {
				const h = Math.floor(diff / 3600);
				const m = Math.floor((diff % 3600) / 60);
				const s = diff % 60;
				timerDisplay.textContent = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
			}
		};

		update();
		timerInterval = setInterval(update, 500);
	}

	// 총 학점 업데이트
	function updateTotalCredit() {
		try {
			const elem = document.getElementById('total-credit');
			if (elem) {
				const registerList = JSON.parse(localStorage.getItem('registerList') || '[]');
				const totalCredit = registerList.reduce((sum, course) => sum + parseInt(course.credit, 10), 0);
				elem.textContent = totalCredit;
			}
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

	// 저장된 설정 로드
	function loadSettings() {
		const trafficEnabled = localStorage.getItem('autoTrafficSimulation') === 'true';
		const trafficToggle = document.getElementById('traffic-toggle');
		if (trafficToggle) {
			trafficToggle.checked = trafficEnabled;
		}
	}

	// 설정 저장
	window.saveSettings = function() {
		document.getElementById('settings-modal').style.display = 'none';
	};

	// 자동 정원 감소 토글
	window.toggleTrafficSimulation = function() {
		const trafficToggle = document.getElementById('traffic-toggle');
		const isEnabled = trafficToggle.checked;
		localStorage.setItem('autoTrafficSimulation', isEnabled ? 'true' : 'false');
		
		// iframe 내의 register 페이지에 상태 동기화
		try {
			const iframe = document.getElementById('main-frame');
			if (iframe && iframe.contentWindow) {
				if (isEnabled) {
					iframe.contentWindow.startAdvancedTrafficSimulation?.();
				} else {
					iframe.contentWindow.stopAdvancedTrafficSimulation?.();
				}
			}
		} catch (e) {
			console.log('iframe sync failed');
		}
	};

	// 설정 로드
	loadSettings();
});
