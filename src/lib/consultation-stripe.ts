import Stripe from 'stripe';
import {getStripe} from './stripe';
let client:Stripe|undefined;
export function consultationStripe(account?:string):Stripe {
 if(account && account===process.env.HUDDLE_STRIPE_ACCOUNT_ID?.trim())return getStripe();
 if(account && account!==process.env.CONSULT_STRIPE_ACCOUNT_ID?.trim())throw new Error('Unknown consultation merchant');
 const key=process.env.CONSULT_STRIPE_SECRET_KEY?.trim();
 if(!key||!process.env.CONSULT_STRIPE_ACCOUNT_ID)throw new Error('Consulting checkout is temporarily unavailable');
 return client??=new Stripe(key,{httpClient:Stripe.createFetchHttpClient()});
}
export function consultationPublicKey(account?:string){return account&&account===process.env.HUDDLE_STRIPE_ACCOUNT_ID?.trim()?process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim():process.env.CONSULT_STRIPE_PUBLISHABLE_KEY?.trim();}
