
 (function(){
  const canvas = document.getElementById('about-canvas');
  if(!canvas) return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth/canvas.clientHeight, 0.1, 100);
  camera.position.set(0,0,7);

  const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

  scene.add(new THREE.AmbientLight(0xffffff,0.7));
  const d = new THREE.DirectionalLight(0xffffff,0.9); d.position.set(5,5,5); scene.add(d);
  const f = new THREE.DirectionalLight(0xffcccc,0.5); f.position.set(-5,0,5); scene.add(f);

  const crane = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({color:0xE63946, roughness:0.45, metalness:0.08, side:THREE.DoubleSide, flatShading:true});

  const body = new THREE.Mesh(new THREE.ConeGeometry(0.95,2.1,4), mat);
  body.rotation.y = Math.PI/4; body.rotation.z = Math.PI/6; crane.add(body);

  const wGeo = new THREE.BufferGeometry();
  wGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    0,0.4,0, -2.1,1.0,-0.4, -2.1,-0.2,0.4,
    0,0.4,0, -2.1,-0.2,0.4, 0,-0.4,0.2
  ]),3));
  wGeo.computeVertexNormals();
  const wL = new THREE.Mesh(wGeo, mat); crane.add(wL);
  const wR = wL.clone(); wR.scale.x = -1; crane.add(wR);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11,0.18,0.95,6), mat);
  neck.position.set(0.48,1.0,0.24); neck.rotation.z = -Math.PI/4; crane.add(neck);

  const head = new THREE.Mesh(new THREE.ConeGeometry(0.16,0.48,4), mat);
  head.position.set(0.72,1.42,0.34); head.rotation.z = -Math.PI/3; crane.add(head);

  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.22,1.2,4), mat);
  tail.position.set(-0.65,-0.38,-0.14); tail.rotation.z = Math.PI/2.5; crane.add(tail);

  scene.add(crane);

  let t=0;
  function animate(){
    requestAnimationFrame(animate); t+=0.007;
    crane.rotation.y = t*0.45;
    crane.position.y = Math.sin(t)*0.1;
    renderer.render(scene,camera);
  }
  animate();

  if(typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined'){
    gsap.registerPlugin(ScrollTrigger);
    gsap.from(crane.position, {x:-3, duration:1.4, ease:"power3.out",
      scrollTrigger:{trigger:"#about", start:"top 80%", toggleActions:"play none none reverse"}});
    gsap.from(".about-text-wrap h2, .about-text-wrap p", {y:40, opacity:0, duration:0.9, stagger:0.15, ease:"power2.out",
      scrollTrigger:{trigger:"#about", start:"top 75%", toggleActions:"play none none reverse"}});

    gsap.from(".services-title, .services-quote-mark, .services-quote, .services-left .btn", {
      x:-40, opacity:0, duration:1, stagger:0.12, ease:"power3.out",
      scrollTrigger:{trigger:"#services", start:"top 75%", toggleActions:"play none none reverse"}
    });
    gsap.from(".service-category", {
      x:40, opacity:0, duration:0.9, stagger:0.15, ease:"power2.out",
      scrollTrigger:{trigger:"#services", start:"top 70%", toggleActions:"play none none reverse"}
    });
    gsap.from(".cases-title, .cases-filters", {
      y:40, opacity:0, duration:1, stagger:0.15, ease:"power3.out",
      scrollTrigger:{trigger:"#cases", start:"top 80%", toggleActions:"play none none reverse"}
    });
    gsap.from(".case-card", {
      y:60, opacity:0, duration:0.8, stagger:0.1, ease:"power2.out",
      scrollTrigger:{trigger:".cases-grid", start:"top 85%", toggleActions:"play none none reverse"}
    });
    gsap.from(".process-header, .process-item", {
      y:40, opacity:0, duration:0.9, stagger:0.12, ease:"power2.out",
      scrollTrigger:{trigger:"#process", start:"top 80%", toggleActions:"play none none reverse"}
    });
  }

  window.addEventListener('resize',()=>{
    camera.aspect = canvas.clientWidth/canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth,canvas.clientHeight);
  });
})();'''

with open('/mnt/agents/output/about-3d.js', 'w', encoding='utf-8') as f:
    f.write(about_3d_js)
print("js/about-3d.js сохранён")
