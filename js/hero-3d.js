 (function(){
  const canvas = document.getElementById('hero-canvas');
  if(!canvas) return;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030303);
  scene.fog = new THREE.FogExp2(0x030303, 0.035);

  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth/canvas.clientHeight, 0.1, 100);
  camera.position.set(0,0,9);

  const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

  scene.add(new THREE.AmbientLight(0xffffff,0.3));
  const d1 = new THREE.DirectionalLight(0xffcccc,1.0); d1.position.set(5,5,5); scene.add(d1);
  const d2 = new THREE.DirectionalLight(0x4444ff,0.4); d2.position.set(-5,2,-5); scene.add(d2);
  const pLight = new THREE.PointLight(0xE63946,0.8,20); pLight.position.set(0,2,3); scene.add(pLight);

  const crane = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({color:0xE63946, roughness:0.5, metalness:0.15, side:THREE.DoubleSide, flatShading:true});

  const body = new THREE.Mesh(new THREE.ConeGeometry(1.1,2.4,4), mat);
  body.rotation.y = Math.PI/4; body.rotation.z = Math.PI/6; crane.add(body);

  const wGeo = new THREE.BufferGeometry();
  wGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    0,0.5,0, -2.4,1.2,-0.5, -2.4,-0.3,0.5,
    0,0.5,0, -2.4,-0.3,0.5, 0,-0.5,0.2
  ]),3));
  wGeo.computeVertexNormals();
  const wL = new THREE.Mesh(wGeo, mat); crane.add(wL);
  const wR = wL.clone(); wR.scale.x = -1; crane.add(wR);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.22,1.1,6), mat);
  neck.position.set(0.55,1.15,0.28); neck.rotation.z = -Math.PI/4; crane.add(neck);

  const head = new THREE.Mesh(new THREE.ConeGeometry(0.18,0.55,4), mat);
  head.position.set(0.85,1.65,0.38); head.rotation.z = -Math.PI/3; crane.add(head);

  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.28,1.4,4), mat);
  tail.position.set(-0.75,-0.45,-0.18); tail.rotation.z = Math.PI/2.5; crane.add(tail);

  scene.add(crane);

  const pCount = 80;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount*3);
  for(let i=0;i<pCount;i++){
    pPos[i*3]=(Math.random()-0.5)*14;
    pPos[i*3+1]=(Math.random()-0.5)*14;
    pPos[i*3+2]=(Math.random()-0.5)*10;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos,3));
  const pMat = new THREE.PointsMaterial({color:0xE63946, size:0.12, transparent:true, opacity:0.7});
  const particles = new THREE.Points(pGeo, pMat); scene.add(particles);

  const lg = new THREE.Group();
  for(let i=0;i<6;i++){
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-7,(Math.random()-0.5)*5,(Math.random()-0.5)*3),
      new THREE.Vector3(-2,(Math.random()-0.5)*4,(Math.random()-0.5)*3),
      new THREE.Vector3(2,(Math.random()-0.5)*4,(Math.random()-0.5)*3),
      new THREE.Vector3(7,(Math.random()-0.5)*5,(Math.random()-0.5)*3)
    ]);
    const t = new THREE.Mesh(new THREE.TubeGeometry(c,64,0.018,8,false),
      new THREE.MeshBasicMaterial({color:0xff7777, transparent:true, opacity:0.25}));
    lg.add(t);
  }
  scene.add(lg);

  let t=0;
  function animate(){
    requestAnimationFrame(animate); t+=0.008;
    crane.position.y = Math.sin(t)*0.25;
    crane.rotation.y = Math.sin(t*0.4)*0.12;
    crane.rotation.z = Math.cos(t*0.6)*0.04;
    wL.rotation.z = Math.sin(t*2.8)*0.18;
    wR.rotation.z = -Math.sin(t*2.8)*0.18;
    particles.rotation.y = t*0.04;
    lg.children.forEach((l,i)=>{ l.material.opacity = 0.15 + Math.sin(t*1.8+i)*0.12; });
    renderer.render(scene,camera);
  }
  animate();
  window.addEventListener('resize',()=>{
    camera.aspect = canvas.clientWidth/canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth,canvas.clientHeight);
  });
})();
