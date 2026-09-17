// H6: experimental estimate, disabled until density AND field validation exist.
export const ARRIVAL_FEATURES={enabled:false,fieldValidated:false};
export function arrivalEstimate({activePeople,concordantReports,distanceKm,windKmh,angleRadians}){
 if(!ARRIVAL_FEATURES.enabled||!ARRIVAL_FEATURES.fieldValidated||activePeople<100||concordantReports<2)return null;
 if(![distanceKm,windKmh,angleRadians].every(Number.isFinite)||distanceKm<=0||windKmh<=0)return null;
 const component=Math.cos(angleRadians);if(component<=.5)return null;
 const minutes=60*distanceKm/(windKmh*component);
 return minutes>=5&&minutes<=45?Math.round(minutes):null;
}
