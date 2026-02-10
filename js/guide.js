(function(){
  'use strict';

  function $(sel, root=document) { return root.querySelector(sel); }

  function createEl(tag, className) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    return el;
  }

  function Tour(steps) {
    this.steps = steps || [];
    this.index = -1;
    this.overlay = null;
    this.tooltip = null;
    this.ring = null;
  }

  Tour.prototype.start = function() {
    if (!this.steps || !this.steps.length) return;
    this.build();
    this.next();
  };

  Tour.prototype.build = function() {
    if (this.overlay) return;
    this.overlay = createEl('div','guide-overlay');
    document.body.appendChild(this.overlay);

    this.ring = createEl('div','guide-highlight-ring');
    document.body.appendChild(this.ring);

    this.tooltip = createEl('div','guide-tooltip');
    this.tooltip.innerHTML = '<div class="title"></div><div class="desc"></div><div class="actions"></div>';
    document.body.appendChild(this.tooltip);

    this.overlay.addEventListener('click', ()=> this.end());
  };

  Tour.prototype.showStep = function(i) {
    if (i < 0 || i >= this.steps.length) return this.end();
    this.index = i;
    const s = this.steps[i];
    try { if (s.onShow) s.onShow(); } catch(e) { console.warn(e); }

    const titleEl = this.tooltip.querySelector('.title');
    const descEl = this.tooltip.querySelector('.desc');
    const actionsEl = this.tooltip.querySelector('.actions');
    titleEl.textContent = s.title || '';
    descEl.textContent = s.text || '';
    actionsEl.innerHTML = '';

    const btnClose = createEl('button','btn secondary'); btnClose.textContent = '닫기';
    btnClose.classList.add('secondary'); btnClose.onclick = ()=> this.end();
    const btnPrev = createEl('button','btn secondary'); btnPrev.textContent = '이전'; btnPrev.onclick = ()=> this.prev();
    const btnNext = createEl('button','btn'); btnNext.textContent = (i === this.steps.length-1) ? '완료' : '다음';
    btnNext.onclick = ()=> { try{ if (s.onNext) s.onNext(); } catch(e){}; this.next(); };

    if (i>0) actionsEl.appendChild(btnPrev);
    actionsEl.appendChild(btnClose);
    actionsEl.appendChild(btnNext);

    const target = s.selector ? document.querySelector(s.selector) : null;
    if (target) {
      const rect = target.getBoundingClientRect();
      this.ring.style.display = '';
      this.ring.style.left = (rect.left - 8 + window.scrollX) + 'px';
      this.ring.style.top = (rect.top - 8 + window.scrollY) + 'px';
      this.ring.style.width = (rect.width + 16) + 'px';
      this.ring.style.height = (rect.height + 16) + 'px';

      const ttWidth = 360;
      const ttHeight = 240;
      const padding = 16;
      
      let left = rect.right + padding + window.scrollX;
      let top = rect.top + window.scrollY;
      
      if (left + ttWidth + padding > window.innerWidth) {
        left = rect.left - ttWidth - padding + window.scrollX;
      }
      if (left < padding) {
        left = padding;
      }
      
      if (top + ttHeight > window.innerHeight + window.scrollY) {
        top = Math.max(padding, window.innerHeight + window.scrollY - ttHeight - padding);
      }
      
      this.tooltip.style.left = left + 'px';
      this.tooltip.style.top = top + 'px';
    } else {
      this.ring.style.display = 'none';
      this.tooltip.style.left = Math.max(12, (window.innerWidth - 360) / 2) + 'px';
      this.tooltip.style.top = Math.max(80, (window.innerHeight - 240) / 2) + 'px';
    }
  };

  Tour.prototype.next = function() { this.showStep(this.index + 1); };
  Tour.prototype.prev = function() { this.showStep(this.index - 1); };

  Tour.prototype.end = function() {
    if (this.overlay) this.overlay.remove();
    if (this.tooltip) this.tooltip.remove();
    if (this.ring) this.ring.remove();
    this.overlay = null; this.tooltip = null; this.ring = null; this.index = -1;
  };

  const steps = [
    { selector: null, title: '🎓 수강신청 시스템 안내', text: '한세대학교 수강신청 연습 시스템에 오신 것을 환영합니다! 이 투어에서 각 기능들을 차근차근 안내해 드리겠습니다.',
      onNext: function(){} },
    { selector: '#timer-setup', title: '⏱️ 오픈 타이머 설정', text: '먼저 수강신청 시각을 설정합니다. 시간, 분, 초를 입력하세요. 입력한 시간 후에 타이머가 열립니다.',
      onNext: function(){} },
    { selector: '#set-timer-btn', title: '🚀 타이머 시작하기', text: '"설정" 버튼을 누르면 입력한 시간만큼 카운트다운이 시작됩니다. 수강신청 탭은 타이머가 열리기 전까지 접근이 제한됩니다.',
      onNext: function(){} },
    { selector: '#queue-toggle', title: '⏳ 대기열 설정', text: '대기열 체크박스를 켜면 수강신청 대기 상황을 시뮬레이션할 수 있습니다. 켜진 상태에서 대기열 순위를 선택해 보세요!',
      onNext: function(){ const toggle = document.getElementById('queue-toggle'); if(toggle && !toggle.checked) toggle.click(); } },
    { selector: '#queue-select', title: '🔢 대기열 순위 선택', text: '1순위~5순위까지 다양한 대기 상황을 선택할 수 있습니다. 각 순위마다 수강신청 경험이 달라집니다.',
      onNext: function(){} },
    { selector: 'input[name="semester"]', title: '📅 학기 선택', text: '학기를 선택하세요. 1학기는 정규 수강신청만 가능하며, 2학기는 예비수강신청도 사용할 수 있습니다.',
      onNext: function(){} },
    { selector: '.tab-btn[data-page="subject"]', title: '📚 교과목조회 탭', text: '교과목을 학부, 학과, 이수구분 등으로 조회할 수 있습니다. 이 탭을 눌러 교과목 조회 페이지로 이동해 보세요.',
      onNext: function(){ const el = document.querySelector('.tab-btn[data-page="subject"]'); if(el) el.click(); } },
    { selector: '.tab-btn[data-page="basket"]', title: '🗂️ 예비수강신청 탭', text: '(2학기만 가능) 예비로 신청해 둘 수 있는 탭입니다. 목록에서 과목을 찾아 예비 신청을 해보세요.',
      onNext: function(){ const el = document.querySelector('.tab-btn[data-page="basket"]'); if(el) el.click(); } },
    { selector: '.tab-btn[data-page="register"]', title: '✍️ 수강신청 탭', text: '실제로 수강을 신청하는 탭입니다. 타이머가 열려 있어야 접근할 수 있습니다.',
      onShow: function(){} },
    { selector: '#main-frame', title: '💡 내부 페이지 사용법', text: '각 탭을 열면 오른쪽 영역에 해당 페이지가 표시됩니다. 교과목조회에서는 이수구분, 학부/학과, 과목명을 이용해 필터링할 수 있습니다.' }
  ];

  const tour = new Tour(steps);

  window.addEventListener('DOMContentLoaded', function(){
    const btn = document.getElementById('start-tour-btn');
    if (!btn) return;
    btn.addEventListener('click', function(){
      try { tour.start(); } catch(e){ console.error(e); }
    });
  });

})();
