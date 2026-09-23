import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {providerMarkup,providerBrief} from './dist/map-provider.js';
let calls=0,quotaCalls=0,fail=false,epoch=Date.now()/1000;
const api=vm.runInNewContext(fs.readFileSync('server/weather-provider.js','utf8')+';({weatherProviderCurrent})',{
 Date,Intl,URLSearchParams,weatherApiValues:()=>({}),weatherProviderBudget:async()=>{quotaCalls++;},globeSnapshot:async(e,key,fn,ttl)=>{assert.equal(ttl,300000);return fn();},
 quota:async(e,user,type,max)=>{quotaCalls++;assert.equal(max,3000);},
 atmoFetch:async url=>{calls++;if(fail)throw Error('SECRET leaked upstream URL');assert.equal(new URL(url).hostname,'api.weatherapi.com');return {location:{tz_id:'Asia/Tokyo'},current:{last_updated_epoch:epoch,temp_c:0,condition:{text:'<script>bad</script>'},humidity:0,air_quality:{pm2_5:0}}};}
});
const place={key:'35.68,139.69'};
assert.equal((await api.weatherProviderCurrent({},place)).status,'not-configured');assert.equal(calls,0);
let data=await api.weatherProviderCurrent({WEATHERAPI_KEY:'test-only'},place);
assert.equal(data.status,'available');assert.ok(providerBrief({name:'Tokyo'},data).includes('WEATHERAPI'));assert.equal(providerBrief({name:'Tokyo'},{status:'not-configured'}),'');assert.equal(data.temperature,0);assert.equal(data.wind,null);assert.equal(data.pm25,0);assert.equal(quotaCalls,1);
assert.ok(!JSON.stringify(data).includes('test-only'));
let html=providerMarkup(data);assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));assert.ok(html.includes('Asia/Tokyo'));assert.ok(html.includes('0°'));
epoch-=7200;data=await api.weatherProviderCurrent({WEATHERAPI_KEY:'test-only'},place);assert.equal(data.status,'stale');assert.ok(providerMarkup(data).includes('DATO PRECEDENTE'));
epoch=Date.now()/1000+3600;assert.equal((await api.weatherProviderCurrent({WEATHERAPI_KEY:'test-only'},place)).status,'stale');
fail=true;data=await api.weatherProviderCurrent({WEATHERAPI_KEY:'test-only'},place);assert.equal(data.status,'unavailable');assert.ok(!JSON.stringify(data).includes('SECRET'));assert.ok(!providerMarkup(data).includes('NaN'));assert.equal(providerMarkup({status:'not-configured'}),'');
console.log('Provider: optional key, bounded calls, zero/missing values, UTC epoch, stale/future data, sanitization and safe failure passed.');
