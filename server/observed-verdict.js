// B2 comparison core. Not wired to production until a local observation adapter
// and scheduled immutable forecast capture are validated. All times are UTC ms.
const HOUR = 3600000;
const finite = Number.isFinite;

/**
 * Trusted server inputs only; never pass client-submitted observations here.
 * snapshot: {id, stationId, capturedAt, slots:[{at,tempC,rainMm}]}
 * observations: [{stationId,at,receivedAt,temp:{value,source,kind},
 *                rain:{value,source,kind,start}}]
 * rain is millimetres accumulated in (at - 1 hour, at]. Temperature is °C.
 * allowedSources is per variable and must be populated by a validated adapter.
 * A provider name alone is NOT proof of observational provenance.
 */
export function observedVerdict(snapshot, observations, {
  now, allowedSources, rainThresholdMm
} = {}) {
  if (!finite(now) || !finite(rainThresholdMm) || rainThresholdMm < 0)
    throw new TypeError('Explicit evaluation time and validated rain threshold required');
  if (!snapshot?.id || !snapshot.stationId || !finite(snapshot.capturedAt) ||
      snapshot.capturedAt > now || snapshot.slots?.length !== 5 ||
      !Array.isArray(observations))
    throw new TypeError('An identified forecast snapshot with five slots is required');
  const times = snapshot.slots.map(s => s.at);
  if (times.some(t => !finite(t) || t % HOUR !== 0 || t - HOUR < snapshot.capturedAt) ||
      new Set(times).size !== 5)
    throw new TypeError('Slots must be distinct hours forecast before their rain window');

  const rows = snapshot.slots.map(slot => {
    const candidates = observations.filter(o => o.stationId === snapshot.stationId &&
      o.at === slot.at && o.at <= now && finite(o.receivedAt) &&
      o.receivedAt >= o.at && o.receivedAt <= now);
    const result = {at: slot.at};
    for (const variable of ['temp', 'rain']) {
      const forecast = slot[variable === 'temp' ? 'tempC' : 'rainMm'];
      const missing = reason => ({status: 'unavailable', reason});
      if (!finite(forecast) || (variable === 'rain' && forecast < 0)) {
        result[variable] = missing('missing_forecast');
        continue;
      }
      if (slot.at > now) {
        result[variable] = missing('future_hour');
        continue;
      }
      const valid = candidates.filter(o => {
        const m = o[variable];
        return m?.kind === 'observation' && finite(m.value) &&
          allowedSources?.[variable]?.includes(m.source) &&
          (variable !== 'rain' || (m.value >= 0 && m.start === slot.at - HOUR));
      });
      // Multiple candidates are not silently resolved by array order. The
      // adapter must select a documented revision before asking for a verdict.
      if (valid.length !== 1) {
        result[variable] = missing(valid.length ? 'ambiguous_observation' : 'missing_observation');
        continue;
      }
      const record = valid[0], measurement = record[variable];
      const delta = measurement.value - forecast;
      result[variable] = {
        status: 'compared', forecast, observed: measurement.value,
        error: variable === 'temp' ? Math.abs(delta) > 3 :
          (forecast > rainThresholdMm) !== (measurement.value > rainThresholdMm),
        source: measurement.source, receivedAt: record.receivedAt,
        ...(variable === 'temp' ? {deltaC: delta} : {start: measurement.start})
      };
    }
    result.complete = result.temp.status === 'compared' && result.rain.status === 'compared';
    return result;
  });
  const summary = variable => {
    const compared = rows.filter(r => r[variable].status === 'compared');
    return {compared: compared.length, errors: compared.filter(r => r[variable].error).length};
  };
  const complete = rows.filter(r => r.complete);
  const temperature = summary('temp'), rain = summary('rain');
  return {
    snapshotId: snapshot.id, stationId: snapshot.stationId, evaluatedAt: now,
    capturedAt: snapshot.capturedAt, rainThresholdMm, temperatureThresholdC: 3,
    status: complete.length === 5 ? 'complete' :
      temperature.compared || rain.compared ? 'partial' : 'unavailable',
    temperature, rain,
    slots: {expected: 5, compared: complete.length,
      errors: complete.filter(r => r.temp.error || r.rain.error).length},
    rows
  };
}
