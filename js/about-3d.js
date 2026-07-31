(function(){
  const canvas = document.getElementById('about-canvas');
  if(!canvas) return;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth/canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 8);

  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

  scene.add(new THREE.AmbientLight(0xffffff,0.6));
  const d = new THREE.DirectionalLight(0xffffff,1.2); d.position.set(5,5,5); scene.add(d);
  const f = new THREE.DirectionalLight(0xffcccc,0.4); f.position.set(-5,0,5); scene.add(f);

  const crane = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({color:0xE63946, roughness:0.35, metalness:0.1, side:THREE.DoubleSide, flatShading:true});

  // Тело — ромб (октаэдр низкой детализации = ромб)
  const body = new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), mat);
  body.scale.set(1.1, 0.6, 0.7);
  body.rotation.z = 0.15;
  crane.add(body);

  // Левое крыло — плоский треугольник с 2 гранями (складка)
  const wLShape = new THREE.Shape();
  wLShape.moveTo(0,0);
  wLShape.lineTo(-2.8, 1.0);
  wLShape.lineTo(-2.8, -0.4);
  wLShape.lineTo(0,0);
  const wLGeo = new THREE.ShapeGeometry(wLShape);
  const wL = new THREE.Mesh(wLGeo, mat);
  wL.rotation.x = Math.PI/2;
  wL.rotation.y = 0.15;
  wL.position.set(-0.2, 0.15, 0.15);
  crane.add(wL);

  // Правое крыло
  const wR = wL.clone();
  wR.scale.x = -1;
  wR.position.set(0.2, 0.15, 0.15);
  crane.add(wR);

  // Шея
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.85, 5), mat);
  neck.position.set(0.1, 1.05, 0.2);
  neck.rotation.z = -0.45;
  neck.rotation.x = -0.25;
  crane.add(neck);

  // Голова
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 4), mat);
  head.position.set(0.4, 1.45, 0.4);
  head.rotation.z = -0.9;
  head.rotation.x = -0.35;
  crane.add(head);

  // Хвост — длинный треугольник
  const tailShape = new THREE.Shape();
  tailShape.moveTo(0,0);
  tailShape.lineTo(-2.4, 0.25);
  tailShape.lineTo(-2.4, -0.55);
  tailShape.lineTo(0,0);
  const tailGeo = new THREE.ShapeGeometry(tailShape);
  const tail = new THREE.Mesh(tailGeo, mat);
  tail.rotation.x = Math.PI/2;
  tail.rotation.y = -0.15;
  tail.position.set(-0.3, -0.15, -0.2);
  crane.add(tail);

  scene.add(crane);

  let t=0;
  function animate(){
    requestAnimationFrame(animate); t+=0.008;
    crane.rotation.y = t*0.4;
    crane.position.y = Math.sin(t)*0.1;
    wL.rotation.z = Math.sin(t*2.2)*0.1;
    wR.rotation.z = -Math.sin(t*2.2)*0.1;
    renderer.render(scene,camera);
  }
  animate();

  if(typeof gsap!=='undefined'&&typeof ScrollTrigger!=='undefined'){
    gsap.registerPlugin(ScrollTrigger);
    gsap.from(crane.position,{x:-3,duration:1.4,ease:"power3.out",scrollTrigger:{trigger:"#about",start:"top 80%",toggleActions:"play none none reverse"}});
    gsap.from(".about-title,.about-p",{y:40,opacity:0,duration:0.9,stagger:0.15,ease:"power2.out",scrollTrigger:{trigger:"#about",start:"top 75%",toggleActions:"play none none reverse"}});
  }

  window.addEventListener('resize',()=>{
    camera.aspect = canvas.clientWidth/canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth,canvas.clientHeight);
  });
})();
