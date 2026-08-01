(function(){
  const video = document.getElementById('about-video');
  if(!video) return;

  let scrollTimeout;
  let isVisible = false;

  // Следим, попала ли секция в экран
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
      if(isVisible){
        video.play().catch(()=>{});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(document.getElementById('about'));

  // Пока скроллим — летит, остановился — замирает
  window.addEventListener('scroll', () => {
    if(!isVisible) return;
    video.play().catch(()=>{});
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      video.pause();
    }, 150);
  }, { passive: true });
})();
