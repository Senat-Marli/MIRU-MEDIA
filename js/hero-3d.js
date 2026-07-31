(function(){
  const canvas = document.getElementById('hero-canvas');
  if(!canvas) return;
  const scene = new THREE.Scene();
  
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth/canvas.clientHeight, 0.1, 100);
  camera.position.set(0,0.5,8);

  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

  scene.add(new THREE.AmbientLight(0xffffff,0.5));
  const d1 = new THREE.DirectionalLight(0xffffff,1.5); d1.position.set(5,5,5); scene.add(d1);
  const d2 = new THREE.DirectionalLight(0x4444ff,0.3); d2.position.set(-5,2,-5); scene.add(d2);
  const pLight = new THREE.PointLight(0xE63946,1.2,25); pLight.position.set(2,3,4); scene.add(pLight);

  // Журавль-оригами (улучшенный — более острые формы)
  const crane = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color:0xE63946, roughness:0.35, metalness:0.15, 
    side:THREE.DoubleSide, flatShading:true
  });

  // Тело — призматический конус
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.85,2.0,4), mat);
  body.rotation.y = Math.PI/4; 
  body.rotation.z = Math.PI/5;
  crane.add(body);

  // Левое крыло — острое, с 2 треугольниками для складки
  const wingGeo = new THREE.BufferGeometry();
  wingGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    0,0.35,0, -2.6,1.3,-0.2, -2.6,-0.15,0.35,
    0,0.35,0, -2.6,-0.15,0.35, 0,-0.45,0.15,
    -0.8,0.1,0.05, -2.0,0.7,0, -2.6,1.3,-0.2
  ]),3));
  wingGeo.computeVertexNormals();
  const wL = new THREE.Mesh(wingGeo, mat); crane.add(wL);
  const wR = wL.clone(); wR.scale.x = -1; crane.add(wR);

  // Шея
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.18,0.95,6), mat);
  neck.position.set(0.55,1.15,0.22); 
  neck.rotation.z = -Math.PI/3.5; 
  crane.add(neck);

  // Голова — заострённая
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.14,0.55,4), mat);
  head.position.set(0.88,1.5,0.32); 
  head.rotation.z = -Math.PI/2.5; 
  crane.add(head);

  // Хвост — длинный острый
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.22,1.6,4), mat);
  tail.position.set(-0.85,-0.45,-0.12); 
  tail.rotation.z = Math.PI/2.2; 
  crane.add(tail);

  // Доп. складки на крыльях
  const fold = new THREE.Mesh(new THREE.BoxGeometry(0.7,0.04,0.35), mat);
  fold.position.set(-0.7,0.15,0.08);
  fold.rotation.z = 0.35;
  crane.add(fold);
  const foldR = fold.clone(); foldR.scale.x = -1; crane.add(foldR);

  scene.add(crane);

  // Летающие осколки (кубы + тетраэдры)
  const debrisCount = 45;
  const debrisGroup = new THREE.Group();
  const debrisMat = new THREE.MeshStandardMaterial({
    color:0xE63946, roughness:0.3, metalness:0.2, 
    flatShading:true, transparent:true, opacity:0.85
  });
  
  for(let i=0; i<debrisCount; i++){
    const geo = Math.random() > 0.5 
      ? new THREE.BoxGeometry(0.12,0.12,0.12)
      : new THREE.TetrahedronGeometry(0.1);
    const mesh = new THREE.Mesh(geo, debrisMat);
    mesh.position.set(
      (Math.random()-0.5)*14,
      (Math.random()-0.5)*10,
      (Math.random()-0.5)*8
    );
    mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
    mesh.userData = {
      rotSpeed: 0.008 + Math.random()*0.025,
      floatSpeed: 0.002 + Math.random()*0.005,
      phase: Math.random()*Math.PI*2
    };
    debrisGroup.add(mesh);
  }
  scene.add(debrisGroup);

  // Световые линии
  const lg = new THREE.Group();
  for(let i=0;i<5;i++){
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-8,(Math.random()-0.5)*6,(Math.random()-0.5)*4),
      new THREE.Vector3(-3,(Math.random()-0.5)*5,(Math.random()-0.5)*4),
      new THREE.Vector3(3,(Math.random()-0.5)*5,(Math.random()-0.5)*4),
      new THREE.Vector3(8,(Math.random()-0.5)*6,(Math.random()-0.5)*4)
    ]);
    const t = new THREE.Mesh(new THREE.TubeGeometry(c,64,0.012,8,false),
      new THREE.MeshBasicMaterial({color:0xff5555, transparent:true, opacity:0.15}));
    lg.add(t);
  }
  scene.add(lg);

  let time=0;
  function animate(){
    requestAnimationFrame(animate); time+=0.007;
    
    // Журавль парит
    crane.position.y = Math.sin(time)*0.15;
    crane.rotation.y = Math.sin(time*0.25)*0.06;
    crane.rotation.z = Math.cos(time*0.4)*0.025;
    
    // Махание крыльями
    wL.rotation.z = Math.sin(time*2.2)*0.12;
    wR.rotation.z = -Math.sin(time*2.2)*0.12;
    
    // Осколки летают
    debrisGroup.children.forEach(d => {
      d.position.y += Math.sin(time + d.userData.phase)*0.002;
      d.rotation.x += d.userData.rotSpeed;
      d.rotation.y += d.userData.rotSpeed*0.6;
    });
    debrisGroup.rotation.y = time*0.015;
    
    // Линии пульсируют
    lg.children.forEach((l,i)=>{ 
      l.material.opacity = 0.08 + Math.sin(time*1.2+i)*0.06; 
    });
    
    renderer.render(scene,camera);
  }
  animate();
  
  window.addEventListener('resize',()=>{
    camera.aspect = canvas.clientWidth/canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth,canvas.clientHeight);
  });
})();
