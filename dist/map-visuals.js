// Original lightweight atlas iconography; no external fonts or image requests.
const paths={
  shelter:'<path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-7h6v7"/><path d="M9 8h6"/>',
  temperature:'<path d="M9 14.5V5a3 3 0 0 1 6 0v9.5a5 5 0 1 1-6 0Z"/><path d="M12 7v11m5-10h3m-3 4h2"/>',
  pioggia:'<path d="M6 15a5 5 0 1 1 2-9 6 6 0 0 1 11 3 3 3 0 0 1-1 6"/><path d="m7 17-1 3m6-3-1 3m6-3-1 3"/>',
  grandine:'<path d="M5 12a4 4 0 1 1 3-6 5 5 0 0 1 9 2 3 3 0 0 1 2 5"/><path d="m7 16 2 2-2 2-2-2Zm8-1 3 3-3 3-3-3Z"/>',
  vento:'<path d="M3 8h12a3 3 0 1 0-3-3M2 12h17a3 3 0 1 1-3 3M4 16h5a3 3 0 1 1-3 3"/>',
  fulmini:'<path d="m14 2-9 12h6l-1 8 9-12h-6l1-8Z"/>',
  radar:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="m12 12 6-7M12 3v2M3 12h2m7 7v2m7-9h2"/><circle cx="8" cy="15" r="1"/>',
  locate:'<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 1v4m0 14v4M1 12h4m14 0h4"/>',
  world:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6h14M5 18h14"/>',
  list:'<path d="M9 5h12M9 12h12M9 19h12"/><circle cx="3" cy="5" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="19" r="1"/>',
  nature:'<path d="M4 20 12 4l8 16H4Z"/><path d="m9 10 3 3 3-3M12 1v1m7 3 2-1M4 5 2 4"/>',
  refresh:'<path d="M20 7a9 9 0 0 0-15-2L2 8m0-6v6h6m-4 9a9 9 0 0 0 15 2l3-3m0 6v-6h-6"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  minus:'<path d="M5 12h14"/>',
  ai:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/><path d="M20 2v4m-2-2h4"/>',
  layers:'<path d="m12 3 10 5-10 5L2 8l10-5Zm-9 10 9 5 9-5M3 18l9 5 9-5"/>'
};
export const mapIcon=name=>'<svg class="mappa-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||paths.world)+'</svg>';
export function weatherArt(code,isDay=1){
  const kind=!Number.isFinite(code)||code<0?'unknown':[95,96,99].includes(code)?'storm':[71,73,75,77,85,86].includes(code)?'snow':code>=51?'rain':code>=1?'cloud':isDay===0?'moon':'sun';
  return '<span class="mappa-weather-art weather-'+kind+'" aria-hidden="true"><i class="art-orbit"></i><i class="art-orb"></i><i class="art-cloud"></i><i class="art-drops"></i></span>';
}
