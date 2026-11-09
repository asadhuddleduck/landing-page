import { randomBytes, createHash, createCipheriv, createDecipheriv } from 'node:crypto';
import { db } from './db';
import {consultationStripe,consultationPublicKey} from './consultation-stripe';
import { plans, type Plan } from './consultation-plans';
import { landingPageEmailSource } from './email-source';
import { z } from 'zod';
export class ConsultationError extends Error { constructor(public status:number,message:string){super(message);} }
const input=z.object({plan:z.enum(['clarity','deep','advisory']),start:z.string().datetime(),name:z.string().trim().min(2).max(100),email:z.string().trim().email().max(254),timezone:z.string().max(80),code:z.string().trim().max(80).default(''),question:z.string().max(2000).default(''),requestId:z.string().uuid()});
type Order={id:string;token_hash:string;plan:Plan;name:string;email:string;timezone:string;question:string;start:string;session_id:string|null;paid:number;total:number;first_start:string|null;created:string;token_box:string;reservation_uid:string|null;stripe_account_id:string;token_key_version:number};
type Call={id:string;order_id:string;idx:number;start:string;minutes:number;uid:string|null;state:string;url:string|null};
const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
function tokenKey(version=2){const key=version===1?process.env.STRIPE_SECRET_KEY?.trim():process.env.CONSULT_BOOKING_TOKEN_KEY?.trim();if(!key)throw new Error('Booking encryption key missing');return Buffer.from(hash(key),'hex');}
function seal(token:string){const iv=randomBytes(12),c=createCipheriv('aes-256-gcm',tokenKey(),iv);const data=Buffer.concat([c.update(token),c.final()]);return Buffer.concat([iv,c.getAuthTag(),data]).toString('base64');}
function unseal(box:string,version=1){const b=Buffer.from(box,'base64'),d=createDecipheriv('aes-256-gcm',tokenKey(version),b.subarray(0,12));d.setAuthTag(b.subarray(12,28));return Buffer.concat([d.update(b.subarray(28)),d.final()]).toString();}

export const eventId=(minutes:number)=>Number(process.env[minutes===20?'CONSULT_CAL_20_ID':'CONSULT_CAL_60_ID']);
let ready:Promise<unknown>|undefined;
export function init(){return ready??=(async()=>{await db.batch([
 `CREATE TABLE IF NOT EXISTS consultation_orders(id TEXT PRIMARY KEY,token_hash TEXT NOT NULL,plan TEXT NOT NULL,name TEXT NOT NULL,email TEXT NOT NULL,timezone TEXT NOT NULL,question TEXT NOT NULL,start TEXT NOT NULL,session_id TEXT,paid INTEGER DEFAULT 0,total INTEGER NOT NULL,first_start TEXT,token_box TEXT NOT NULL,reservation_uid TEXT,created TEXT DEFAULT CURRENT_TIMESTAMP)`,
 `CREATE TABLE IF NOT EXISTS consultation_calls(id TEXT PRIMARY KEY,order_id TEXT NOT NULL,idx INTEGER NOT NULL,start TEXT NOT NULL,minutes INTEGER NOT NULL,uid TEXT,state TEXT NOT NULL,url TEXT,updated TEXT DEFAULT CURRENT_TIMESTAMP,UNIQUE(order_id,idx))`,
 `CREATE TABLE IF NOT EXISTS consultation_limits(key TEXT PRIMARY KEY,count INTEGER NOT NULL,expires INTEGER NOT NULL)`],'write');
 const cols=(await db.execute('PRAGMA table_info(consultation_orders)')).rows.map(r=>r.name);
 if(!cols.includes('stripe_account_id'))await db.execute("ALTER TABLE consultation_orders ADD COLUMN stripe_account_id TEXT NOT NULL DEFAULT ''");
 if(!cols.includes('token_key_version'))await db.execute('ALTER TABLE consultation_orders ADD COLUMN token_key_version INTEGER NOT NULL DEFAULT 1');
 if(process.env.HUDDLE_STRIPE_ACCOUNT_ID)await db.execute({sql: "UPDATE consultation_orders SET stripe_account_id=? WHERE stripe_account_id=''",args:[process.env.HUDDLE_STRIPE_ACCOUNT_ID.trim()]});
 })().catch(e=>{ready=undefined;throw e;});}
export async function cal(path:string,method='GET',body?:unknown,version?:string){
 if(!process.env.CAL_API_KEY)throw new ConsultationError(503,'Calendar is temporarily unavailable.');
 const r=await fetch('https://api.cal.com/v2'+path,{method,cache:'no-store',signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${process.env.CAL_API_KEY?.trim()}`,'Content-Type':'application/json','cal-api-version':version??(path.startsWith('/slots')?'2024-09-04':'2026-02-25')},...(body?{body:JSON.stringify(body)}:{})});
 if(r.status===204)return {};
 const result=await r.json(); if(!r.ok||result.status!=='success')throw new ConsultationError(r.status>=400&&r.status<500?409:503,'The calendar could not complete that step. Please try again.'); return result.data;
}
export async function slots(minutes:number,timezone:string){
 if(!eventId(minutes))throw new ConsultationError(503,'Booking is being prepared. Please email hello@asadshah.co.uk.');
 try{new Intl.DateTimeFormat('en',{timeZone:timezone});}catch{throw new ConsultationError(400,'Please select a valid timezone.');}
 const q=new URLSearchParams({eventTypeId:String(eventId(minutes)),start:new Date().toISOString(),end:new Date(Date.now()+30*86400000).toISOString(),timeZone:timezone});
 const data=await cal('/slots?'+q);return Object.values(data).flatMap(v=>Array.isArray(v)?v:[]).map((v)=>typeof v==='string'?v:v.start??v.time).filter((s:string)=>Date.parse(s)>Date.now()+24*3600000).map((s:string)=>new Date(s).toISOString());
}
export async function limit(key:string){await init();const now=Date.now();await db.execute({sql:'DELETE FROM consultation_limits WHERE expires<?',args:[now]});const r=await db.execute({sql:'INSERT INTO consultation_limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count',args:[hash(key),now+600000]});if(Number(r.rows[0].count)>25)throw new ConsultationError(429,'Please wait a few minutes before trying again.');}
export async function promo(code:string,plan:Plan){
 if(!code)return null;
 const stripe=consultationStripe();
 const results=await stripe.promotionCodes.list({code,active:true,limit:10});
 const p=results.data[0];if(!p)throw new ConsultationError(400,'That code is not available. Please check it and try again.');
 const ref=p.promotion.coupon;if(!ref)throw new ConsultationError(400,'That code is not available.');
 const coupon=await stripe.coupons.retrieve(typeof ref==='string'?ref:ref.id,{expand:['applies_to']});
 const product=process.env[`CONSULT_PRODUCT_${plan.toUpperCase()}`];
 if(!coupon||!coupon.valid||!product||!coupon.applies_to?.products?.includes(product))throw new ConsultationError(400,'That code does not apply to this conversation.');
 p.promotion.coupon=coupon; return p;
}
export async function orderFor(token:string){await init();if(!/^[a-f0-9]{64}$/.test(token))throw new ConsultationError(401,'Please use your private booking link.');const r=await db.execute({sql:'SELECT * FROM consultation_orders WHERE token_hash=?',args:[hash(token)]});if(!r.rows[0])throw new ConsultationError(404,'Booking not found.');return r.rows[0] as unknown as Order;}
export async function checkout(raw:unknown,token:string){
 const stripe=consultationStripe();
 const parsed=input.safeParse(raw);if(!parsed.success)throw new ConsultationError(400,'Please check your name, email and chosen time.');const p=parsed.data;
 if(!/^[a-f0-9]{64}$/.test(token))throw new ConsultationError(400,'Please reload and try again.');
 await init(); const existing=await db.execute({sql:'SELECT * FROM consultation_orders WHERE id=?',args:[p.requestId]});
 if(existing.rows[0]){const o=await orderFor(token);if(o.plan!==p.plan||o.start!==p.start||o.email!==p.email.toLowerCase())throw new ConsultationError(409,'Checkout already started. Reload to choose a different package or time.');if(o.id!==p.requestId)throw new ConsultationError(403,'Please reload and try again.');if(o.session_id){const s=await consultationStripe(o.stripe_account_id).checkout.sessions.retrieve(o.session_id);if(s.status==='open'&&o.stripe_account_id!==process.env.CONSULT_STRIPE_ACCOUNT_ID)throw new ConsultationError(409,'Please reload to restart checkout with the consulting business.');if(s.status==='open')return {clientSecret:s.client_secret,publishableKey:consultationPublicKey(o.stripe_account_id)};if(s.status==='complete')return {complete:true};throw new ConsultationError(409,'Checkout expired. Reload to choose a time again.');}}
 if(existing.rows[0]?.reservation_uid)await cal('/slots/reservations/'+encodeURIComponent(String(existing.rows[0].reservation_uid)),'DELETE').catch(()=>{});
 const available=await slots(plans[p.plan].minutes,p.timezone);if(!available.includes(p.start))throw new ConsultationError(409,'That time is no longer available. Please choose another.');
 const promotion=await promo(p.code,p.plan);
 const price=process.env[`CONSULT_PRICE_${p.plan.toUpperCase()}`];if(!price)throw new ConsultationError(503,'Checkout is temporarily unavailable.');
 await db.execute({sql:'INSERT INTO consultation_orders(id,token_hash,plan,name,email,timezone,question,start,total,token_box,stripe_account_id,token_key_version) VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING',args:[p.requestId,hash(token),p.plan,p.name,p.email.toLowerCase(),p.timezone,p.question,p.start,plans[p.plan].price,seal(token),process.env.CONSULT_STRIPE_ACCOUNT_ID!.trim(),2]});
 // Stripe handles price, promotion redemption limits and zero-total orders authoritatively.
 const hold=await cal('/slots/reservations','POST',{eventTypeId:eventId(plans[p.plan].minutes),slotStart:p.start,reservationDuration:30});
 await db.execute({sql:'UPDATE consultation_orders SET reservation_uid=? WHERE id=?',args:[hold.reservationUid,p.requestId]});
 const s=await stripe.checkout.sessions.create({ui_mode:'embedded',mode:'payment',automatic_tax:{enabled:false},customer_creation:'always',invoice_creation:{enabled:!(promotion?.promotion.coupon&&typeof promotion.promotion.coupon==='object'&&promotion.promotion.coupon.percent_off===100),invoice_data:{footer:'Asad Social Media Ltd | Company 11747989 | hello@asadshah.co.uk'}},payment_intent_data:{receipt_email:p.email},payment_method_types:['card'],customer_email:p.email,line_items:[{price,quantity:1}],...(promotion?{discounts:[{promotion_code:promotion.id}]}:{}),return_url:'https://asadshah.co.uk/#booking='+token,redirect_on_completion:'if_required',metadata:{product:'asad-consultation',order_id:p.requestId},expires_at:Math.floor(Date.now()/1000)+1800},{idempotencyKey:'consultation-'+p.requestId});
 await db.execute({sql:'UPDATE consultation_orders SET session_id=? WHERE id=?',args:[s.id,p.requestId]});return {clientSecret:s.client_secret,publishableKey:consultationPublicKey()};
}
async function lookup(o:Order,c:Call){
 let cursor='';for(let page=0;page<20;page++){
 const q=new URLSearchParams({attendeeEmail:o.email,eventTypeId:String(eventId(c.minutes)),limit:'100',...(cursor?{cursor}:{})});
 const r=await fetch('https://api.cal.com/v2/bookings?'+q,{headers:{Authorization:'Bearer '+process.env.CAL_API_KEY?.trim(),'cal-api-version':'2026-05-01'},cache:'no-store',signal:AbortSignal.timeout(20000)});
 const j=await r.json();if(!r.ok||j.status!=='success'||!Array.isArray(j.data))throw new ConsultationError(503,'We are checking your booking.');
 const found=j.data.find((b:{metadata?:Record<string,string>})=>b.metadata?.consultationCallId===c.id);if(found)return found;
 if(!j.pagination?.hasMore)return null;cursor=j.pagination.nextCursor;
 }throw new ConsultationError(503,'We are checking your booking.');
}
async function confirmNative(o:Order,c:Call,b:Record<string,unknown>){
 if((b.metadata as Record<string,string>)?.consultationCallId!==c.id)throw new ConsultationError(503,'Booking reference did not match.');
 const hosts=b.hosts as {id:number}[];const attendees=b.attendees as {email:string}[];
 if(Number(b.eventTypeId)!==eventId(c.minutes)||!hosts?.some(h=>String(h.id)===process.env.AGENCY_CAL_OWNER_ID?.trim())||!attendees?.some(a=>a.email.toLowerCase()===o.email)||Date.parse(String(b.end))-Date.parse(String(b.start))!==c.minutes*60000)throw new ConsultationError(503,'Booking verification needs attention. Your purchase is safe.');
 const uid=String(b.uid);
 await db.execute({sql:'UPDATE consultation_calls SET uid=? WHERE id=?',args:[uid,c.id]});
 if(String(b.status).toLowerCase()!=='accepted')await cal(`/bookings/${encodeURIComponent(uid)}/confirm`,'POST');
 const verified=await cal(`/bookings/${encodeURIComponent(uid)}`);
 if(String(verified.status).toLowerCase()!=='accepted')throw new ConsultationError(503,'Your booking is awaiting confirmation.');
 await db.execute({sql:"UPDATE consultation_calls SET state='accepted',url=?,updated=CURRENT_TIMESTAMP WHERE id=?",args:[String(verified.meetingUrl??verified.location??''),c.id]});
 await db.execute({sql:'UPDATE consultation_orders SET first_start=COALESCE(first_start,?) WHERE id=?',args:[c.start,o.id]});
}
export async function book(o:Order,start:string){
 if(o.paid!==1)throw new ConsultationError(403,'Please complete checkout first.');
 const calls=(await db.execute({sql:'SELECT * FROM consultation_calls WHERE order_id=? ORDER BY idx',args:[o.id]})).rows as unknown as Call[];
 const pending=calls.find(c=>c.state==='creating');
 if(pending){const found=pending.uid?await cal('/bookings/'+encodeURIComponent(pending.uid)):await lookup(o,pending);if(found)await confirmNative(o,pending,found);else throw new ConsultationError(409,'We are checking your earlier booking attempt. Please email hello@asadshah.co.uk before trying again.');return;}
 const used=calls.filter(c=>c.state!=='cancelled').length;
 const idx=Array.from({length:plans[o.plan].calls},(_,i)=>i).find(i=>!calls.some(c=>c.idx===i&&c.state!=='cancelled'))??plans[o.plan].calls;
 if(used>=plans[o.plan].calls)throw new ConsultationError(400,'All your sessions have been booked.');
 const minutes=plans[o.plan].minutes;
 if(o.first_start){const until=Date.parse(o.first_start)+(o.plan==='deep'?30:90)*86400000;if(Date.parse(start)>until||Date.parse(start)<=Date.parse(o.first_start))throw new ConsultationError(400,'Please choose a time within your package period after the first call.');}
 if(o.reservation_uid){await cal('/slots/reservations/'+encodeURIComponent(o.reservation_uid),'DELETE').catch(()=>{});await db.execute({sql:'UPDATE consultation_orders SET reservation_uid=NULL WHERE id=?',args:[o.id]});}
 const available=await slots(minutes,o.timezone);if(!available.includes(start))throw new ConsultationError(409,'That time is no longer available. Please choose another.');
 const id=randomBytes(16).toString('hex');
 // A unique position is the atomic guard against double booking across workers.
 const r=await db.execute({sql:"INSERT INTO consultation_calls(id,order_id,idx,start,minutes,state) VALUES(?,?,?,?,?,'creating') ON CONFLICT(order_id,idx) DO UPDATE SET id=excluded.id,start=excluded.start,minutes=excluded.minutes,state='creating',uid=NULL,url=NULL WHERE consultation_calls.state='cancelled'",args:[id,o.id,idx,start,minutes]});if(!r.rowsAffected)throw new ConsultationError(409,'Your booking is already being processed.');
 const c={id,order_id:o.id,idx,start,minutes,uid:null,state:'creating',url:null};
 try{const b=await cal('/bookings','POST',{eventTypeId:eventId(minutes),start,attendee:{name:o.name,email:o.email,timeZone:o.timezone,language:'en'},bookingFieldsResponses:{notes:o.question+'\nManage your consultation: https://asadshah.co.uk/#booking='+unseal(o.token_box,o.token_key_version)+'\nQuestions: hello@asadshah.co.uk'},metadata:{consultationCallId:id,consultationOrderId:o.id}});await confirmNative(o,c,b);}catch(e){if(e instanceof ConsultationError&&e.status===409)await db.execute({sql:"UPDATE consultation_calls SET state='cancelled' WHERE id=? AND uid IS NULL",args:[id]});throw e;}
}
export async function changeCall(token:string,id:string,start?:string){
 const o=await orderFor(token);if(o.paid!==1)throw new ConsultationError(403,'No paid booking found.');
 const c=(await db.execute({sql:"SELECT * FROM consultation_calls WHERE id=? AND order_id=? AND state='accepted'",args:[id,o.id]})).rows[0] as unknown as Call;
 if(!c||!c.uid)throw new ConsultationError(404,'Confirmed conversation not found.');
 if(Date.parse(c.start)<Date.now()+24*3600000)throw new ConsultationError(400,'Please email Asad to change a call within 24 hours.');
 if(start){
 if(o.first_start&&c.idx>0&&(Date.parse(start)<=Date.parse(o.first_start)||Date.parse(start)>Date.parse(o.first_start)+(o.plan==='deep'?30:90)*86400000))throw new ConsultationError(400,'Choose a time within your package period.');
 if(!(await slots(c.minutes,o.timezone)).includes(start))throw new ConsultationError(409,'That time is unavailable.');
 const b=await cal('/bookings/'+encodeURIComponent(c.uid)+'/reschedule','POST',{start,reschedulingReason:'Requested through private consultation link'});
 await confirmNative(o,{...c,start},b);await db.execute({sql:'UPDATE consultation_calls SET start=? WHERE id=?',args:[start,c.id]});
 if(c.idx===0)await db.execute({sql:'UPDATE consultation_orders SET first_start=? WHERE id=?',args:[start,o.id]});
 }else{
 await cal('/bookings/'+encodeURIComponent(c.uid)+'/cancel','POST',{cancellationReason:'Requested through private consultation link'});
 await db.execute({sql:"UPDATE consultation_calls SET state='cancelled' WHERE id=?",args:[c.id]});if(c.idx===0)await db.execute({sql:'UPDATE consultation_orders SET first_start=NULL WHERE id=?',args:[o.id]});
 }
 return reconcile(token);
}
export async function reconcile(token:string){
 let o=await orderFor(token);
 const stripe=consultationStripe(o.stripe_account_id);
 if(o.paid<0)throw new ConsultationError(403,'This package has been refunded. Please contact Asad if you need help.');
 if(o.session_id&&!o.paid){const s=await stripe.checkout.sessions.retrieve(o.session_id);if(s.status==='complete'&&['paid','no_payment_required'].includes(s.payment_status)&&s.metadata?.product==='asad-consultation'&&s.metadata.order_id===o.id){await db.execute({sql:'UPDATE consultation_orders SET paid=1,total=? WHERE id=?',args:[s.amount_total??0,o.id]});o=await orderFor(token);}}
 if(o.paid){const c=await db.execute({sql:'SELECT id FROM consultation_calls WHERE order_id=?',args:[o.id]});if(c.rows.length===0||(await db.execute({sql:"SELECT id FROM consultation_calls WHERE order_id=? AND state='creating'",args:[o.id]})).rows.length){try{await book(o,o.start);}catch(e){if(!(e instanceof ConsultationError&&e.status===409))throw e;}}}
 const active=(await db.execute({sql:"SELECT * FROM consultation_calls WHERE order_id=? AND state='accepted'",args:[o.id]})).rows as unknown as Call[];
 for(const c of active){if(!c.uid||Date.parse(c.start)<Date.now()-86400000)continue;
 const b=await cal('/bookings/'+encodeURIComponent(c.uid));
 if(b.rescheduledToUid){const moved=await cal('/bookings/'+encodeURIComponent(b.rescheduledToUid));await confirmNative(o,c,moved);await db.execute({sql:'UPDATE consultation_calls SET start=? WHERE id=?',args:[moved.start,c.id]});}
 else if(['cancelled','canceled','rejected'].includes(String(b.status).toLowerCase())){const timely=Date.parse(c.start)-Date.parse(b.updatedAt??new Date().toISOString())>=24*3600000;await db.execute({sql:'UPDATE consultation_calls SET state=? WHERE id=?',args:[timely?'cancelled':'missed',c.id]});}
 }
 const calls=(await db.execute({sql:'SELECT id,idx,start,minutes,uid,state,url FROM consultation_calls WHERE order_id=? ORDER BY idx',args:[o.id]})).rows;
 if(o.stripe_account_id===process.env.HUDDLE_STRIPE_ACCOUNT_ID&&calls.some(c=>c.state==='accepted')){
 const link='https://asadshah.co.uk/#booking='+token;
 await landingPageEmailSource(db).submit({sourceJobId:'consultation-booked-'+o.id,brand:'huddleduck',purpose:'service',to:o.email,category:'consultation-booking',subject:'Your conversation with Asad',text:`Hi ${o.name},\n\nYour booking is confirmed. View your meeting details and manage your remaining sessions here:\n${link}\n\nBefore we speak, reply with your main question and up to three relevant links. I will send a short recap after our conversation.\n\nAsad`}).catch(()=>{});
 }
 return {paid:!!o.paid,plan:o.plan,name:o.name,total:o.total,calls,remaining:plans[o.plan].calls-calls.filter(c=>c.state!=='cancelled').length,timezone:o.timezone};
}

export async function reconcileSession(sessionId:string,account?:string){await init();const row=(await db.execute({sql:'SELECT token_box,token_key_version,stripe_account_id FROM consultation_orders WHERE session_id=?',args:[sessionId]})).rows[0];if(row){if(account&&row.stripe_account_id!==account)throw new Error('Webhook account mismatch');await reconcile(unseal(String(row.token_box),Number(row.token_key_version)));}}
export async function reconcileAll(){await init();const rows=(await db.execute("SELECT session_id FROM consultation_orders WHERE session_id IS NOT NULL AND created>datetime('now','-7 days') ORDER BY created DESC LIMIT 100")).rows;let count=0;for(const r of rows){try{await reconcileSession(String(r.session_id));count++;}catch{/* Leave paid state durable for next retry. */}}return count;}

export async function refundIntent(paymentIntent:string,account=process.env.HUDDLE_STRIPE_ACCOUNT_ID){
 const stripe=consultationStripe(account);
 const sessions=await stripe.checkout.sessions.list({payment_intent:paymentIntent,limit:10});
 for(const session of sessions.data){if(session.metadata?.product!=='asad-consultation')continue;await init();
 const order=(await db.execute({sql:'SELECT id FROM consultation_orders WHERE session_id=? AND stripe_account_id=?',args:[session.id,account??'']})).rows[0];if(!order)continue;
 await db.execute({sql:'UPDATE consultation_orders SET paid=-1 WHERE id=?',args:[order.id]});
 const calls=(await db.execute({sql:"SELECT id,uid FROM consultation_calls WHERE order_id=? AND state IN ('accepted','creating') AND start>?",args:[order.id,new Date().toISOString()]})).rows;
 for(const call of calls){if(call.uid)await cal('/bookings/'+encodeURIComponent(String(call.uid))+'/cancel','POST',{cancellationReason:'Consultation package refunded'});await db.execute({sql:"UPDATE consultation_calls SET state='refunded' WHERE id=?",args:[call.id]});}
 }
}
