let trafficSimulationActive = false;
let trafficFailureRate = 100; // 트래픽 오류 발생 확률 (기본값: 100%)

function startTrafficSimulation() {
  trafficSimulationActive = true;
  document.getElementById('start-traffic-simulation').style.display = 'none';
  document.getElementById('stop-traffic-simulation').style.display = 'inline-block';
  console.log(`트래픽 시뮬레이션 시작 (오류 발생 확률: ${trafficFailureRate}%)`);

  // 서버 장애 시뮬레이션: 일정 시간 동안 요청 차단
  simulateServerFailure();
}

function stopTrafficSimulation() {
  trafficSimulationActive = false;
  document.getElementById('start-traffic-simulation').style.display = 'inline-block';
  document.getElementById('stop-traffic-simulation').style.display = 'none';
  console.log('트래픽 시뮬레이션 중지');
}

function showTrafficModal() {
  const modal = document.getElementById('traffic-modal');
  if (modal) {
    modal.style.display = 'flex';
    const closeButton = document.getElementById('traffic-modal-close-btn');
    closeButton.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }
}

function simulateServerFailure() {
  if (!trafficSimulationActive) return;

  // 트래픽 오류 발생 여부 결정
  const shouldFail = Math.random() * 100 < trafficFailureRate;

  if (shouldFail) {
    console.log('서버 장애 발생: 요청 차단 중');
    showTrafficModal();
  } else {
    console.log('서버 정상 작동');
  }

  setTimeout(() => {
    if (trafficSimulationActive) {
      simulateServerFailure(); // 반복적으로 장애를 시뮬레이션
    }
  }, 5000); // 5초마다 상태 확인
}

function setTrafficFailureRate(rate) {
  trafficFailureRate = rate;
  console.log(`트래픽 오류 발생 확률이 ${rate}%로 설정되었습니다.`);
}

// 버튼 이벤트 리스너 추가
document.getElementById('start-traffic-simulation').addEventListener('click', startTrafficSimulation);
document.getElementById('stop-traffic-simulation').addEventListener('click', stopTrafficSimulation);