(function(){
  const canvas = document.getElementById('hero-canvas');
  if(!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth/canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0.5, 14);          // ← камера дальше

  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // ===== ЖУРАВЛЬ ОРИГАМИ =====
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const dLight = new THREE.DirectionalLight(0xffffff, 0.9);
  dLight.position.set(5, 5, 5); scene.add(dLight);
  const fLight = new THREE.DirectionalLight(0xffcccc, 0.5);
  fLight.position.set(-5, 0, 5); scene.add(fLight);

  const crane = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0xE63946, roughness: 0.45, metalness: 0.08,
    side: THREE.DoubleSide, flatShading: true
  });

  const body = new THREE.Mesh(new THREE.ConeGeometry(0.95, 2.1, 4), mat);
  body.rotation.y = Math.PI/4; body.rotation.z = Math.PI/6; crane.add(body);

  const wGeo = new THREE.BufferGeometry();
  wGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    0,0.4,0, -2.1,1.0,-0.4, -2.1,-0.2,0.4,
    0,0.4,0, -2.1,-0.2,0.4, 0,-0.4,0.2
  ]), 3));
  wGeo.computeVertexNormals();
  const wL = new THREE.Mesh(wGeo, mat); crane.add(wL);
  const wR = wL.clone(); wR.scale.x = -1; crane.add(wR);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.18, 0.95, 6), mat);
  neck.position.set(0.48, 1.0, 0.24); neck.rotation.z = -Math.PI/4; crane.add(neck);

  const head = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.48, 4), mat);
  head.position.set(0.72, 1.42, 0.34); head.rotation.z = -Math.PI/3; crane.add(head);

  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.2, 4), mat);
  tail.position.set(-0.65, -0.38, -0.14); tail.rotation.z = Math.PI/2.5; crane.add(tail);

  crane.scale.set(0.45, 0.45, 0.45);   // ← уменьшили масштаб
  crane.position.set(0, 1.2, 0);       // ← подняли выше центра
  scene.add(crane);

  // ===== ЧАСТИЦЫ (фейерверк) =====
  const palette = [
    new THREE.Color('#4fc3f7'), new THREE.Color('#29b6f6'),
    new THREE.Color('#e53935'), new THREE.Color('#f06292'),
    new THREE.Color('#ffffff'), new THREE.Color('#ab47bc'),
    new THREE.Color('#7e57c2')
  ];
  const particleCount = 1800;
  const pGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const particlesData = [];

  for(let i=0; i<particleCount; i++){
    const color = palette[Math.floor(Math.random()*palette.length)];
    colors[i*3]=color.r; colors[i*3+1]=color.g; colors[i*3+2]=color.b;
    const r = 2.5 + Math.random()*3;
    const theta = Math.random()*Math.PI*2;
    const phi = Math.acos(2*Math.random()-1);
    const x = r*Math.sin(phi)*Math.cos(theta);
    const y = r*Math.sin(phi)*Math.sin(theta);
    const z = r*Math.cos(phi);
    positions[i*3]=x; positions[i*3+1]=y; positions[i*3+2]=z;
    sizes[i] = 0.03 + Math.random()*0.04;
    const explodeDir = new THREE.Vector3(x,y,z).normalize();
    particlesData.push({
      basePos: new THREE.Vector3(x,y,z), pos: new THREE.Vector3(x,y,z),
      vel: explodeDir.clone().multiplyScalar(0.02 + Math.random()*0.06),
      size: sizes[i]
    });
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  pGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const pMat = new THREE.PointsMaterial({
    size: 0.05, vertexColors: true, transparent: true, opacity: 1,
    sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false
  });
  const particleSystem = new THREE.Points(pGeo, pMat);
  scene.add(particleSystem);

  // ===== АНИМАЦИЯ =====
  const cycle = 6.0;
  let globalTime = 0, craneTime = 0;

  function animate(){
    requestAnimationFrame(animate);
    globalTime += 0.016;
    craneTime += 0.007;
    const t = globalTime % cycle;

    // Журавль
    crane.rotation.y = craneTime * 0.45;
    crane.position.y = 1.2 + Math.sin(craneTime) * 0.1;

    // Частицы
    let phase, progress;
    if(t < 1.5){ phase='implode'; progress=t/1.5; }
    else if(t < 3.5){ phase='explode'; progress=(t-1.5)/2.0; }
    else { phase='fade'; progress=(t-3.5)/2.5; }

    const posAttr = pGeo.attributes.position;
    const arr = posAttr.array;
    for(let i=0; i<particleCount; i++){
      const d = particlesData[i];
      if(phase==='implode'){
        const target = d.basePos.clone().normalize().multiplyScalar(0.3+Math.random()*0.3);
        d.pos.lerp(target, 0.08);
      } else if(phase==='explode'){
        d.pos.add(d.vel); d.vel.multiplyScalar(1.02);
      } else {
        d.pos.add(d.vel); d.vel.multiplyScalar(0.98);
      }
      arr[i*3]=d.pos.x; arr[i*3+1]=d.pos.y; arr[i*3+2]=d.pos.z;
    }
    posAttr.needsUpdate = true;

    if(phase==='fade') pMat.opacity = Math.max(0, 1-progress*1.2);
    else pMat.opacity = 1;
    if(t < 0.3) pMat.opacity = Math.min(1, t/0.3);

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  });
})();
