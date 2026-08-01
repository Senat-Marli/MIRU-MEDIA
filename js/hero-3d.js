(function(){
  const canvas = document.getElementById('hero-canvas');
  if(!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth/canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 7);

  // Важно: alpha: true — прозрачный фон, видео будет видно сквозь canvas
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Свет
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const d = new THREE.DirectionalLight(0xffffff, 0.9); d.position.set(5,5,5); scene.add(d);
  const f = new THREE.DirectionalLight(0xffcccc, 0.5); f.position.set(-5,0,5); scene.add(f);

  // --- 3D Журавль (красный оригами) ---
  // Если твое видео УЖЕ содержит журавля — удали эту секцию, оставь только частицы ниже
  const crane = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color:0xE63946, roughness:0.45, metalness:0.08,
    side:THREE.DoubleSide, flatShading:true
  });

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

  crane.position.set(0, -0.3, 0);
  scene.add(crane);

  // --- Система частиц (300 точек) ---
  const particleCount = 300;
  const pPos = new Float32Array(particleCount * 3);
  const pVel = [];

  for(let i=0; i<particleCount; i++){
    const r = 2.5 + Math.random()*4;
    const theta = Math.random()*Math.PI*2;
    const phi = Math.acos(2*Math.random()-1);
    pPos[i*3]   = r*Math.sin(phi)*Math.cos(theta);
    pPos[i*3+1] = r*Math.sin(phi)*Math.sin(theta);
    pPos[i*3+2] = r*Math.cos(phi);
    pVel.push({
      x:(Math.random()-0.5)*0.003,
      y:(Math.random()-0.5)*0.003,
      z:(Math.random()-0.5)*0.003
    });
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({
    color:0xffffff, size:0.025, transparent:true, opacity:0.7, sizeAttenuation:true
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // --- Линии между близкими частицами (эффект созвездия) ---
  const lineMat = new THREE.LineBasicMaterial({color:0xE63946, transparent:true, opacity:0.12});
  let lineMesh = null;
  let frameCount = 0;

  function updateLines(){
    if(lineMesh){ scene.remove(lineMesh); lineMesh.geometry.dispose(); }
    const positions = [];
    const arr = pGeo.attributes.position.array;
    const maxDist = 1.0;
    for(let i=0; i<particleCount; i++){
      for(let j=i+1; j<particleCount; j++){
        const dx = arr[i*3]-arr[j*3], dy = arr[i*3+1]-arr[j*3+1], dz = arr[i*3+2]-arr[j*3+2];
        if(dx*dx + dy*dy + dz*dz < maxDist*maxDist){
          positions.push(arr[i*3], arr[i*3+1], arr[i*3+2]);
          positions.push(arr[j*3], arr[j*3+1], arr[j*3+2]);
        }
      }
    }
    if(positions.length){
      const lGeo = new THREE.BufferGeometry();
      lGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      lineMesh = new THREE.LineSegments(lGeo, lineMat);
      scene.add(lineMesh);
    }
  }

  // --- Анимация ---
  let t=0;
  function animate(){
    requestAnimationFrame(animate); t+=0.007;

    // Журавль плавает и крутится
    crane.rotation.y = t*0.45;
    crane.position.y = Math.sin(t*1.2)*0.12 - 0.3;

    // Частицы движутся
    const arr = pGeo.attributes.position.array;
    for(let i=0; i<particleCount; i++){
      arr[i*3]   += pVel[i].x + Math.sin(t+i)*0.0008;
      arr[i*3+1] += pVel[i].y + Math.cos(t+i*0.7)*0.0008;
      arr[i*3+2] += pVel[i].z;
      const dist = Math.sqrt(arr[i*3]**2 + arr[i*3+1]**2 + arr[i*3+2]**2);
      if(dist>7){ const s=2.5/dist; arr[i*3]*=s; arr[i*3+1]*=s; arr[i*3+2]*=s; }
    }
    pGeo.attributes.position.needsUpdate = true;

    // Линии обновляем каждые 6 кадров, чтобы не грузить GPU
    frameCount++;
    if(frameCount%6===0) updateLines();

    renderer.render(scene,camera);
  }
  animate();

  // --- GSAP: плавное появление при загрузке ---
  if(typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined'){
    gsap.registerPlugin(ScrollTrigger);
    gsap.from(crane.scale, {x:0,y:0,z:0,duration:2,ease:"elastic.out(1,0.5)",
      scrollTrigger:{trigger:".hero",start:"top 80%",toggleActions:"play none none reverse"}});
  }

  // --- Resize ---
  window.addEventListener('resize',()=>{
    camera.aspect = canvas.clientWidth/canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth,canvas.clientHeight);
  });
})();

