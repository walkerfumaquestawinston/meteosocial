export const CLIMATE_LAYERS=[
 {id:'meteo',label:'Quadro meteo',kind:'model'},
 {id:'radar',label:'Radar · pioggia e neve',kind:'radar'},
 {id:'grandine',label:'Grandine segnalata',kind:'community'},
 {id:'segnalazioni',label:'Altre segnalazioni',kind:'community'},
 {id:'pioggia',label:'Precipitazioni totali',field:'precipitation',unit:' mm',decimals:1,kind:'model'},
 {id:'rain',label:'Pioggia',field:'rain',unit:' mm',decimals:1,kind:'model'},
 {id:'rovesci',label:'Rovesci',field:'showers',unit:' mm',decimals:1,kind:'model'},
 {id:'neve',label:'Neve',field:'snowfall',unit:' cm',decimals:1,kind:'model'},
 {id:'vento',label:'Vento',field:'wind_speed_10m',unit:' km/h',kind:'model'},
 {id:'raffiche',label:'Raffiche',field:'wind_gusts_10m',unit:' km/h',kind:'model'},
 {id:'nuvole',label:'Nuvole',field:'cloud_cover',unit:'%',kind:'model'},
 {id:'temperatura',label:'Temperatura',field:'temperature_2m',unit:'°',kind:'model'},
 {id:'umidita',label:'Umidità',field:'relative_humidity_2m',unit:'%',kind:'model'},
 {id:'pressione',label:'Pressione al suolo',field:'surface_pressure',unit:' hPa',kind:'model'}
];
