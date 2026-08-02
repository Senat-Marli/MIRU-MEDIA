(function(){
  const canvas = document.getElementById('hero-canvas');
  if(!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth/canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 7);

  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // ===== ЧАСТИЦЫ =====
  const palette = [ ... ];  // оставь как есть
  const particleCount = 1800;
  // ... весь код частиц оставь без изменений ...

  const cycle = 6.0;
  let globalTime = 0;

  function animate(){
    requestAnimationFrame(animate);
    globalTime += 0.016;
    const t = globalTime % cycle;
    // ... анимация частиц ...
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => { ... });
})();
