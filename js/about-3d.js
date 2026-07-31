(function(){
  const canvas = document.getElementById('about-canvas');
  if(!canvas) return;
  
  const scene = new THREE.Scene();
  
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth/canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 8);

  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Свет
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const d = new THREE.DirectionalLight(0xffffff, 1.0); 
  d.position.set(5, 5, 5); 
  scene.add(d);
  const f = new THREE.DirectionalLight(0xffcccc, 0.4); 
  f.position.set(-5, 0, 5); 
  scene.add(f);
  const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
  backLight.position.set(0, 2, -5);
  scene.add(backLight);

  const crane = new THREE.Group();
  
  const mat = new THREE.MeshStandardMaterial({
    color: 0xE63946, 
    roughness: 0.35, 
    metalness: 0.1, 
    side: THREE.DoubleSide, 
    flatShading: true
  });

  // === ТЕЛО — ромбовидная пирамида (2 треугольника) ===
  const bodyGeo = new THREE.BufferGeometry();
  bodyGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    // Передняя грань
     0.0,  0.6,  0.0,   // верх
     0.7, -0.2,  0.3,   // право
    -0.7, -0.2,  0.3,   // лево
    // Задняя грань
     0.0,  0.6,  0.0,   // верх
    -0.7, -0.2, -0.3,   // лево-зад
     0.7, -0.2, -0.3,   // право-зад
    // Нижняя грань
     0.7, -0.2,  0.3,
    -0.7, -0.2, -0.3,
    -0.7, -0.2,  0.3,
    // Нижняя грань 2
     0.7, -0.2,  0.3,
     0.7, -0.2, -0.3,
    -0.7, -0.2, -0.3,
  ]), 3));
  bodyGeo.computeVertexNormals();
  const body = new THREE.Mesh(bodyGeo, mat);
  crane.add(body);

  // === ЛЕВОЕ КРЫЛО — большое острое (как на видео) ===
  const wingLGeo = new THREE.BufferGeometry();
  wingLGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
     0.0,  0.45,  0.0,   // к туловищу (верх)
    -2.8,  1.0,  -0.2,   // остриё крыла вверх
    -0.2, -0.1,   0.4,   // к туловищу (низ)
     0.0,  0.45,  0.0,
    -0.2, -0.1,   0.4,
    -2.8, -0.3,   0.2,   // остриё крыла вниз
  ]), 3));
  wingLGeo.computeVertexNormals();
  const wL = new THREE.Mesh(wingLGeo, mat);
  crane.add(wL);

  // === ПРАВОЕ КРЫЛО — симметричное ===
  const wingRGeo = new THREE.BufferGeometry();
  wingRGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
     0.0,  0.45,  0.0,
     2.8,  1.0,  -0.2,
     0.2, -0.1,   0.4,
     0.0,  0.45,  0.0,
     0.2, -0.1,   0.4,
     2.8, -0.3,   0.2,
  ]), 3));
  wingRGeo.computeVertexNormals();
  const wR = new THREE.Mesh(wingRGeo, mat);
  crane.add(wR);

  // === ШЕЯ ===
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.16, 0.9, 5), 
    mat
  );
  neck.position.set(0.0, 1.0, 0.25); 
  neck.rotation.z = -Math.PI / 5; 
  neck.rotation.x = -0.2;
  crane.add(neck);

  // === ГОЛОВА + КЛЮВ ===
  const head = new THREE.Mesh(
    new THREE.ConeGeometry(0.14, 0.5, 4), 
    mat
  );
  head.position.set(0.35, 1.45, 0.42); 
  head.rotation.z = -Math.PI / 2.8; 
  head.rotation.x = -0.3;
  crane.add(head);

  // === ХВОСТ — длинный острый, назад-влево ===
  const tailGeo = new THREE.BufferGeometry();
  tailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    -0.5, -0.1, -0.2,   // к туловищу (верх)
    -2.2,  0.3, -0.8,   // остриё хвоста вверх
    -0.6, -0.4,  0.0,   // к туловищу (низ)
    -0.5, -0.1, -0.2,
    -0.6, -0.4,  0.0,
    -2.2, -0.5, -0.6,   // остриё хвоста вниз
  ]), 3));
  tailGeo.computeVertexNormals();
  const tail = new THREE.Mesh(tailGeo, mat);
  crane.add(tail);

  scene.add(crane);

  // Анимация
  let t = 0;
  function animate(){
    requestAnimationFrame(animate); 
    t += 0.008;
    
    // Медленное вращение всего журавля
    crane.rotation.y = t * 0.4;
    
    // Лёгкое парение вверх-вниз
    crane.position.y = Math.sin(t) * 0.12;
    
    // Махание крыльями (как на видео — плавное)
    wL.rotation.z = Math.sin(t * 2.5) * 0.15;
    wR.rotation.z = -Math.sin(t * 2.5) * 0.15;
    
    renderer.render(scene, camera);
  }
  animate();

  // GSAP ScrollTrigger (если подключен)
  if(typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined'){
    gsap.registerPlugin(ScrollTrigger);
    gsap.from(crane.position, {
      x: -3, 
      duration: 1.4, 
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#about", 
        start: "top 80%", 
        toggleActions: "play none none reverse"
      }
    });
    gsap.from(".section-title-dark, .about-text-dark", {
      y: 40, 
      opacity: 0, 
      duration: 0.9, 
      stagger: 0.15, 
      ease: "power2.out",
      scrollTrigger: {
        trigger: "#about", 
        start: "top 75%", 
        toggleActions: "play none none reverse"
      }
    });
  }

  window.addEventListener('resize', () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  });
})();
