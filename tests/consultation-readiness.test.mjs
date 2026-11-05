import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import ts from 'typescript';
import {readFileSync} from 'node:fs';

async function route(ready){
 const calls=[];
 class ConsultationError extends Error{constructor(status,message){super(message);this.status=status;}}
 const mocks={
  '@/lib/consultation-stripe':{consultationCheckoutReady:()=>ready},
  '@/lib/consultation-plans':{plans:{clarity:{minutes:20}}},
  '@/lib/consultation':{ConsultationError,limit:async()=>calls.push('limit'),promo:async()=>{calls.push('promo');return{promotion:{coupon:{percent_off:100}}};},checkout:async()=>{calls.push('checkout');return{};},slots:async()=>['2026-12-01T10:00:00.000Z'],reconcile:async()=>({paid:true}),changeCall:async()=>{},orderFor:async()=>({}),book:async()=>{}}
 };
 const context=vm.createContext({Request,Response,URL,console});
 const code=ts.transpileModule(readFileSync('src/app/api/consultation/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
 const module=new vm.SourceTextModule(code,{context});await module.link(async name=>{const values=mocks[name];return new vm.SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);},{context});});await module.evaluate();
 return{calls,post:body=>module.namespace.POST(new Request('https://huddleduck.co.uk/api/consultation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}))};
}
test('unconfigured payment actions fail clearly before database or Stripe calls',async()=>{for(const action of ['promo','checkout']){const r=await route(false),response=await r.post({action,plan:'clarity',code:'FAMILY250'});assert.equal(response.status,503);assert.match((await response.json()).error,/Online booking is temporarily unavailable/);assert.deepEqual(r.calls,[]);}});
test('availability and existing booking management remain available during payment outage',async()=>{const r=await route(false);assert.equal((await r.post({action:'slots',plan:'clarity',timezone:'Europe/London'})).status,200);assert.equal((await r.post({action:'status'})).status,200);});
test('configured checkout validates the invitation through the provider',async()=>{const r=await route(true),response=await r.post({action:'promo',plan:'clarity',code:'FAMILY250'});assert.equal(response.status,200);assert.equal((await response.json()).percent,100);assert.deepEqual(r.calls,['limit','promo']);});
