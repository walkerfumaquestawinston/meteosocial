import {precipitationTexture,precipitationSamples} from './world-weather.js';
import {solarDirection,daylight} from './solar-position.js';
import {CITIES} from './places.js';
import * as THREE from './assets/three.module.js';
import {landPositions,coastPositions} from './assets/land-mesh.js';

const DEG=Math.PI/180;
const xyz=(lat,lon,r=1)=>[r*Math.cos(lat*DEG)*Math.cos(lon*DEG),r*Math.sin(lat*DEG),-r*Math.cos(lat*DEG)*Math.sin(lon*DEG)];
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
const colors={rain:'#69caff',snow:'#ffffff',sun:'#ffdd68',hail:'#bc8bff',alert:'#ff9a4d',dry:'#ffb777',cloud:'#d0d9e2',wind:'#8be5da',model:'#4fb6f5'};

export function mountLivingGlobe(host,{center,getCenter,onPoint,onReport,onStatus,lightweight=false,reducedMotion=false}={}){
  lightweight=lightweight||document.documentElement.classList.contains('eco-mode')||document.documentElement.classList.contains('light-rendering');
  reducedMotion=reducedMotion||matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('reduced-motion');
  let dead=false,frame=0,last=0,activeUntil=performance.now()+10000,drag=null,moved=0,velocityX=0,velocityY=0,lastMove=0,tapTimer=0,lastTap=null,interacted=false;
  let width=1,height=1,latitude=center?.latitude??25,longitude=center?.longitude??12,zoom=1,layer='people',reports=[],visible=[],selectedId='',flashAt=-10000;
  let pointBudget=lightweight?800:5000,slowFrames=0;
  let renderer,scene,camera,earth,land,points,pointGeometry,pointMaterial,earthMap,softwareImage,softwarePixels,flight=null;
  let sun=solarDirection();const sunUniform={value:new THREE.Vector3(...sun)};
  const cityPositions=CITIES.map(c=>xyz(c.latitude,c.longitude,1.004));
  function solarMaterial(options){const material=new THREE.MeshBasicMaterial(options);material.onBeforeCompile=shader=>{shader.uniforms.solarDirection=sunUniform;shader.vertexShader='varying vec3 solarNormal;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nsolarNormal=normalize(position);');shader.fragmentShader='uniform vec3 solarDirection;varying vec3 solarNormal;\n'+shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.rgb*=mix(.35,1.,smoothstep(-.0348995,.0348995,dot(normalize(solarNormal),solarDirection)));');};material.customProgramCacheKey=()=> 'solar-v1';return material}
  const alertColor=typeof getComputedStyle==='function'?getComputedStyle(document.documentElement).getPropertyValue('--allerta').trim()||'#ff5a47':'#ff5a47';
  const pointColor=r=>r.category==='event'?alertColor:r.category==='weather'?(r.kind==='snow'?'#ffffff':colors.model):colors[r.kind]||colors.dry;
  let weatherMesh,weatherMap,weatherSamples=[];const weatherCanvas=document.createElement('canvas');weatherCanvas.width=1024;weatherCanvas.height=512;
  const labelsCanvas=document.createElement('canvas');labelsCanvas.setAttribute('aria-hidden','true');Object.assign(labelsCanvas.style,{position:'absolute',left:'0',top:'0',pointerEvents:'none'});const labelContext=labelsCanvas.getContext('2d');
  const canvas=document.createElement('canvas');canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Globo interattivo. Trascina o usa le frecce per ruotare, più e meno per zoomare, Invio per scegliere la zona al centro. Doppio tocco per tornare alla città selezionata.');
  try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:lightweight?'low-power':'high-performance'})}catch{}
  const software=!renderer,context=software?canvas.getContext('2d'):null;
  if(software&&!context)throw Error('Il dispositivo non può disegnare il globo');
  host.replaceChildren(canvas,labelsCanvas);host.dataset.renderer=software?'compatible':'webgl';
  if(renderer){
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0,0);
    scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(38,1,.1,100);
    earth=new THREE.Mesh(new THREE.SphereGeometry(1,lightweight?40:72,lightweight?28:48),solarMaterial({color:0x12263a}));scene.add(earth);
    const cityGeometry=new THREE.BufferGeometry();cityGeometry.setAttribute('position',new THREE.Float32BufferAttribute(cityPositions.flat(),3));
    const cityMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{solarDirection:sunUniform,pixel:{value:Math.min(devicePixelRatio,1.8)}},vertexShader:'uniform vec3 solarDirection;uniform float pixel;varying float night;void main(){night=1.-smoothstep(-.0348995,.0348995,dot(normalize(position),solarDirection));gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=2.5*pixel;}',fragmentShader:'varying float night;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;gl_FragColor=vec4(1.,.72,.38,night*(1.-d)*.8);}'});
    scene.add(new THREE.Points(cityGeometry,cityMaterial));
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(landPositions,3));geometry.computeVertexNormals();
    land=new THREE.Mesh(geometry,solarMaterial({color:0x294b60,side:THREE.DoubleSide}));scene.add(land);
    weatherMap=new THREE.CanvasTexture(weatherCanvas);weatherMap.colorSpace=THREE.SRGBColorSpace;weatherMesh=new THREE.Mesh(new THREE.SphereGeometry(1.009,48,32),new THREE.MeshBasicMaterial({map:weatherMap,transparent:true,depthWrite:false}));weatherMesh.visible=false;scene.add(weatherMesh);
    const glow=new THREE.Mesh(new THREE.SphereGeometry(1.035,40,32),new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.BackSide,blending:THREE.AdditiveBlending,vertexShader:'varying vec3 n;varying vec3 p;void main(){n=normalize(normalMatrix*normal);vec4 v=modelViewMatrix*vec4(position,1.);p=v.xyz;gl_Position=projectionMatrix*v;}',fragmentShader:'varying vec3 n;varying vec3 p;void main(){float a=pow(1.-abs(dot(normalize(n),normalize(-p))),2.8);gl_FragColor=vec4(.18,.57,.84,a*.62);}'}));scene.add(glow);
    pointGeometry=new THREE.BufferGeometry();
    pointMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{time:{value:0},elapsed:{value:0},pulse:{value:lightweight||reducedMotion?0:1},pixel:{value:Math.min(devicePixelRatio,1.8)},flash:{value:10}},vertexShader:`
      attribute vec3 color;attribute float age;attribute float phase;attribute float own;
      uniform float time;uniform float elapsed;uniform float pulse;uniform float pixel;uniform float flash;
      varying vec3 tint;varying float strength;varying float ring;
      void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;
        float remaining=max(0.,1.-age-elapsed/7200.);float beat=1.+pulse*.18*sin(time*2.094395+phase);
        ring=own*(1.-step(2.,flash));gl_PointSize=min(128.,(10.+15.*remaining+ring*flash*30.)*pixel*beat/max(.85,-mv.z*.38));
        tint=color;strength=remaining*beat;}
    `,fragmentShader:`
      varying vec3 tint;varying float strength;varying float ring;
      void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;
        float a=pow(max(0.,1.-d),2.8)*strength;
        if(ring>.5)a+=(1.-smoothstep(0.,.09,abs(d-.76)))*strength*.6;
        gl_FragColor=vec4(tint,a);}
    `});points=new THREE.Points(pointGeometry,pointMaterial);points.frustumCulled=false;scene.add(points);
  }
  function message(){onStatus?.(software?'Vista compatibile · trascina per esplorare':'Trascina il pianeta · tocca un punto per ascoltare la zona')}
  message();
  const textureImage=new Image();textureImage.onload=()=>{
    if(dead)return;softwareImage=textureImage;
    if(renderer){earthMap=new THREE.Texture(textureImage);earthMap.colorSpace=THREE.SRGBColorSpace;earthMap.needsUpdate=true;earthMap.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());if(layer==='satellite'){earth.material.map=earthMap;earth.material.needsUpdate=true}}
    else{const c=document.createElement('canvas');c.width=1024;c.height=512;const x=c.getContext('2d');x.drawImage(textureImage,0,0,1024,512);try{softwarePixels=x.getImageData(0,0,1024,512)}catch{}}
    invalidate();
  };textureImage.onerror=()=>{if(!dead)onStatus?.('Immagine satellite non disponibile. Il globo geografico resta utilizzabile.')};textureImage.src='/assets/earth.jpg';
  function basis(){const a=latitude*DEG,b=longitude*DEG;return {front:[Math.cos(a)*Math.cos(b),Math.sin(a),-Math.cos(a)*Math.sin(b)],right:[-Math.sin(b),0,-Math.cos(b)],up:[-Math.sin(a)*Math.cos(b),Math.cos(a),Math.sin(a)*Math.sin(b)]}}
  function projected(p,b){return {x:p[0]*b.right[0]+p[2]*b.right[2],y:p[0]*b.up[0]+p[1]*b.up[1]+p[2]*b.up[2],z:p[0]*b.front[0]+p[1]*b.front[1]+p[2]*b.front[2]}}
  let dataAt=Date.now();
  function updatePoints(){
    const b=basis(),now=Date.now(),limit=pointBudget;
    visible=reports.filter(r=>Number.isFinite(r.latitude)&&Number.isFinite(r.longitude)&&Number.isFinite(r.created)&&r.created<=now+60000&&r.created>now-(r.sourceRecord?7*86400000:7200000)&&(!r.expires||r.expires>now)).map(r=>({r,p:xyz(r.latitude,r.longitude,1.012)})).sort((a,c)=>{
      const score=v=>(v.r.created-(now-7200000))/7200000*.7+Math.max(0,projected(v.p,b).z)*.3;
      return score(c)-score(a);
    }).slice(0,limit);
    dataAt=now;if(!renderer)return;
    const positions=[],tints=[],ages=[],phases=[],own=[];
    for(const {r,p} of visible){positions.push(...p);const color=new THREE.Color(pointColor(r));tints.push(color.r,color.g,color.b);ages.push(r.sourceRecord ? .25 : clamp((now-r.created)/7200000,0,1));let hash=0;for(const c of String(r.id))hash=(hash*31+c.charCodeAt(0))>>>0;phases.push((hash%628)/100);own.push(r.id===selectedId?1:0)}
    pointGeometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));pointGeometry.setAttribute('color',new THREE.Float32BufferAttribute(tints,3));pointGeometry.setAttribute('age',new THREE.Float32BufferAttribute(ages,1));pointGeometry.setAttribute('phase',new THREE.Float32BufferAttribute(phases,1));pointGeometry.setAttribute('own',new THREE.Float32BufferAttribute(own,1));pointGeometry.setDrawRange(0,visible.length);
  }
  const shadeCanvas=software?document.createElement('canvas'):null;if(shadeCanvas){shadeCanvas.width=shadeCanvas.height=128}
  function softwareDraw(now){
    const x=context,b=basis(),radius=Math.min(width*.45,height*.43)*zoom,cx=width/2,cy=height/2;
    x.clearRect(0,0,width,height);x.save();const halo=x.createRadialGradient(cx,cy,radius*.98,cx,cy,radius*1.1);halo.addColorStop(0,'#4fb6f54d');halo.addColorStop(1,'#4fb6f500');x.fillStyle=halo;x.beginPath();x.arc(cx,cy,radius*1.1,0,Math.PI*2);x.fill();
    x.beginPath();x.arc(cx,cy,radius,0,Math.PI*2);x.clip();const sea=x.createRadialGradient(cx-radius*.35,cy-radius*.35,0,cx,cy,radius*1.5);sea.addColorStop(0,'#193951');sea.addColorStop(1,'#050c18');x.fillStyle=sea;x.fillRect(0,0,width,height);
    if(layer==='satellite'&&softwarePixels){
      const size=Math.min(420,Math.ceil(radius*2)),image=x.createImageData(size,size),source=softwarePixels.data;
      for(let py=0;py<size;py++)for(let px=0;px<size;px++){
        const vx=(px+.5-size/2)/(size/2),vy=-(py+.5-size/2)/(size/2),q=1-vx*vx-vy*vy;if(q<0)continue;const vz=Math.sqrt(q),v=b.front.map((f,k)=>f*vz+b.right[k]*vx+b.up[k]*vy),lat=Math.asin(clamp(v[1],-1,1)),lon=Math.atan2(-v[2],v[0]);
        const sx=((Math.floor((lon/(2*Math.PI)+.5)*1024)%1024)+1024)%1024,sy=clamp(Math.floor((.5-lat/Math.PI)*512),0,511),si=(sy*1024+sx)*4,di=(py*size+px)*4,shade=.68+.32*vz;
        image.data[di]=source[si]*shade;image.data[di+1]=source[si+1]*shade;image.data[di+2]=source[si+2]*shade;image.data[di+3]=255;
      }
      const buffer=document.createElement('canvas');buffer.width=buffer.height=size;buffer.getContext('2d').putImageData(image,0,0);x.drawImage(buffer,cx-radius,cy-radius,radius*2,radius*2);
    }else{
      x.fillStyle='#315267';x.beginPath();
      for(let i=0;i<landPositions.length;i+=9){const p=projected(landPositions.slice(i,i+3),b),q=projected(landPositions.slice(i+3,i+6),b),r=projected(landPositions.slice(i+6,i+9),b);if(p.z<0||q.z<0||r.z<0)continue;x.moveTo(cx+p.x*radius,cy-p.y*radius);x.lineTo(cx+q.x*radius,cy-q.y*radius);x.lineTo(cx+r.x*radius,cy-r.y*radius);x.closePath()}x.fill();
      x.strokeStyle='#6c95ab';x.lineWidth=.6;x.beginPath();for(let i=0;i<coastPositions.length;i+=6){const a=projected(coastPositions.slice(i,i+3),b),c=projected(coastPositions.slice(i+3,i+6),b);if(a.z<=0||c.z<=0)continue;x.moveTo(cx+a.x*radius,cy-a.y*radius);x.lineTo(cx+c.x*radius,cy-c.y*radius)}x.stroke();
    }
    const shadow=shadeCanvas.getContext('2d'),mask=shadow.createImageData(128,128);
    for(let py=0;py<128;py++)for(let px=0;px<128;px++){const vx=(px+.5-64)/64,vy=-(py+.5-64)/64,q=1-vx*vx-vy*vy;if(q<0)continue;const v=b.front.map((f,k)=>f*Math.sqrt(q)+b.right[k]*vx+b.up[k]*vy);mask.data[(py*128+px)*4+3]=Math.round(255*.65*(1-daylight(v.reduce((n,a,k)=>n+a*sun[k],0))))}
    shadow.putImageData(mask,0,0);x.drawImage(shadeCanvas,cx-radius,cy-radius,radius*2,radius*2);
    if(layer==='weather')for(const r of weatherSamples){const v=projected(xyz(r.latitude,r.longitude),b);if(v.z<=.02)continue;const px=cx+v.x*radius,py=cy-v.y*radius,size=Math.max(3,radius*.052),g=x.createRadialGradient(px,py,0,px,py,size);g.addColorStop(0,r.snow?'rgba(255,255,255,.7)':'rgba(79,182,245,.65)');g.addColorStop(1,'rgba(79,182,245,0)');x.fillStyle=g;x.beginPath();x.arc(px,py,size,0,Math.PI*2);x.fill()}
    x.restore();x.save();x.globalCompositeOperation='lighter';
    for(const p of cityPositions){const v=projected(p,b),night=1-daylight(p.reduce((n,a,k)=>n+a*sun[k]/1.004,0));if(v.z<=.02||night<=0)continue;x.globalAlpha=night*.8;x.fillStyle='#ffb861';x.beginPath();x.arc(cx+v.x*radius,cy-v.y*radius,1,0,Math.PI*2);x.fill()}
    x.globalAlpha=1;
    for(const {r,p} of visible){const v=projected(p,b);if(v.z<=.015)continue;const age=r.sourceRecord ? .75 : clamp(1-(Date.now()-r.created)/7200000,0,1),pulse=lightweight||reducedMotion?1:1+.15*Math.sin(now/477+[...String(r.id)].reduce((n,c)=>(n*31+c.charCodeAt(0))%628,0)/100),size=(5+age*7)*pulse,px=cx+v.x*radius,py=cy-v.y*radius,glow=x.createRadialGradient(px,py,0,px,py,size);glow.addColorStop(0,pointColor(r));glow.addColorStop(1,'#00000000');x.globalAlpha=age;x.fillStyle=glow;x.beginPath();x.arc(px,py,size,0,Math.PI*2);x.fill();if(r.id===selectedId&&now-flashAt<2000&&!reducedMotion){x.strokeStyle=colors[r.kind]||colors.dry;x.lineWidth=2;x.globalAlpha=1-(now-flashAt)/2000;x.beginPath();x.arc(px,py,8+(now-flashAt)/35,0,Math.PI*2);x.stroke()}}
    x.restore();
  }
  function paintLabels(){if(!labelContext)return;const x=labelContext,b=basis(),taken=new Set();x.clearRect(0,0,width,height);x.font=(typeof getComputedStyle==='function'?getComputedStyle(document.documentElement).getPropertyValue('--t-title').trim()||'20px':'20px')+' sans-serif';x.textAlign='center';x.textBaseline='middle';for(const {r,p} of visible){if(r.category!=='event')continue;const v=projected(p,b);if(v.z<=(renderer?1/camera.position.length():.02))continue;let px,py;if(renderer){const pos=new THREE.Vector3(...p).project(camera);px=(pos.x*.5+.5)*width;py=(-pos.y*.5+.5)*height}else{const radius=Math.min(width*.45,height*.43)*zoom;px=width/2+v.x*radius;py=height/2-v.y*radius}if(px<0||py<0||px>width||py>height)continue;const cell=Math.round(px/28)+','+Math.round(py/28);if(taken.has(cell))continue;taken.add(cell);x.strokeStyle='#0e1620';x.lineWidth=3;x.strokeText(r.icon||'!',px,py);x.fillStyle=alertColor;x.fillText(r.icon||'!',px,py)}}
  function paint(now){
    if(renderer){const half=19*DEG,fit=1.05/Math.sin(Math.min(half,Math.atan(Math.tan(half)*camera.aspect)));camera.position.set(...xyz(latitude,longitude,Math.max(1.3,fit/zoom)));camera.lookAt(0,0,0);pointMaterial.uniforms.time.value=now/1000;pointMaterial.uniforms.elapsed.value=(Date.now()-dataAt)/1000;pointMaterial.uniforms.flash.value=(now-flashAt)/1000;renderer.render(scene,camera)}else softwareDraw(now);paintLabels();
  }
  function draw(now){frame=0;if(dead||document.hidden)return;const dt=last?Math.min(80,now-last):0;last=now;if(dt>25&&visible.length>800){slowFrames++;if(slowFrames>60){pointBudget=Math.max(800,Math.floor(pointBudget/2));slowFrames=0;updatePoints()}}else slowFrames=Math.max(0,slowFrames-1);
    if(flight){const t=clamp((now-flight.start)/800,0,1),ease=1-(1-t)**3;latitude=flight.lat+(flight.to.latitude-flight.lat)*ease;longitude=flight.lon+flight.dlon*ease;zoom=flight.zoom+(1.45-flight.zoom)*ease;if(t===1)flight=null}
    else if(!drag&&!reducedMotion&&!lightweight&&now<activeUntil){
      if(Math.abs(velocityX)+Math.abs(velocityY)>.0001){const decay=Math.exp(-dt/260),travel=260*(1-decay);longitude+=velocityX*travel;latitude=clamp(latitude+velocityY*travel,-85,85);velocityX*=decay;velocityY*=decay}
      else if(interacted&&now>=activeUntil-5000)longitude+=dt*.003;
    }
    paint(now);if(now<activeUntil&&!reducedMotion&&!lightweight)frame=requestAnimationFrame(draw);
  }
  function invalidate(){if(!dead&&!document.hidden&&!frame)frame=requestAnimationFrame(draw)}
  function wake(){activeUntil=performance.now()+10000;invalidate()}
  function resize(){width=Math.max(1,host.clientWidth);height=Math.max(280,host.clientHeight||500);const ratio=typeof devicePixelRatio==='number'?Math.min(devicePixelRatio,1.8):1;labelsCanvas.width=Math.round(width*ratio);labelsCanvas.height=Math.round(height*ratio);labelsCanvas.style.width=width+'px';labelsCanvas.style.height=height+'px';labelContext?.setTransform(ratio,0,0,ratio,0,0);if(renderer){renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix()}else{canvas.width=width;canvas.height=height;canvas.style.width=width+'px';canvas.style.height=height+'px'}paint(performance.now());invalidate()}
  const observer=new ResizeObserver(resize);observer.observe(host);
  function pointAt(clientX,clientY){const rect=canvas.getBoundingClientRect(),x=clientX-rect.left,y=clientY-rect.top,b=basis();let best=null,distance=24;
    for(const item of visible){const v=projected(item.p,b);if(v.z<=.015||renderer&&item.r.sourceRecord&&v.z<=1/camera.position.length())continue;let px,py;if(renderer){const p=new THREE.Vector3(...item.p).project(camera);px=(p.x*.5+.5)*width;py=(-p.y*.5+.5)*height}else{const r=Math.min(width*.45,height*.43)*zoom;px=width/2+v.x*r;py=height/2-v.y*r}const d=Math.hypot(px-x,py-y);if(d<distance){best=item.r;distance=d}}
    if(best)return onReport?.(best);
    if(renderer){const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(x/width*2-1,-y/height*2+1),camera);const hit=ray.intersectObject(earth)[0];if(hit){const p=hit.point.normalize();onPoint?.({latitude:Math.asin(p.y)/DEG,longitude:Math.atan2(-p.z,p.x)/DEG})}}
    else{const r=Math.min(width*.45,height*.43)*zoom,vx=(x-width/2)/r,vy=-(y-height/2)/r,q=1-vx*vx-vy*vy;if(q>=0){const p=b.front.map((f,k)=>f*Math.sqrt(q)+b.right[k]*vx+b.up[k]*vy);onPoint?.({latitude:Math.asin(clamp(p[1],-1,1))/DEG,longitude:Math.atan2(-p[2],p[0])/DEG})}}
  }
  const touches=new Map();let pinch=0,multiTouch=false;
  function cancelTap(){clearTimeout(tapTimer);tapTimer=0;lastTap=null}
  function focusPoint(point,{flash=false}={}){
    if(!point||!Number.isFinite(point.latitude)||!Number.isFinite(point.longitude))return;
    velocityX=velocityY=0;flight=null;cancelTap();
    if(flash){selectedId=point.id||'';flashAt=performance.now();updatePoints()}
    const dlon=((point.longitude-longitude)%360+540)%360-180;
    if(reducedMotion||lightweight){latitude=point.latitude;longitude=point.longitude;zoom=1.45}
    else flight={start:performance.now(),lat:latitude,lon:longitude,zoom,to:point,dlon};
    wake();
  }
  canvas.onpointerdown=e=>{interacted=true;if(e.button!==undefined&&e.button!==0)return;flight=null;velocityX=velocityY=0;if(!touches.size){moved=0;multiTouch=false}touches.set(e.pointerId,{x:e.clientX,y:e.clientY});drag={x:e.clientX,y:e.clientY};lastMove=performance.now();if(touches.size>1){multiTouch=true;cancelTap();const [a,b]=[...touches.values()];pinch=Math.hypot(a.x-b.x,a.y-b.y)}canvas.setPointerCapture(e.pointerId);wake()};
  canvas.onpointermove=e=>{if(!touches.has(e.pointerId))return;const now=performance.now();touches.set(e.pointerId,{x:e.clientX,y:e.clientY});if(touches.size>=2){const [a,b]=[...touches.values()],span=Math.hypot(a.x-b.x,a.y-b.y);if(pinch)zoom=clamp(zoom*span/pinch,.75,2.8);pinch=span;moved=99;velocityX=velocityY=0;cancelTap();wake();return}const dx=e.clientX-drag.x,dy=e.clientY-drag.y,dt=Math.max(8,now-lastMove);moved+=Math.abs(dx)+Math.abs(dy);longitude-=dx*.25/zoom;latitude=clamp(latitude+dy*.25/zoom,-85,85);if(!reducedMotion&&!lightweight&&!multiTouch){velocityX=clamp(-dx*.25/zoom/dt,-.3,.3);velocityY=clamp(dy*.25/zoom/dt,-.3,.3)}lastMove=now;drag={x:e.clientX,y:e.clientY};if(moved>=6)cancelTap();wake()};
  canvas.onpointerup=e=>{if(!touches.has(e.pointerId))return;touches.delete(e.pointerId);pinch=0;drag=touches.size?[...touches.values()][0]:null;const now=performance.now();if(now-lastMove>100||multiTouch)velocityX=velocityY=0;
    if(!touches.size&&!multiTouch&&moved<6){velocityX=velocityY=0;if(lastTap&&now-lastTap.time<=300&&Math.hypot(e.clientX-lastTap.x,e.clientY-lastTap.y)<24){focusPoint(getCenter?.()||center)}else{cancelTap();lastTap={time:now,x:e.clientX,y:e.clientY};tapTimer=setTimeout(()=>{const tap=lastTap;cancelTap();if(tap&&!dead&&!document.hidden)pointAt(tap.x,tap.y)},300)}}
    updatePoints();wake();};
  canvas.onpointercancel=e=>{touches.delete(e.pointerId);pinch=0;drag=touches.size?[...touches.values()][0]:null;multiTouch=true;velocityX=velocityY=0;cancelTap()};
  canvas.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','Enter'].includes(e.key))return;e.preventDefault();cancelTap();velocityX=velocityY=0;flight=null;if(e.key==='ArrowLeft')longitude-=8;if(e.key==='ArrowRight')longitude+=8;if(e.key==='ArrowUp')latitude=clamp(latitude+8,-85,85);if(e.key==='ArrowDown')latitude=clamp(latitude-8,-85,85);if(e.key==='+')zoom=clamp(zoom*1.15,.75,2.8);if(e.key==='-')zoom=clamp(zoom/1.15,.75,2.8);if(e.key==='Enter'){const r=canvas.getBoundingClientRect();pointAt(r.left+r.width/2,r.top+r.height/2)}updatePoints();wake()};
  canvas.onwheel=e=>{if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();cancelTap();flight=null;zoom=clamp(zoom*(e.deltaY<0?1.1:.9),.75,2.8);velocityX=velocityY=0;wake()};
  function updateSun(){sun=solarDirection();sunUniform.value.set(...sun)}
  const solarTimer=setInterval(()=>{if(!document.hidden&&!dead){updateSun();invalidate()}},60000);
  const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;flight=null;velocityX=velocityY=0;touches.clear();drag=null;pinch=0;activeUntil=0;cancelTap()}else{updateSun();updatePoints();invalidate()}};document.addEventListener('visibilitychange',visibility);
  updatePoints();resize();
  return {
    software,
    setWeatherSamples(value){weatherSamples=precipitationSamples(value);precipitationTexture(weatherCanvas,value);if(weatherMap)weatherMap.needsUpdate=true;invalidate()},
    setReports(value){reports=Array.isArray(value)?value:[];updatePoints();invalidate()},
    setLayer(value){if(value!==layer)velocityX=velocityY=0;layer=value;if(renderer){earth.material.map=value==='satellite'?earthMap||null:null;earth.material.color.set(value==='satellite'?0xffffff:0x12263a);earth.material.needsUpdate=true;land.visible=value!=='satellite';weatherMesh.visible=value==='weather'}invalidate()},
    focus:focusPoint,
    zoom(factor){cancelTap();flight=null;velocityX=velocityY=0;zoom=clamp(zoom*factor,.75,2.8);wake()},
    north(){cancelTap();flight=null;latitude=25;longitude=(getCenter?.()||center)?.longitude||12;zoom=1;velocityX=velocityY=0;updatePoints();wake()},
    view(){return {latitude,longitude,zoom}},
    capture(){paint(performance.now());const copy=document.createElement('canvas');copy.width=canvas.width;copy.height=canvas.height;copy.getContext('2d').drawImage(canvas,0,0);copy.getContext('2d').drawImage(labelsCanvas,0,0,copy.width,copy.height);return copy},
    dispose(){dead=true;cancelTap();touches.clear();clearInterval(solarTimer);cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',visibility);textureImage.onload=null;textureImage.onerror=null;if(renderer){scene.traverse(o=>{o.geometry?.dispose();for(const m of [o.material].flat())m?.dispose()});earthMap?.dispose();weatherMap?.dispose();renderer.dispose();renderer.forceContextLoss()}host.replaceChildren()}
  };
}
