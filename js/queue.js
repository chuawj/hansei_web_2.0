
const QueueModal = {
  updateQueueEnabled() {
    if(localStorage.getItem('queueEnabled')!==null) {
      this.enabled = localStorage.getItem('queueEnabled')==='true';
    } else {
      this.enabled = true;
    }
  },
  enabled: true,
  showEnter(callback) {
    this.updateQueueEnabled();
    if(!this.enabled) { callback(); return; }
    const queueModal = document.getElementById('queue-modal');
    const queueMsg = document.getElementById('queue-msg');
    const queueWait = document.getElementById('queue-wait');
    const waitNum = Math.floor(Math.random()*100)+1;
    const waitSec = Math.max(2, Math.min(10, Math.round(2 + (waitNum/100)*8)));
    queueMsg.textContent = `현재 ${waitNum}명이 대기중입니다.`;
    let remain = waitSec;
    queueWait.textContent = `잠시만 기다려주세요... (${remain}초)`;
    queueModal.style.display = 'flex';
    const interval = setInterval(()=>{
      remain--;
      queueWait.textContent = `잠시만 기다려주세요... (${remain}초)`;
    }, 1000);
    setTimeout(()=>{
      clearInterval(interval);
      queueModal.style.display = 'none';
      callback();
    }, waitSec*1000);
  },
  showApply(callback) {
    this.updateQueueEnabled();
    if(!this.enabled) { callback(); return; }
    const queueModal = document.getElementById('queue-modal');
    const queueMsg = document.getElementById('queue-msg');
    const queueWait = document.getElementById('queue-wait');
    const waitNum = Math.floor(Math.random()*100)+1;
    const waitSec = Math.max(1, Math.min(10, Math.round(1 + (waitNum/100)*9)));
    queueMsg.textContent = `신청 대기: 앞에 ${waitNum}명이 신청중입니다.`;
    let remain = waitSec;
    queueWait.textContent = `잠시만 기다려주세요... (${remain}초)`;
    queueModal.style.display = 'flex';
    const interval = setInterval(()=>{
      remain--;
      queueWait.textContent = `잠시만 기다려주세요... (${remain}초)`;
    }, 1000);
    setTimeout(()=>{
      clearInterval(interval);
      queueModal.style.display = 'none';
      callback();
    }, waitSec*1000);
  }
};

window.addEventListener('storage', function(e) {
  if(e.key === 'queueEnabled') {
    QueueModal.updateQueueEnabled();
  }
});
