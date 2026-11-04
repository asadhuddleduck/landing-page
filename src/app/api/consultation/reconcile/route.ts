import { reconcileAll } from '@/lib/consultation';
import { equalSecret } from '@/lib/agency/core';
export async function GET(req:Request){if(!equalSecret(req.headers.get('authorization')??'',`Bearer ${process.env.CRON_SECRET?.trim()??''}`)||!process.env.CRON_SECRET)return new Response('Unauthorized',{status:401});return Response.json({reconciled:await reconcileAll()});}
