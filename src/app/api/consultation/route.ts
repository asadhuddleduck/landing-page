import { checkout, changeCall, slots, promo, reconcile, orderFor, book, limit, ConsultationError } from '@/lib/consultation';
import {consultationCheckoutReady} from '@/lib/consultation-stripe';
import { plans, type Plan } from '@/lib/consultation-plans';
export const runtime='nodejs';
export async function POST(req:Request){try{
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)throw new ConsultationError(403,'Please book through our website.');
 const text=await req.text();if(text.length>6000)throw new ConsultationError(413,'Please shorten your question.');
 const b=JSON.parse(text);const token=req.headers.get('authorization')?.replace(/^Bearer /,'')??'';
 if(['checkout','promo'].includes(b.action)&&!consultationCheckoutReady())throw new ConsultationError(503,'Online booking is temporarily unavailable. Please email hello@asadshah.co.uk to arrange your conversation.');
 if(['checkout','promo'].includes(b.action))await limit(req.headers.get('x-forwarded-for')?.split(',')[0]??'unknown');
 let result;
 if(b.action==='slots'){if(!(Object.hasOwn(plans,b.plan)))throw new ConsultationError(400,'Choose a package.');const minutes=b.followup?20:plans[b.plan as Plan].minutes;result={slots:await slots(minutes,b.timezone)};}
 else if(b.action==='promo'){if(!(Object.hasOwn(plans,b.plan)))throw new ConsultationError(400,'Choose a package.');const p=await promo(String(b.code??''),b.plan);const c=p?.promotion.coupon;result={valid:!!p,percent:c&&typeof c==='object'?c.percent_off:null};}
 else if(b.action==='checkout')result=await checkout(b,token);
 else if(b.action==='status')result=await reconcile(token);
 else if(b.action==='change'){result=await changeCall(token,String(b.id),b.start?String(b.start):undefined);}
 else if(b.action==='book'){await book(await orderFor(token),String(b.start));result=await reconcile(token);}
 else throw new ConsultationError(400,'Unknown request.');
 return Response.json(result,{headers:{'Cache-Control':'no-store'}});
 }catch(e){return Response.json({error:e instanceof ConsultationError?e.message:'We could not complete that step. Your existing purchase is safe. Please try again or email hello@asadshah.co.uk.'},{status:e instanceof ConsultationError?e.status:503});}}
