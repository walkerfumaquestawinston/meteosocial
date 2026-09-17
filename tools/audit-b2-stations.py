"""Offline audit of official Meteostat downloads; no app or database writes.

Usage: python tools/audit-b2-stations.py stations.db 16230.csv --before 2026-09-17
Coordinates refer to the city, not a person's precise location. Source labels
are reported verbatim: this tool does not certify observations or accuracy.
"""
import argparse
import collections
import csv
import hashlib
import json
import math
from pathlib import Path
import sqlite3

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('stations', type=Path)
parser.add_argument('hourly', type=Path)
parser.add_argument('--before', required=True, help='Exclusive UTC date YYYY-MM-DD')
args = parser.parse_args()

def distance(lat, lon):
    a, b = map(math.radians, (42.95, lat))
    d = math.radians(lon - 13.88)
    h = math.sin((b-a)/2)**2 + math.cos(a)*math.cos(b)*math.sin(d/2)**2
    return round(12742 * math.asin(math.sqrt(min(1, max(0, h)))), 1)

with sqlite3.connect(args.stations.resolve().as_uri() + '?mode=ro', uri=True) as db:
    nearest = sorted([
        {'station': sid, 'country': country, 'km': distance(lat, lon), 'elevation_m': elevation}
        for sid, country, lat, lon, elevation in db.execute(
            'SELECT id,country,latitude,longitude,elevation FROM stations')
        if lat is not None and lon is not None
    ], key=lambda s: s['km'])[:8]

latest = {'temp': {}, 'prcp': {}}
counts = {v: collections.Counter() for v in latest}
with args.hourly.open() as stream:
    for row in csv.DictReader(stream):
        stamp = '%04d-%02d-%02dT%02d:00:00Z' % tuple(
            int(row[k]) for k in ('year', 'month', 'day', 'hour'))
        if stamp >= args.before:
            continue
        for variable in latest:
            if row[variable] == '':
                continue
            source = row[variable + '_source'] or 'unspecified'
            latest[variable][source] = max(stamp, latest[variable].get(source, ''))
            counts[variable][source] += 1

print(json.dumps({
    'city': 'San Benedetto del Tronto', 'coordinates': [42.95, 13.88],
    'before_utc_exclusive': args.before,
    'station_catalog_url': 'https://data.meteostat.net/stations.db',
    'hourly_url': 'https://data.meteostat.net/hourly/2026/16230.csv.gz',
    'input_sha256': {p.name: hashlib.sha256(p.read_bytes()).hexdigest()
                     for p in (args.stations, args.hourly)},
    'nearest_catalog_stations': nearest,
    'pescara_latest_by_source': latest, 'pescara_counts_by_source': counts,
    'limitation': 'Catalog coverage is not all existing stations. Source labels are not verification. No local accuracy score is produced.'
}, indent=2))
