// Run with node --env-file=.env.local --experimental-strip-types.
// Export contact data only to a private destination outside the repository.
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@libsql/client';
import { AGENCY_SCHEMA } from '../src/lib/agency/service.ts';
const db = createClient({ url: process.env.TURSO_DATABASE_URL?.trim(), authToken: process.env.TURSO_AUTH_TOKEN?.trim() });
const command = process.argv[2];
try {
  if (command === 'migrate') {
    await db.batch(AGENCY_SCHEMA.map(sql => ({sql,args:[]})), 'write');
    const tables = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'agency_%'");
    console.log(JSON.stringify({tables:tables.rows.map(r=>r.name)}));
  } else if (command === 'status') {
    const applications = await db.execute('SELECT is_test,qualified,count(*) AS count FROM agency_applications GROUP BY is_test,qualified');
    const effects = await db.execute('SELECT kind,state,count(*) AS count FROM agency_effects GROUP BY kind,state');
    const bookings = await db.execute('SELECT state,count(*) AS count FROM agency_bookings GROUP BY state');
    console.log(JSON.stringify({applications:applications.rows,effects:effects.rows,bookings:bookings.rows}));
  } else if (command === 'export') {
    const destination = path.resolve(process.argv[3] ?? '');
    const relative = path.relative(process.cwd(), destination);
    if (!process.argv[3] || (!relative.startsWith('..' + path.sep) && relative !== '..')) throw Error('Choose a private export destination outside this repository');
    const rows = (await db.execute("SELECT a.id,a.created_at,a.email,a.business_name,a.qualified,a.data,b.state AS booking_state,b.start FROM agency_applications a LEFT JOIN agency_bookings b ON b.application_id=a.id WHERE a.is_test=0 ORDER BY a.created_at DESC")).rows;
    const cell = v => '"' + String(v ?? '').replaceAll('"','""').replace(/^[=+@-]/,"'$&") + '"';
    const columns = ['id','created_at','email','business_name','qualified','booking_state','start','name','phone','open_locations','attribution'];
    const content = [columns.map(cell).join(','), ...rows.map(r=>{const d=JSON.parse(r.data); return [r.id,r.created_at,r.email,r.business_name,r.qualified,r.booking_state,r.start,d.personName,d.phone,d.openLocations,JSON.stringify(d.attribution)].map(cell).join(',');})].join('\n');
    fs.writeFileSync(destination,content,{mode:0o600,flag:'wx'}); console.log(JSON.stringify({exported:rows.length,destination}));
  } else throw Error('Usage: agency-operations.mjs migrate | status | export PRIVATE_FILE');
} finally { db.close(); }
