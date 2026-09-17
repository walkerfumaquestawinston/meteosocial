import * as T from './assets/three.module.js';

export function mountAvatar(host, {bald=true,equipped='none'}={}) {
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(32,1,.1,100);
 camera.position.set(0,.45,5);camera.lookAt(0,.15,0);
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));host.replaceChildren(renderer.domElement);
 renderer.domElement.setAttribute('aria-label','Avatar 3D con '+(bald?'testa rasata':'capelli corti'));
 renderer.domElement.setAttribute('role','img');
 scene.add(new T.HemisphereLight(0xd6e9ff,0x293047,3));const light=new T.DirectionalLight(0xffffff,4);light.position.set(3,4,5);scene.add(light);
 const root=new T.Group();scene.add(root);
 const mat=color=>new T.MeshStandardMaterial({color,roughness:.38,metalness:.08});
 const skin=mat('#c8a58d'),cloth=mat('#b9a7ff'),dark=mat('#191c2a'),lime=mat('#c8ff63');
 function sphere(parent,x,y,z,sx,sy,sz,m){const a=new T.Mesh(new T.SphereGeometry(1,32,20),m);a.position.set(x,y,z);a.scale.set(sx,sy,sz);parent.add(a);return a}
 sphere(root,0,-.65,0,.76,.67,.42,cloth);sphere(root,0,.01,0,.22,.27,.23,skin);sphere(root,0,.58,0,.49,.6,.43,skin);
 sphere(root,-.5,.53,0,.08,.13,.1,skin);sphere(root,.5,.53,0,.08,.13,.1,skin);
 for(const x of [-.17,.17])sphere(root,x,.66,.405,.045,.055,.025,dark);
 sphere(root,0,.48,.425,.055,.07,.07,skin);
 const smile=new T.Mesh(new T.TorusGeometry(.11,.013,8,24,Math.PI),dark);smile.rotation.z=Math.PI;smile.position.set(0,.38,.419);root.add(smile);
 if(!bald)sphere(root,0,.99,-.025,.49,.23,.42,dark);
 const accessory=new T.Group();root.add(accessory);
 if(equipped==='headphones'){
  const band=new T.Mesh(new T.TorusGeometry(.58,.06,12,40,Math.PI),lime);band.position.y=.65;accessory.add(band);
  for(const x of [-.54,.54])sphere(accessory,x,.58,0,.13,.24,.23,dark);
 }
 if(equipped==='microphone'){
  sphere(accessory,.7,-.22,.55,.16,.27,.16,dark);
  const stem=new T.Mesh(new T.CylinderGeometry(.025,.025,.43,12),lime);stem.position.set(.7,-.62,.55);accessory.add(stem);
  sphere(accessory,.7,-.86,.55,.25,.035,.2,dark);
 }
 let frame=0,disposed=false,start=performance.now();const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('reduced-motion')||document.documentElement.classList.contains('light-rendering')||document.documentElement.classList.contains('eco-mode');
 function draw(){if(disposed)return;const t=Math.min((performance.now()-start)/1800,1);root.rotation.y=.14;accessory.position.y=reduced?0:Math.sin(t*Math.PI*4)*.035*Math.sin(t*Math.PI);renderer.render(scene,camera);if(t<1&&!reduced&&!document.hidden)frame=requestAnimationFrame(draw)}
 const resize=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight||340;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.render(scene,camera)});resize.observe(host);draw();
 const visibility=()=>{if(document.hidden)cancelAnimationFrame(frame)};document.addEventListener('visibilitychange',visibility);
 return {capture(){renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png')},dispose(){disposed=true;cancelAnimationFrame(frame);resize.disconnect();document.removeEventListener('visibilitychange',visibility);scene.traverse(o=>o.geometry?.dispose());[skin,cloth,dark,lime].forEach(m=>m.dispose());renderer.dispose();renderer.forceContextLoss();host.replaceChildren()}};
}
