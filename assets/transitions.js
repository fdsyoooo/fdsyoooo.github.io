// Плавный вход при загрузке
document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.add('vt-enter');
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('vt-enter');
    });
  });
  
  // Перехват кликов по внутренним ссылкам с .vt-link
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a.vt-link');
    if (!a) return;
  
    // внешние/особые ссылки пропускаем
    const sameOrigin = a.origin === location.origin;
    const newTab = a.target === '_blank' || a.hasAttribute('download') || a.hasAttribute('data-novt');
    const special = a.protocol === 'mailto:' || a.protocol === 'tel:';
    if (!sameOrigin || newTab || special) return;
  
    e.preventDefault();
    document.documentElement.classList.add('vt-leave');
    setTimeout(() => { location.href = a.href; }, 300); // под длину transition
  });
  