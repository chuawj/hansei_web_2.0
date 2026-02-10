window.onload = function() {
  function disableBasketUI(showToast) {
    if (showToast && typeof Toast !== 'undefined') Toast.show('1학년 1학기에는 예비수강신청 기능을 사용할 수 없습니다.');
    document.querySelectorAll('select, input, button').forEach(el => {
      if (el.id !== 'toast') {
        el.disabled = true;
        el.style.opacity = '0.5';
        el.style.cursor = 'not-allowed';
      }
    });
    document.querySelectorAll('table').forEach(table => {
      table.style.opacity = '0.5';
      table.style.pointerEvents = 'none';
    });
  }

  function enableBasketUI() {
    try { const t = document.getElementById('toast'); if (t) { t.classList.remove('show'); t.textContent = ''; } } catch(e){}
    document.querySelectorAll('select, input, button').forEach(el => {
      if (el.id !== 'toast') {
        el.disabled = false;
        el.style.opacity = '';
        el.style.cursor = '';
      }
    });
    document.querySelectorAll('table').forEach(table => {
      table.style.opacity = '';
      table.style.pointerEvents = '';
    });
  }

  let initialized = false;
  function initBasket() {
    if (initialized) return; initialized = true;

    const categorySelect = document.getElementById('category-select');
    const deptSelect = document.getElementById('dept-select');
    const majorSelect = document.getElementById('major-select');
    const typeSelect = document.getElementById('type-select');
    const majorArea = document.getElementById('major-area');
    let currentTypeValue = '';

    function updateDeptOptions() {
      deptSelect.innerHTML = '';
      (categoryData||[]).forEach(cat => {
        (cat.depts||[]).forEach(d => {
          const opt = document.createElement('option');
          opt.value = d.name; opt.textContent = d.name;
          deptSelect.appendChild(opt);
        });
      });
      updateMajorOptions();
      try { const tf = currentTypeValue || (typeSelect ? (typeSelect.value||'') : ''); fillSubjectNameSelect((deptSelect||{}).value || '', (majorSelect||{}).value || '', tf); } catch(e) {}
    }
    function updateMajorOptions() {
      majorSelect.innerHTML = '';
      let found = false;
      (categoryData||[]).forEach(cat => {
        (cat.depts||[]).forEach(d => {
          if (d.name === deptSelect.value) {
            (d.majors||[]).forEach(m => {
              const opt = document.createElement('option'); opt.value = m; opt.textContent = m; majorSelect.appendChild(opt);
            });
            found = true;
          }
        });
      });
      if (!found) {
        const opt = document.createElement('option'); opt.value = ''; opt.textContent = '전체'; majorSelect.appendChild(opt);
      }
    }
    deptSelect.onchange = function() { updateMajorOptions(); try { const tf = currentTypeValue || (typeSelect ? (typeSelect.value||'') : ''); fillSubjectNameSelect((deptSelect||{}).value || '', (majorSelect||{}).value || '', tf); } catch(e){} };
    majorSelect.onchange = function() { try { const tf = currentTypeValue || (typeSelect ? (typeSelect.value||'') : ''); fillSubjectNameSelect((deptSelect||{}).value || '', (majorSelect||{}).value || '', tf); } catch(e){} };
    updateDeptOptions();

    function populateTypeOptions() {
      typeSelect.innerHTML = '';
      const preferred = ['전공필수','전공선택','전공기초','교양필수','교양선택','채플','연계필수','연계선택'];
      const typesSet = new Set((subjects||[]).map(s => s.type).filter(Boolean));
      const types = Array.from(typesSet);
      const optAll = document.createElement('option'); optAll.value = ''; optAll.textContent = '전체'; typeSelect.appendChild(optAll);
      preferred.forEach(p => {
        if (typesSet.has(p)) {
          const opt = document.createElement('option'); opt.value = p; opt.textContent = p; typeSelect.appendChild(opt);
          const idx = types.indexOf(p); if (idx !== -1) types.splice(idx,1);
          typesSet.delete(p);
        }
      });
      types.sort();
      types.forEach(t => { const opt = document.createElement('option'); opt.value = t; opt.textContent = t; typeSelect.appendChild(opt); });
    }
    populateTypeOptions();

    const typeButtonsContainer = document.getElementById('type-buttons');
    const typeButtonEls = document.querySelectorAll('.type-button');

    if (typeButtonEls && typeButtonEls.length) {
      typeButtonEls.forEach(btn => {
        btn.addEventListener('click', function() {
          typeButtonEls.forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          const v = this.dataset.value || '';
          currentTypeValue = v;
          if (typeSelect) {
            typeSelect.value = v;
            typeSelect.dispatchEvent(new Event('change'));
          } else {
            const isMajorType = ['전공필수','전공선택','전공기초'].includes(v);
            const isGeneralType = ['교양필수','교양선택'].includes(v);
            if (majorArea) majorArea.style.display = isMajorType ? '' : 'none';
            const nameSelect = document.getElementById('subject-name-select');
            if (nameSelect) nameSelect.style.display = (isMajorType || isGeneralType) ? '' : 'none';
            if (isMajorType) updateDeptOptions();
            if (isGeneralType) {
              try { fillSubjectNameSelect('', '', v); } catch(e) {}
            }
          }
        });
      });
    }

    if (typeSelect) {
      typeSelect.onchange = function() {
        const val = typeSelect.value || '';
        currentTypeValue = val;
        const isMajorType = ['전공필수','전공선택','전공기초'].includes(val);
        const isGeneralType = ['교양필수','교양선택'].includes(val);
        if (majorArea) majorArea.style.display = isMajorType ? '' : 'none';
        const nameSelect = document.getElementById('subject-name-select');
        if (nameSelect) nameSelect.style.display = (isMajorType || isGeneralType) ? '' : 'none';
        if (isMajorType) updateDeptOptions();
        if (isGeneralType) {
          try { fillSubjectNameSelect('', '', val); } catch(e) {}
        }
        if (typeButtonEls && typeButtonEls.length) typeButtonEls.forEach(b=>b.classList.remove('active'));
      };
    }

    function fillSubjectListSelect() {
      const select = document.getElementById('subject-list-select'); if(!select) return;
      select.innerHTML = '';
      const nameSelect = document.getElementById('subject-name-select'); if (nameSelect) nameSelect.innerHTML = '';
      (subjects||[]).forEach(subj => {
        const opt = document.createElement('option'); opt.value = subj.code; opt.textContent = `${subj.name} [${subj.code}]`; select.appendChild(opt);
        if (nameSelect) {
          const opt2 = document.createElement('option'); opt2.value = subj.code; opt2.textContent = `${subj.name} [${subj.code}]`; nameSelect.appendChild(opt2);
        }
      });
    }

    function fillSubjectNameSelect(filterDept, filterMajor, filterType) {
      const nameSelect = document.getElementById('subject-name-select'); if (!nameSelect) return;
      nameSelect.innerHTML = '';
      const list = (subjects||[]).filter(s => {
        if (filterDept && filterDept !== '' && s.dept !== filterDept) return false;
        if (filterMajor && filterMajor !== '' && s.major !== filterMajor) return false;
        if (filterType && filterType !== '') {
          const tv = (filterType||'').toString().trim();
          if (((s.type||'').toString().trim() !== tv)) return false;
        }
        return true;
      });
      const allOpt = document.createElement('option'); allOpt.value = ''; allOpt.textContent = '전체'; nameSelect.appendChild(allOpt);
      list.forEach(subj => {
        const opt = document.createElement('option'); opt.value = subj.code; opt.textContent = `${subj.name} [${subj.code}]`; nameSelect.appendChild(opt);
      });
    }

    categorySelect.onchange = function() {
      const nameSelect = document.getElementById('subject-name-select');
      if (categorySelect.value === 'major') {
        majorArea.style.display = '';
        typeSelect.style.display = 'none';
        if (nameSelect) nameSelect.style.display = '';
        const sarea = document.getElementById('subject-search-area'); if (sarea) sarea.style.display = 'none';
        try { const tf = currentTypeValue || (typeSelect ? (typeSelect.value||'') : ''); fillSubjectNameSelect((deptSelect||{}).value || '', (majorSelect||{}).value || '', tf); } catch(e) {}
      } else if (categorySelect.value === 'subject') {
        majorArea.style.display = 'none';
        typeSelect.style.display = 'none';
        if (nameSelect) nameSelect.style.display = 'none';
        const sarea = document.getElementById('subject-search-area'); if (sarea) { sarea.style.display = 'inline-flex'; fillSubjectListSelect(); }
      } else if (categorySelect.value === 'type') {
        majorArea.style.display = 'none';
        typeSelect.style.display = '';
        if (nameSelect) nameSelect.style.display = 'none';
        const sarea = document.getElementById('subject-search-area'); if (sarea) sarea.style.display = 'none';
      }
    };
    categorySelect.dispatchEvent(new Event('change'));
    function renderTable() {
      let filtered = (subjects||[]);
      // DEBUG: 조회 시 필터 상태 확인
      try {
        const dbgCat = (categorySelect||{}).value || '';
        const dbgDept = (deptSelect||{}).value || '';
        const dbgMajor = (majorSelect||{}).value || '';
        const dbgSelectedName = (document.getElementById('subject-name-select')||{}).value || '';
        const dbgType = currentTypeValue || (typeSelect ? typeSelect.value : '');
        console.log('[DBG][basket] renderTable start', {category: dbgCat, dept: dbgDept, major: dbgMajor, selectedNameCode: dbgSelectedName, type: dbgType, totalSubjects: (subjects||[]).length});
      } catch(e) { console.warn('[DBG][basket] renderTable debug failed', e); }
      const cat = (categorySelect||{}).value || '';
      if (cat === 'major') {
        const dept = (deptSelect||{}).value || '';
        const major = (majorSelect||{}).value || '';
        filtered = filtered.filter(s => (!dept || s.dept === dept) && (!major || s.major === major));
        // subject-name-select의 값이 있으면 추가 필터링
        const selectedCode = (document.getElementById('subject-name-select')||{}).value || '';
        if (selectedCode) {
          filtered = filtered.filter(s => s.code === selectedCode);
        }
      } else if (cat === 'subject') {
        const codeInput = (document.getElementById('subject-code-input')||{}).value.trim() || '';
        const selectCode = (document.getElementById('subject-list-select')||{}).value || '';
        if (codeInput) filtered = (subjects||[]).filter(s => s.code.includes(codeInput));
        else if (selectCode) filtered = (subjects||[]).filter(s => s.code === selectCode);
        else filtered = subjects || [];
      } else if (cat === 'type') {
        const typeVal = currentTypeValue || (typeSelect ? typeSelect.value : '');
        if (typeVal) {
          const tv = (typeVal||'').toString().trim();
          filtered = filtered.filter(s => ((s.type||'').toString().trim() === tv));
        }
        if (['전공필수','전공선택','전공기초'].includes(typeVal)) {
          const dept = (deptSelect||{}).value || '';
          const major = (majorSelect||{}).value || '';
          if (dept) filtered = filtered.filter(s => s.dept === dept);
          if (major) filtered = filtered.filter(s => s.major === major);
        }
        // subject-name-select의 값이 있으면 추가 필터링 (교양 이수구분 포함)
        const selectedCode = (document.getElementById('subject-name-select')||{}).value || '';
        if (selectedCode) {
          filtered = filtered.filter(s => s.code === selectedCode);
        }
      }
      const tbody = document.getElementById('basket-list'); if(!tbody) return;
      tbody.innerHTML = '';
      console.log('[DBG][basket] renderTable filtered count:', filtered.length);
      filtered.forEach((s,i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${i+1}</td><td>${s.dept||''}</td><td>${s.major||''}</td><td>${s.year||''}</td><td>${s.name||''}</td><td>${s.code||''}</td><td>${s.type||''}</td><td>${s.credit||''}</td><td>${s.cap !== undefined ? s.cap : 30}</td><td><button class='btn apply'>신청</button></td>`;
        tr.querySelector('.apply').onclick = function() { addToBasket(s); };
        tbody.appendChild(tr);
      });
    }

    document.getElementById('search-btn').onclick = renderTable;

    const quickBtn = document.getElementById('quick-apply-btn');
    if (quickBtn) {
      quickBtn.onclick = function() {
        const raw = (document.getElementById('quick-code') || {}).value || ''; const val = raw.trim();
        const section = (document.getElementById('quick-section') || {}).value || '';
        if (!val) { if (window.Toast && Toast.show) Toast.show('과목코드를 입력하세요'); else alert('과목코드를 입력하세요'); return; }
        if (!section) { if (window.Toast && Toast.show) Toast.show('분반을 입력하세요 (예: 001)'); else alert('분반을 입력하세요 (예: 001)'); return; }
        if (section !== '001') { if (window.Toast && Toast.show) Toast.show("분반은 '001'로 입력해야 합니다."); else alert("분반은 '001'로 입력해야 합니다."); return; }
        const code = val.split('-')[0].toUpperCase(); const subj = (subjects||[]).find(s => (s.code||'').toUpperCase() === code);
        if (!subj) { if (window.Toast && Toast.show) Toast.show('과목을 찾을 수 없습니다'); else alert('과목을 찾을 수 없습니다'); return; }
        const newSubj = Object.assign({}, subj); newSubj.section = section;
        addToBasket(newSubj);
        if (window.Toast && Toast.show) Toast.show(`${subj.name} 예비신청 완료`); else alert(`${subj.name} 예비신청 완료`);
        (document.getElementById('quick-code') || {}).value = ''; (document.getElementById('quick-section') || {}).value = '';
      };
    }

    if (document.getElementById('subject-code-input')) document.getElementById('subject-code-input').onkeyup = function(e){};
    if (document.getElementById('subject-list-select')) document.getElementById('subject-list-select').onchange = function(){};
    if (document.getElementById('subject-name-select')) document.getElementById('subject-name-select').onchange = function(){};

    function getBasket() { return JSON.parse(localStorage.getItem('basketList')||'[]'); }
    function setBasket(list) { localStorage.setItem('basketList', JSON.stringify(list)); }
    function addToBasket(subject) { let list = getBasket(); if(list.find(s=>s.code===subject.code)) return; list.push(subject); setBasket(list); renderBasketTable(); }
    function removeFromBasket(code) { let list = getBasket(); list = list.filter(s=>s.code!==code); setBasket(list); renderBasketTable(); }
    function renderBasketTable() { const list = getBasket(); const tbody = document.querySelector('#my-basket tbody'); tbody.innerHTML = ''; list.forEach((s,i) => { const tr = document.createElement('tr'); tr.innerHTML = `<td>${i+1}</td><td>${s.dept||''}</td><td>${s.major||''}</td><td>${s.year||''}</td><td>${s.name||''}</td><td>${s.code||''}</td><td>${s.type||''}</td><td>${s.credit||''}</td><td>${s.cap !== undefined ? s.cap : 30}</td><td><button class='btn del'>삭제</button></td>`; tr.querySelector('.del').onclick = function() { removeFromBasket(s.code); }; tbody.appendChild(tr); }); }
    renderBasketTable();
  }

  const currentSemester = localStorage.getItem('currentSemester') || '2';
  if (currentSemester === '1') {
    disableBasketUI(true);
  } else {
    enableBasketUI();
    initBasket();
  }

    window.addEventListener('storage', function(e) {
      if (e.key === 'currentSemester') {
        if (e.newValue === '1') {
          disableBasketUI(true);
        } else {
          enableBasketUI();
          initBasket();
        }
      }
    });

  window.addEventListener('message', function(ev) {
    try {
      const d = ev.data || {};
      if (d && d.type === 'semester-changed') {
        if (String(d.value) === '1') {
          disableBasketUI(true);
        } else {
          enableBasketUI();
          initBasket();
        }
      }
    } catch (err) { }
  });
  };