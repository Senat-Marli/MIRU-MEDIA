(function(){
  const canvas = document.getElementById('hero-canvas');
  if(!canvas) return;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth/canvas.clientHeight, 0.1, 100);
  camera.position.set(0, -1, 10);

  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

  scene.add(new THREE.AmbientLight(0xffffff,0.4));
  const d1 = new THREE.DirectionalLight(0xffffff,1.4); d1.position.set(5,5,5); scene.add(d1);
  const d2 = new THREE.DirectionalLight(0x4444ff,0.3); d2.position.set(-5,2,-5); scene.add(d2);
  const pLight = new THREE.PointLight(0xE63946,1.0,25); pLight.position.set(2,3,4); scene.add(pLight);

  const crane = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({color:0xE63946, roughness:0.35, metalness:0.15, side:THREE.DoubleSide, flatShading:true});

  // Тело — ромб (октаэдр)
  const body = new THREE.Mesh(new THREE.OctahedronGeometry(0.9, 0), mat);
  body.scale.set(1.3, 0.7, 0.8);
  body.rotation.z = 0.2;
  crane.add(body);

  // Крылья — плоские треугольники (ShapeGeometry)
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0,0);
  wingShape.lineTo(-3.2, 1.1);
  wingShape.lineTo(-3.2, -0.5);
  wingShape.lineTo(0,0);
  const wingGeo = new THREE.ShapeGeometry(wingShape);
  const wL = new THREE.Mesh(wingGeo, mat);
  wL.rotation.x = Math.PI/2;
  wL.rotation.y = 0.1;
  wL.position.set(-0.3, 0.2, 0.2);
  crane.add(wL);

  const wR = wL.clone();
  wR.scale.x = -1;
  wR.position.set(0.3, 0.2, 0.2);
  crane.add(wR);

  // Шея
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 1.0, 5), mat);
  neck.position.set(0.2, 1.3, 0.3);
  neck.rotation.z = -0.5;
  neck.rotation.x = -0.3;
  crane.add(neck);

  // Голова
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.5, 4), mat);
  head.position.set(0.55, 1.85, 0.55);
  head.rotation.z = -1.0;
  head.rotation.x = -0.4;
  crane.add(head);

  // Хвост
  const tailShape = new THREE.Shape();
  tailShape.moveTo(0,0);
  tailShape.lineTo(-2.6, 0.3);
  tailShape.lineTo(-2.6, -0.6);
  tailShape.lineTo(0,0);
  const tailGeo = new THREE.ShapeGeometry(tailShape);
  const tail = new THREE.Mesh(tailGeo, mat);
  tail.rotation.x = Math.PI/2;
  tail.rotation.y = -0.2;
  tail.position.set(-0.4, -0.2, -0.3);
  crane.add(tail);

  scene.add(crane);

  // Осколки
  const debris = new THREE.Group();
  const dMat = new THREE.MeshStandardMaterial({color:0xE63946, roughness:0.3, flatShading:true, transparent:true, opacity:0.8});
  for(let i=0;i<40;i++){
    const geo = Math.random()>0.5 ? new THREE.BoxGeometry(0.15,0.15,0.15) : new THREE.TetrahedronGeometry(0.12);
    const m = new THREE.Mesh(geo, dMat);
    m.position.set((Math.random()-0.5)*16, (Math.random()-0.5)*12, (Math.random()-0.5)*6);
    m.userData = {rx:Math.random()*0.02, ry:Math.random()*0.02};
    debris.add(m);
  }
  scene.add(debris);

  let t=0;
  function animate(){
    requestAnimationFrame(animate); t+=0.007;
    crane.position.y = Math.sin(t)*0.2;
    crane.rotation.y = Math.sin(t*0.25)*0.08;
    wL.rotation.z = Math.sin(t*2.2)*0.12;
    wR.rotation.z = -Math.sin(t*2.2)*0.12;
    debris.children.forEach(d=>{ d.rotation.x+=d.userData.rx; d.rotation.y+=d.userData.ry; });
    debris.rotation.y = t*0.01;
    renderer.render(scene,camera);
  }
  animate();
  window.addEventListener('resize',()=>{
    camera.aspect = canvas.clientWidth/canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth,canvas.clientHeight);
  });
})();
