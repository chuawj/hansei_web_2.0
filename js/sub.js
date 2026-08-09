let allSubjects = [];
let currentSearchType = '1';

if (typeof subjects !== 'undefined' && Array.isArray(subjects)) {
  allSubjects = subjects;
  console.log('allSubjects loaded:', allSubjects.length, 'items');
} else {
  console.error('subjects is not defined or not an array');
}

function initRadioFormSwitch() {
  const radios = document.querySelectorAll('input[name="pSearchType"]');
  radios.forEach(radio => {
    radio.addEventListener('change', function() {
      currentSearchType = this.value;
      switchSearchForm(this.value);
    });
  });
}

function switchSearchForm(searchType) {
  document.getElementById('idMajor').style.display = 'none';
  document.getElementById('idIsu').style.display = 'none';
  document.getElementById('idMultiple').style.display = 'none';
  document.getElementById('idSearch').style.display = 'none';

  console.log('[switchSearchForm] searchType:', searchType);
  switch(searchType) {
    case '1':
      document.getElementById('idMajor').style.display = 'block';
      break;
    case '2':
      document.getElementById('idIsu').style.display = 'block';
      fnComboMajorFilter('2');
      break;
    case '3':
      document.getElementById('idMultiple').style.display = 'block';
      fnComboMajorFilter('3');
      break;
    case '0':
      document.getElementById('idSearch').style.display = 'block';
      break;
  }
}

document.querySelectorAll('.sw-tabs li').forEach(li => {
  li.onclick = function() {
    const tabId = this.dataset.tab;
    document.querySelectorAll('.sw-tabs li').forEach(l => l.classList.remove('is-active'));
    document.querySelectorAll('.sw-tab-contents > div').forEach(d => d.classList.remove('is-active'));
    this.classList.add('is-active');
    document.getElementById(tabId).classList.add('is-active');
    
    if (tabId === 'tab-2') renderBasketListInTab2();
    if (tabId === 'tab-3') renderRegisterListInTab3();
  };
});

function initDepts1() {
  const select = document.getElementById('pSustCd1');
  if (!select) {
    console.error('[initDepts1] pSustCd1 select이 없음!');
    return;
  }
  
  select.innerHTML = '';
  const depts = [...new Set(allSubjects.map(s => s.dept).filter(d => d && String(d).trim()))].sort();
  
  depts.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    select.appendChild(opt);
  });

  console.log('[initDepts1] pSustCd1 옵션 추가됨:', depts.length);

  if (select.options.length > 0) {
    select.value = select.options[0].value;
    console.log('[initDepts1] pSustCd1 초기값 설정:', select.options[0].value);
    
    select.addEventListener('change', function() {
      console.log('[pSustCd1 change event] value:', this.value);
      fnComboMajorFilter('1');
    });
    
    console.log('[initDepts1] fnComboMajorFilter(1) 호출');
    fnComboMajorFilter('1');
  }
}

function fnComboMajorFilter(type) {
  console.log('[fnComboMajorFilter] type:', type);
  
  if (type === '1') {
    const deptSelect = document.getElementById('pSustCd1');
    const majorSelect = document.getElementById('pMajorCd1');
    const deptValue = deptSelect?.value;
    
    console.log('[fnComboMajorFilter-1] deptValue:', deptValue);
    
    majorSelect.innerHTML = '<option value="">전체학과</option>';
    
    if (deptValue) {
      const majors = [...new Set(allSubjects.filter(s => s.dept === deptValue).map(s => s.major).filter(m => m && String(m).trim()))].sort();
      console.log('[fnComboMajorFilter-1] majors:', majors);
      majors.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        majorSelect.appendChild(opt);
      });
    }
  }
  
  if (type === '2') {
    const deptSelect = document.getElementById('pSustCd2');
    const majorSelect = document.getElementById('pMajorCd2');
    const deptValue = deptSelect?.value;
    
    console.log('[fnComboMajorFilter-2] deptValue:', deptValue);
    
    if (!majorSelect) {
      console.error('[fnComboMajorFilter-2] majorSelect(pMajorCd2)이 없음!');
      return;
    }
    
    majorSelect.innerHTML = '<option value="">전체학과</option>';
    
    if (deptValue) {
      const majors = [...new Set(allSubjects.filter(s => s.dept === deptValue).map(s => s.major).filter(m => m && String(m).trim()))].sort();
      console.log('[fnComboMajorFilter-2] majors:', majors);
      majors.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        majorSelect.appendChild(opt);
      });
    }
  }
  
  if (type === '3') {
    const deptSelect = document.getElementById('pSustCd3');
    const majorSelect = document.getElementById('pMajorCd3');
    const deptValue = deptSelect?.value;
    
    console.log('[fnComboMajorFilter-3] deptValue:', deptValue);
    
    if (!majorSelect) {
      console.error('[fnComboMajorFilter-3] majorSelect(pMajorCd3)이 없음!');
      return;
    }
    
    majorSelect.innerHTML = '<option value="">전체학과</option>';
    
    if (deptValue) {
      const majors = [...new Set(allSubjects.filter(s => s.dept === deptValue).map(s => s.major).filter(m => m && String(m).trim()))].sort();
      console.log('[fnComboMajorFilter-3] majors:', majors);
      majors.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        majorSelect.appendChild(opt);
      });
    }
  }
}

function filterCourses(searchType) {
  console.log('[filterCourses] searchType:', searchType);
  let filtered = [];

  if (searchType === '1') {
    const dept = document.getElementById('pSustCd1')?.value || '';
    const major = document.getElementById('pMajorCd1')?.value || '';
    const lectName = document.getElementById('pLectNm1')?.value || '';
    
    filtered = allSubjects.filter(s => {
      return (dept === '' || s.dept === dept) &&
             (major === '' || s.major === major) &&
             (lectName === '' || s.lectName.includes(lectName));
    });
  } else if (searchType === '2') {
    const isuCd = document.getElementById('pIsuCd2')?.value || '';
    const dept = document.getElementById('pSustCd2')?.value || '';
    const major = document.getElementById('pMajorCd2')?.value || '';
    const lectName = document.getElementById('pLectNm2')?.value || '';
    
    filtered = allSubjects.filter(s => {
      return (isuCd === '' || s.type === isuCd) &&
             (dept === '' || s.dept === dept) &&
             (major === '' || s.major === major) &&
             (lectName === '' || s.lectName.includes(lectName));
    });
  } else if (searchType === '3') {
    const multi = document.getElementById('pMultiCd3')?.value || '';
    const dept = document.getElementById('pSustCd3')?.value || '';
    const major = document.getElementById('pMajorCd3')?.value || '';
    const lectName = document.getElementById('pLectNm3')?.value || '';
    
    filtered = allSubjects.filter(s => {
      return (multi === '' || s.dept === multi) &&
             (dept === '' || s.dept === dept) &&
             (major === '' || s.major === major) &&
             (lectName === '' || s.lectName.includes(lectName));
    });
  } else if (searchType === '0') {
    const lectName = document.getElementById('pLectNm0')?.value || '';
    filtered = allSubjects.filter(s => lectName === '' || s.lectName.includes(lectName) || s.lectCode.includes(lectName));
  }

  console.log('[filterCourses] filtered results:', filtered.length);
  renderCourseTable(filtered);
}

function renderCourseTable(courses) {
  const tbody = document.getElementById('course-table');
  const totalCount = document.getElementById('total-count');
  
  tbody.innerHTML = '';
  totalCount.textContent = courses.length;

  if (courses.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; color:#999; padding: 20px;">조회 결과가 없습니다.</td></tr>';
    return;
  }

  courses.forEach(course => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${course.course || ''}</td>
      <td>${course.dept || ''}</td>
      <td>${course.major || ''}</td>
      <td>${course.lectName || ''}</td>
      <td><span style="cursor: pointer; color: #1976d2;">${course.lectCode || ''}</span></td>
      <td>${course.type || ''}</td>
      <td>${course.credit || ''}</td>
      <td>${course.enrolledCount || '0'}</td>
      <td>${course.capacity || ''}</td>
      <td>${course.professor || ''}</td>
    `;
    tbody.appendChild(row);
  });
}

function renderBasketListInTab2() {
  const tbody = document.getElementById('basket-table');
  const creditCount = document.getElementById('basket-credit');
  const courseCount = document.getElementById('basket-count');
  
  tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; color:#999; padding: 20px;">예비수강이 없습니다.</td></tr>';
  creditCount.textContent = '0';
  courseCount.textContent = '0';
}

function renderRegisterListInTab3() {
  const tbody = document.getElementById('register-table');
  const creditCount = document.getElementById('register-credit');
  const courseCount = document.getElementById('register-count');
  
  tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; color:#999; padding: 20px;">수강신청이 없습니다.</td></tr>';
  creditCount.textContent = '0';
  courseCount.textContent = '0';
}

window.addEventListener('DOMContentLoaded', function() {
  initRadioFormSwitch();
  initDepts1();
  
  // 초기 학부 콤보박스 설정
  const isuSelect = document.getElementById('pSustCd2');
  if (isuSelect) {
    isuSelect.innerHTML = '';
    const depts = [...new Set(allSubjects.map(s => s.dept).filter(d => d && String(d).trim()))].sort();
    depts.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      isuSelect.appendChild(opt);
    });
    
    isuSelect.addEventListener('change', function() {
      fnComboMajorFilter('2');
    });
  }
  
  const multiSelect = document.getElementById('pSustCd3');
  if (multiSelect) {
    multiSelect.innerHTML = '';
    const depts = [...new Set(allSubjects.map(s => s.dept).filter(d => d && String(d).trim()))].sort();
    depts.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      multiSelect.appendChild(opt);
    });
    
    multiSelect.addEventListener('change', function() {
      fnComboMajorFilter('3');
    });
  }
  
  const multiSelect2 = document.getElementById('pMultiCd3');
  if (multiSelect2) {
    multiSelect2.innerHTML = '';
    const multis = [...new Set(allSubjects.map(s => s.multi).filter(m => m && String(m).trim()))].sort();
    multis.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      multiSelect2.appendChild(opt);
    });
  }
});
