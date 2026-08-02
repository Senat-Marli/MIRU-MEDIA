(function(){
  const canvas = document.getElementById('hero-canvas');
  if(!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth/canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 7);

  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // ===== ЧАСТИЦЫ (фейерверк) =====
  const palette = [
    new THREE.Color('#4fc3f7'), new THREE.Color('#29b6f6'),
    new THREE.Color('#e53935'), new THREE.Color('#f06292'),
    new THREE.Color('#ffffff'), new THREE.Color('#ab47bc'),
    new THREE.Color('#7e57c2')
  ];

  const particleCount = 1800;
  const geometry = new THREE.BufferGeometry();
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

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  // 1. Базовый размер материала
const material = new THREE.PointsMaterial({
  size: 0.025,          // ← было 0.05 — в 2 раза меньше
  vertexColors: true,
});

// 2. Размер каждой частицы в цикле
sizes[i] = 0.015 + Math.random()*0.02;   // ← было 0.03 + Math.random()*0.04


  const particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);
  particleSystem.position.y = 0.3;   /* было -0.3 — подняли в центр пустоты */




  const cycle = 6.0;
  let globalTime = 0;

  function animate(){
    requestAnimationFrame(animate);
    globalTime += 0.016;
    const t = globalTime % cycle;
    const posAttr = geometry.attributes.position;
    const arr = posAttr.array;

    let phase, progress;
    if(t < 1.5){ phase='implode'; progress=t/1.5; }
    else if(t < 3.5){ phase='explode'; progress=(t-1.5)/2.0; }
    else { phase='fade'; progress=(t-3.5)/2.5; }

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

    if(phase==='fade') material.opacity = Math.max(0, 1-progress*1.2);
    else material.opacity = 1;
    if(t < 0.3) material.opacity = Math.min(1, t/0.3);

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  });
})();
