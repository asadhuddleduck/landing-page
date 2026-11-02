import test from 'node:test';
import assert from 'node:assert/strict';
import { salesCrm } from '../src/lib/sales-crm.ts';

process.env.SALES_CRM_DATABASE_ID = '00000000-0000-4000-8000-000000000001';
process.env.AGENCY_NOTION_TOKEN = 'synthetic-test-token';
const input = { applicationId:'application-1',knownPageId:null,business:'Synthetic Food',name:'Test Owner',email:'owner@example.invalid',phone:'+447700900001',locations:1,instagram:'',notes:'Synthetic form',createdAt:'2026-11-02T10:00:00Z',booked:false };
const t = content => [{plain_text:content,text:{content}}];
function fake(initial=[]) {
  const pages=new Map(initial.map(p=>[p.id,structuredClone(p)])), writes=[];
  let uncertain=false;
  const fetch=async(url,options={})=>{
    const path=new URL(url).pathname, body=options.body?JSON.parse(options.body):null;
    if(path.endsWith('/query')) {
      const {property,...filter}=body.filter, rows=[...pages.values()].filter(p=>{
        const value=p.properties[property];
        if(filter.email)return value?.email===filter.email.equals;
        return (value?.rich_text??[]).map(x=>x.plain_text??x.text?.content??'').join('')===filter.rich_text.equals;
      });
      return Response.json({results:rows,has_more:false});
    }
    if(options.method==='GET')return Response.json(pages.get(path.split('/').at(-1)));
    assert.equal(body.notifications.mode,'silent');
    const id=options.method==='POST'?`page-${pages.size+1}`:path.split('/').at(-1);
    const before=pages.get(id), page={id,parent:body.parent??before?.parent,properties:{...before?.properties,...body.properties}};
    pages.set(id,page);writes.push({id,body});
    if(uncertain){uncertain=false;throw Error('lost acknowledgement');}
    return Response.json(page);
  };
  return {api:salesCrm(fetch),pages,writes,loseNextAcknowledgement(){uncertain=true;}};
}
test('new enquiry goes to the central database and preserves a single-location application',async()=>{
  const f=fake(),id=await f.api.agency(input),p=f.pages.get(id);
  assert.equal(p.parent.database_id,process.env.SALES_CRM_DATABASE_ID);
  assert.equal(p.properties.Business.title[0].text.content,'Synthetic Food');
  assert.equal(p.properties.Locations.number,1);
  assert.equal(p.properties.Status.select.name,'New');
  assert.equal(p.properties['Enquiry offer'].multi_select[0].name,'Huddle Duck');
  assert.equal(p.properties.Phone.phone_number,input.phone);
});
test('lost create acknowledgement is recovered by application identity without a duplicate',async()=>{
  const f=fake();f.loseNextAcknowledgement();await assert.rejects(f.api.agency(input));
  const id=await f.api.agency(input);assert.equal(f.pages.size,1);assert.equal(id,'page-1');
});
test('repeat delivery preserves manual stage, follow-up and audit identity',async()=>{
  const f=fake(),id=await f.api.agency(input),p=f.pages.get(id);
  p.properties.Status={select:{name:'Won'}};
  p.properties['Next step']={rich_text:t('Agreed next action')};
  p.properties['Follow-up']={date:{start:'2026-11-10'}};
  p.properties['Source lead ID']={rich_text:t('audit-1')};
  await f.api.agency({...input,knownPageId:id,booked:true});
  const after=f.pages.get(id).properties;
  assert.equal(after.Status.select.name,'Won');
  assert.equal(after['Next step'].rich_text[0].plain_text,'Agreed next action');
  assert.equal(after['Follow-up'].date.start,'2026-11-10');
  assert.equal(after['Source lead ID'].rich_text[0].plain_text,'audit-1');
  assert.deepEqual(after['Enquiry offer'].multi_select.map(v=>v.name),['Huddle Duck','SuperPulse']);
});
test('existing audit contact matches only the same business and retains contact facts',async()=>{
  const parent={database_id:process.env.SALES_CRM_DATABASE_ID};
  const f=fake([{id:'audit',parent,properties:{Business:{title:t('Synthetic Food')},Email:{email:input.email},Contact:{rich_text:t('Existing Contact')},Locations:{number:3},'Source lead ID':{rich_text:t('audit-source')},Status:{select:{name:'Follow-up'}}}}]);
  assert.equal(await f.api.agency(input),'audit');assert.equal(f.pages.size,1);
  assert.equal(f.pages.get('audit').properties.Locations.number,3);
  assert.equal(f.pages.get('audit').properties.Status.select.name,'Follow-up');
  await f.api.agency({...input,applicationId:'different-app',business:'Separate Business'});
  assert.equal(f.pages.size,2);
});
test('ambiguous business identity stops instead of merging the wrong records',async()=>{
  const p=id=>({id,parent:{database_id:process.env.SALES_CRM_DATABASE_ID},properties:{Business:{title:t(input.business)},Email:{email:input.email}}});
  const f=fake([p('a'),p('b')]);
  await assert.rejects(f.api.agency(input),/Duplicate business contacts/);
  assert.equal(f.writes.length,0);
});
test('purchase uses central record and leaves follow-up and provenance intact',async()=>{
  const f=fake(),id=await f.api.agency(input);
  await f.api.purchase({email:input.email,amount:1300});
  assert.equal(f.pages.size,1);assert.equal(f.pages.get(id).properties.Status.select.name,'Won');
  assert.equal(f.pages.get(id).properties.Value.number,1300);
  assert.equal(f.pages.get(id).properties['Agency application ID'].rich_text[0].text.content,input.applicationId);
});
