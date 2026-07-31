(function(){
  // Hero video autoplay fix for mobile browsers
  const heroVideo = document.querySelector('.hero-video');
  if(heroVideo){
    heroVideo.play().catch(()=>{});
  }
})();

