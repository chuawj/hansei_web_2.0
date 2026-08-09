window.toggleTrafficSimulation = window.toggleTrafficSimulation || function() {};
window.saveSettings = window.saveSettings || function() {};
window.updateGradeSetting = window.updateGradeSetting || function() {};
window.fnLoad = window.fnLoad || function() {};

document.addEventListener('DOMContentLoaded', function() {
	const navElement = document.querySelector('.nav');
	const btnMenu = document.querySelector('.nav .btn-menu');
	const isCollapsed = localStorage.getItem('navCollapsed') === 'true';

	if (isCollapsed && navElement) {
		navElement.classList.add('collapsed');
	}

	if (btnMenu) {
		btnMenu.onclick = function() {
			if (navElement && navElement.classList.contains('collapsed')) {
				navElement.classList.remove('collapsed');
				localStorage.setItem('navCollapsed', 'false');
			} else if (navElement) {
				navElement.classList.add('collapsed');
				localStorage.setItem('navCollapsed', 'true');
			}
		};
	}

	const tabMap = {
		notice: 'front/notice.html',
		subject: 'front/subject.html',
		basket: 'front/basket.html',
		register: 'front/register.html'
	};

	const pathMap = {
		'/p/c/notice': 'notice',
		'/p/c/searchMain': 'subject',
		'/p/b/basketMain': 'basket',
		'/p/s/sugangMain': 'register'
	};

	let timerInterval = null;
	window.globalOpenTime = null;

	window.fnLoad = function(path, pageNum) {
		const pageType = pathMap[path];
		if (!pageType) return;

		if (pageType === 'basket') {
			const semester = localStorage.getItem('currentSemester') || '2';
			if (semester === '1') {
				const freshmanModal = document.getElementById('freshman-basket-modal');
				if (freshmanModal) {
					const message = freshmanModal.querySelector('.message');
					if (message) message.textContent = '1학기에는 예비수강신청 기능을 사용할수없습니다.';
					freshmanModal.style.display = 'flex';
				}
				return;
			}
		}

		const activeItem = document.querySelector('[data-page="' + pageType + '"]');
		if (activeItem && activeItem.classList.contains('is-disabled')) {
			return;
		}

		document.querySelectorAll('.nav-menu li').forEach(l => l.classList.remove('is-active'));
		if (activeItem) {
			activeItem.classList.add('is-active');
		}

		const iframe = document.getElementById('main-frame');
		if (iframe) {
			iframe.src = tabMap[pageType];
		}
	};

	function updateHeaderSemesterText() {
		const semester = localStorage.getItem('currentSemester') || '2';
		const year = new Date().getFullYear();
		const headerSemester = document.querySelector('.header .is-left span:first-child');
		if (headerSemester) {
			headerSemester.textContent = `${year}년도 ${semester}학기`;
		}
	}

	function updateNavigation() {
		const semester = localStorage.getItem('currentSemester') || '2';
		let basketMenu = document.querySelector('[data-page="basket"]');
		if (!basketMenu) {
			basketMenu = document.querySelector('.nav-menu li:nth-child(3)');
		}

		if (!basketMenu) {
			console.warn('updateNavigation: basket menu element not found.');
			return;
		}

		if (semester === '1') {
			basketMenu.classList.add('is-disabled');
		} else {
			basketMenu.classList.remove('is-disabled');
		}
	}

	window.updateGradeSetting = function() {
		const semVal = document.getElementById('grade-select')?.value || '2';
		localStorage.setItem('currentSemester', semVal);
		updateNavigation();
		updateHeaderSemesterText();
		try {
			const iframe = document.getElementById('main-frame');
			if (iframe && iframe.contentWindow) {
				iframe.contentWindow.postMessage({ type: 'semester-changed', value: semVal }, '*');
			}
		} catch (e) {}
	};

	document.getElementById('set-timer-btn')?.addEventListener('click', function() {
		const hour = parseInt(document.getElementById('timer-hour')?.value, 10) || 0;
		const min = parseInt(document.getElementById('timer-min')?.value, 10) || 0;
		const sec = parseInt(document.getElementById('timer-sec')?.value, 10) || 0;

		const now = new Date();
		let openHour = now.getHours() + hour;
		let openMin = now.getMinutes() + min;
		let openSec = now.getSeconds() + sec;

		if (openSec >= 60) {
			openMin += Math.floor(openSec / 60);
			openSec %= 60;
		}
		if (openMin >= 60) {
			openHour += Math.floor(openMin / 60);
			openMin %= 60;
		}
		if (openHour >= 24) {
			openHour %= 24;
		}

		const newOpenTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), openHour, openMin, openSec);
		if (newOpenTime <= now) {
			newOpenTime.setDate(newOpenTime.getDate() + 1);
		}

		window.globalOpenTime = newOpenTime;
		window.timerOpenTime = newOpenTime;
		window.timerBasedRegistrationEnabled = true;

		if (timerInterval) clearInterval(timerInterval);
		updateTimer();

		try {
			const iframe = document.getElementById('main-frame');
			if (iframe && iframe.contentWindow) {
				iframe.contentWindow.initTimerBasedRegistration?.(newOpenTime);
			}
		} catch (e) {
			console.log('iframe communication failed');
		}
	});

	document.getElementById('reset-btn')?.addEventListener('click', function() {
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
	});

	window.saveSettings = function() {
		const queueEnabled = document.getElementById('queue-toggle')?.checked || false;
		const sem = document.getElementById('grade-select')?.value || '2';
		localStorage.setItem('queueEnabled', JSON.stringify(queueEnabled));
		localStorage.setItem('currentSemester', sem);

		updateNavigation();
		updateHeaderSemesterText();

		try {
			const iframe = document.getElementById('main-frame');
			if (iframe && iframe.contentWindow) {
				iframe.contentWindow.postMessage({ type: 'semester-changed', value: sem }, '*');
			}
		} catch (e) {}

		const currentPage = document.querySelector('.nav-menu li.is-active')?.getAttribute('data-page');
		if (currentPage === 'register') {
			const iframe = document.getElementById('main-frame');
			if (iframe) iframe.src = iframe.src;
		}

		alert('설정이 저장되었습니다.');
		document.getElementById('settings-modal').style.display = 'none';
	};

	window.toggleTrafficSimulation = function() {
		const trafficToggle = document.getElementById('traffic-toggle');
		const isEnabled = trafficToggle?.checked || false;
		localStorage.setItem('autoTrafficSimulation', isEnabled ? 'true' : 'false');

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

	function initializeSettings() {
		const queueEnabled = JSON.parse(localStorage.getItem('queueEnabled') || 'false');
		const semester = localStorage.getItem('currentSemester') || '2';

		document.getElementById('queue-toggle').checked = queueEnabled;
		document.getElementById('grade-select').value = semester;
		updateNavigation();
		updateHeaderSemesterText();

		try {
			const iframe = document.getElementById('main-frame');
			if (iframe && iframe.contentWindow) {
				iframe.contentWindow.postMessage({ type: 'semester-changed', value: semester }, '*');
			}
		} catch (e) {}
	}

	function updateTimer() {
		if (!window.globalOpenTime) return;
		const timerDisplay = document.getElementById('timer-display');
		const timerStatus = document.getElementById('timer-status');
		if (!timerDisplay || !timerStatus) return;

		const update = function() {
			const now = new Date();
			let diff = Math.floor((window.globalOpenTime - now) / 1000);

			if (diff <= 0) {
				clearInterval(timerInterval);
				if (timerDisplay) timerDisplay.textContent = '00:00 (오픈됨)';
				if (timerStatus) timerStatus.textContent = '';
			} else {
				const h = Math.floor(diff / 3600);
				const m = Math.floor((diff % 3600) / 60);
				const s = diff % 60;
				if (timerDisplay) timerDisplay.textContent = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
			}
		};

		update();
		timerInterval = setInterval(update, 500);
	}

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

	function updateServerTime() {
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const date = String(now.getDate()).padStart(2, '0');
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		const seconds = String(now.getSeconds()).padStart(2, '0');
		const serverTime = document.getElementById('server-time');
		if (serverTime) {
			serverTime.textContent = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
		}
	}

	initializeSettings();
	updateServerTime();
	setInterval(updateServerTime, 1000);
	setInterval(updateTotalCredit, 500);
	updateTotalCredit();
});