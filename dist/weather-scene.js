// Decorative illustration of the provider's current conditions, not an observation camera.
export function sceneCondition(code){
 if(!Number.isInteger(code))return 'unknown';
 if([95,96,99].includes(code))return 'storm';
 if([71,73,75,77,85,86].includes(code))return 'snow';
 if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code))return 'rain';
 if([45,48].includes(code))return 'fog';
 if(code===3)return 'overcast';
 if([1,2].includes(code))return 'clouds';
 return code===0?'clear':'unknown';
}
export function weatherScene(weather){
 const c=weather?.current,condition=sceneCondition(c?.weather_code);
 const windy=Number.isFinite(c?.wind_speed_10m)&&c.wind_speed_10m>=25;
 const precipitation=['rain','storm','snow'].includes(condition);
 const particles=precipitation?Array.from({length:20},(_,i)=>`<i style="--x:${(i*37)%100}%;--delay:-${(i*13)%29/10}s;--duration:${condition==='snow'?5+i%5:.7+(i%4)/10}s"></i>`).join(''):'';
 return `<div class="weather-scene" data-condition="${condition}" data-windy="${windy}" aria-hidden="true"><div class="scene-sky"></div><div class="scene-stars"></div><div class="scene-orb"></div><div class="scene-cloud scene-cloud-one"></div><div class="scene-cloud scene-cloud-two"></div><div class="scene-mist"></div><svg class="scene-horizon" viewBox="0 0 1200 240" preserveAspectRatio="none" focusable="false"><path class="scene-ridge-far" d="M0 135 Q130 65 210 100 T370 96 Q470 32 560 94 T760 83 Q870 18 955 69 T1200 55 V240 H0Z"/><path class="scene-ridge-near" d="M0 170 Q110 138 230 166 T410 151 Q500 120 600 160 T820 152 Q950 114 1050 140 T1200 130 V240 H0Z"/><path class="scene-shore" d="M0 215 Q150 190 300 212 T620 214 Q850 186 1200 224 V240 H0Z"/></svg><div class="scene-water"></div><div class="scene-reflection"></div><svg class="scene-lighthouse" viewBox="0 0 160 180" focusable="false"><path fill="#102d43" d="M0 175 Q40 148 70 154 L97 142 L160 168 V180 H0Z"/><path fill="#bdcfda" d="M82 148 L87 79 H106 L114 151Z"/><path fill="#47617c" d="M99 79 H106 L114 151 H101Z"/><path fill="#142f4b" d="M83 76 H111 V83 H83Z M86 55 L96 45 L109 55Z"/><path fill="#ffe4a1" d="M88 57 H105 V74 H88Z"/><path fill="#203d58" d="M94 58 H98 V74 H94Z M91 112 H98 V126 H91Z"/></svg><div class="scene-beacon"></div><div class="scene-particles">${particles}</div><div class="scene-scrim"></div></div>`;
}
