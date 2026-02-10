(function(global){
  function showToast(msg) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(()=>{
      toast.classList.remove('show');
    }, 1800);
  }
  global.Toast = { show: showToast };
})(window);
