"""Refresh USNO UTC season boundaries. Run from the repository; no runtime network dependency."""
import json, urllib.request, concurrent.futures
from pathlib import Path
def year_data(year):
    url=f'https://aa.usno.navy.mil/api/seasons?year={year}'
    with urllib.request.urlopen(url, timeout=45) as response:
        data=json.load(response)
    events=[f'{x["year"]:04d}-{x["month"]:02d}-{x["day"]:02d}T{x["time"]}:00Z' for x in data['data'] if x['phenom'] in ('Equinox','Solstice')]
    assert len(events)==4 and events==sorted(events)
    return str(year),events
if __name__=='__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        years=dict(pool.map(year_data, range(2025,2041)))
    target=Path(__file__).resolve().parents[1]/'dist/season-dates.js'
    target.write_text('// USNO: https://aa.usno.navy.mil/data/Earth_Seasons — UTC, minute resolution.\nexport const SEASON_DATES='+json.dumps(years,indent=2)+';\n',encoding='utf-8',newline='\n')
    print('USNO season boundaries saved: 2025–2040.')
