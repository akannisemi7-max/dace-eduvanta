/* ============ Supabase cloud layer ============ */
/* Only the publishable (public) key is used here. Security comes from the database rules (Row Level Security).
   Anything needing the secret key (creating accounts, resetting passwords) runs in the admin-users Edge Function. */
const SBK='eduvanta:sb',CACHE='eduvanta:cache',FLAGS='eduvanta:flags';
let SB={tok:null,ref:null,exp:0,uid:null},PUBLIC={name:'D-Ace Ultimate Secondary School',logo:null,owner:false},SNAP={},CUR={},SYNCING=false,SYNC_LABEL='Saved',pollT=null,syncT=null,again=false,refreshing=null,warned={};
const pillText=()=>CLOUD?SYNC_LABEL:(HAS_STORE?'Saved':'Session only');
const pillOff=()=>CLOUD?(/Offline|Not/.test(SYNC_LABEL)?'off':''):(HAS_STORE?'':'off');
const stuEmail=a=>a.trim().toLowerCase().replace(/[^a-z0-9]+/g,'.').replace(/^\.+|\.+$/g,'')+'@'+STU_DOMAIN;
const lsGet=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,v);return true}catch(e){return false}};
const lsDel=k=>{try{localStorage.removeItem(k)}catch(e){}};
function emptyDB(){let flags={};try{flags=JSON.parse(lsGet(FLAGS)||'{}')}catch(e){}
 return{v:3,session:null,theme:lsGet('eduvanta:theme')||((window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light'),schools:[],users:[],classes:[],subjects:[],sessions:[],slots:[],attendance:[],lessons:[],notes:[],notifs:[],audit:[],announce:[],folders:[],activity:[],assessments:[],attempts:[],marks:[],sheets:[],comments:[],termresults:[],akeys:[],flags,config:{free:true,storageCapMB:500,uploadMaxKB:700}}}

/* ---- http ---- */
async function sbReq(path,o={}){
 const{method='GET',body,prefer,auth=true,query,retried}=o,isTok=/\/auth\/v1\/token/.test(path);
 if(auth&&SB.ref&&SB.exp&&Date.now()>SB.exp-60000&&!isTok)await refreshSession();
 const h={apikey:CLOUD_KEY,'Content-Type':'application/json'};if(auth&&SB.tok)h.Authorization='Bearer '+SB.tok;if(prefer)h.Prefer=prefer;
 let r;try{r=await fetch(CLOUD_URL+path+(query?(path.includes('?')?'&':'?')+query:''),{method,headers:h,body:body===undefined?undefined:JSON.stringify(body)})}
 catch(e){const x=new Error('You appear to be offline.');x.network=true;throw x}
 if(r.status===401&&auth&&SB.ref&&!retried&&!isTok){await refreshSession();return sbReq(path,{...o,retried:true})}
 const txt=await r.text();let j=null;try{j=txt?JSON.parse(txt):null}catch(e){j=txt}
 if(!r.ok){const x=new Error((j&&(j.msg||j.message||j.error_description||j.error))||('Request failed ('+r.status+')'));x.status=r.status;x.code=j&&(j.code||j.error_code);throw x}
 return j}
function setSession(j){SB.tok=j.access_token;SB.ref=j.refresh_token||SB.ref;SB.exp=Date.now()+(j.expires_in||3600)*1000;if(j.user&&j.user.id)SB.uid=j.user.id;lsSet(SBK,JSON.stringify(SB))}
function refreshSession(){if(refreshing)return refreshing;refreshing=sbReq('/auth/v1/token',{method:'POST',auth:false,query:'grant_type=refresh_token',body:{refresh_token:SB.ref}}).then(setSession).finally(()=>{refreshing=null});return refreshing}
const authLogin=(email,password)=>sbReq('/auth/v1/token',{method:'POST',auth:false,query:'grant_type=password',body:{email,password}});
const authSignup=(email,password)=>sbReq('/auth/v1/signup',{method:'POST',auth:false,body:{email,password}});
async function adminCall(body){const r=await fetch(CLOUD_URL+'/functions/v1/admin-users',{method:'POST',headers:{'Content-Type':'application/json',apikey:CLOUD_KEY,Authorization:'Bearer '+SB.tok},body:JSON.stringify(body)}).catch(()=>{const x=new Error('You appear to be offline.');x.network=true;throw x});
 const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'The school server could not do that. Check the admin-users function is deployed.');return j}

/* ---- row mapping ---- */
/* Each table keeps a full JSON copy of the record in "data", plus real columns. For anything that matters for
   security (owner, status, scores) the COLUMN is trusted on read ("ov"), never the JSON copy a user could edit. */
const MAPS=[
 {key:'schools',t:'schools',cols:()=>({}),ov:[]},
 {key:'users',t:'profiles',cols:o=>({role:o.role,status:o.status||(o.active?'active':'pending'),active:!!o.active,class_id:o.classId||null,email:o.email||null,name:o.name||null}),
  ov:[['role','role'],['status','status'],['active','active'],['class_id','classId'],['email','email'],['name','name']]},
 {key:'classes',t:'classes',cols:()=>({}),ov:[]},{key:'subjects',t:'subjects',cols:()=>({}),ov:[]},{key:'sessions',t:'sessions',cols:()=>({}),ov:[]},
 {key:'slots',t:'slots',cols:o=>({teacher_id:o.teacherId,class_id:o.classId}),ov:[['teacher_id','teacherId'],['class_id','classId']]},
 {key:'attendance',t:'attendance',cols:o=>({user_id:o.userId,day:o.date}),ov:[['user_id','userId'],['day','date']]},
 {key:'lessons',t:'lessons',cols:o=>({teacher_id:o.teacherId,day:o.date}),ov:[['teacher_id','teacherId'],['day','date']]},
 {key:'notes',t:'lesson_notes',cols:o=>({teacher_id:o.teacherId,status:o.status}),ov:[['teacher_id','teacherId'],['status','status']]},
 {key:'notifs',t:'notifications',cols:o=>({to_user:o.to}),ov:[['to_user','to']]},
 {key:'audit',t:'attendance_audit',cols:()=>({}),ov:[]},{key:'announce',t:'announcements',cols:()=>({}),ov:[]},{key:'activity',t:'activity_log',cols:()=>({}),ov:[]},
 {key:'folders',t:'note_folders',cols:o=>({teacher_id:o.userId}),ov:[['teacher_id','userId']]},
 {key:'assessments',t:'assessments',cols:o=>({teacher_id:o.teacherId,class_id:o.classId,status:o.status}),ov:[['teacher_id','teacherId'],['class_id','classId'],['status','status']]},
 {key:'akeys',t:'assessment_keys',cols:()=>({}),ov:[]},
 {key:'attempts',t:'attempts',cols:o=>({student_id:o.studentId,assessment_id:o.assessmentId,status:o.status,voided:!!o.voided}),
  ov:[['student_id','studentId'],['assessment_id','assessmentId'],['status','status'],['voided','voided'],['score','score'],['total','total'],['late','late'],
      ['submitted_at','submittedAt',v=>v?Date.parse(v):undefined],['started_at','startedAt',v=>v?Date.parse(v):undefined]]},
 {key:'marks',t:'marks',cols:o=>({student_id:o.studentId,class_id:o.classId,subject_id:o.subjectId,session_id:o.sessionId,term:o.term}),
  ov:[['student_id','studentId'],['class_id','classId'],['subject_id','subjectId'],['session_id','sessionId'],['term','term']]},
 {key:'sheets',t:'sheets',cols:o=>({class_id:o.classId,subject_id:o.subjectId,session_id:o.sessionId,term:o.term,status:o.status,teacher_id:o.teacherId||null}),
  ov:[['class_id','classId'],['subject_id','subjectId'],['session_id','sessionId'],['term','term'],['status','status'],['teacher_id','teacherId']]},
 {key:'comments',t:'comments',cols:o=>({student_id:o.studentId}),ov:[['student_id','studentId']]},
 {key:'termresults',t:'termresults',cols:o=>({student_id:o.studentId}),ov:[['student_id','studentId']]}];
function toRow(m,o){const data={...o};delete data.pw;
 if(m.t==='assessments'&&Array.isArray(data.questions))data.questions=data.questions.map(q=>{const c={...q};delete c.answer;return c});   // the answer key never goes in the student-readable row
 return{id:o.id,school_id:m.t==='schools'?o.id:(o.school||'dace'),...m.cols(o),data}}
function fromRow(m,r){const o={...r.data,id:r.id};
 for(const [c,f,cv] of m.ov){const v=r[c];if(v===undefined)continue;if((v===null||v===false)&&o[f]===undefined)continue;const x=cv?cv(v):v;if(x!==undefined)o[f]=x}
 return o}
/* Answer keys live in their own table that students cannot read. Teachers and management merge them back in locally. */
function deriveKeys(){DB.akeys=DB.akeys||[];(DB.assessments||[]).forEach(a=>{const qs=a.questions||[];if(!qs.some(q=>q.answer!==undefined))return;const ans={};qs.forEach(q=>{if(q.answer!==undefined)ans[q.id]=q.answer});
  const k=DB.akeys.find(x=>x.id===a.id);if(!k)DB.akeys.push({id:a.id,school:a.school||'dace',answers:ans});else if(JSON.stringify(k.answers)!==JSON.stringify(ans))k.answers=ans})}
function mergeKeys(){(DB.akeys||[]).forEach(k=>{const a=(DB.assessments||[]).find(x=>x.id===k.id);if(!a)return;(a.questions||[]).forEach(q=>{if(q.answer===undefined&&k.answers&&k.answers[q.id]!==undefined)q.answer=k.answers[q.id]})})}
function hs(s){let a=5381,b=0;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);a=((a<<5)+a+c)|0;b=(Math.imul(b,31)+c)|0}return s.length+':'+a+':'+b}
const rowHash=(m,o)=>hs(JSON.stringify(toRow(m,o)));
const mapOf=k=>MAPS.find(m=>m.key===k);

/* ---- load everything this person is allowed to see ---- */
async function fetchAll(t){const out=[];let off=0;for(;;){const r=await sbReq('/rest/v1/'+t,{query:`select=*&order=id.asc&limit=1000&offset=${off}`});out.push(...r);if(r.length<1000)break;off+=1000}return out}
async function loadRemoteAll(local){
 const res=await Promise.all(MAPS.map(m=>fetchAll(m.t))),base=local||emptyDB();SNAP={};CUR={};
 MAPS.forEach((m,i)=>{const snap=new Map(),have=new Set((base[m.key]||[]).map(o=>o.id));let cur='';if(!local)base[m.key]=[];
  res[i].forEach(r=>{const o=fromRow(m,r);snap.set(o.id,rowHash(m,o));if(!have.has(o.id))base[m.key].push(o);if(r.updated_at>cur)cur=r.updated_at});
  SNAP[m.key]=snap;CUR[m.t]=cur||'1970-01-01T00:00:00+00:00'});
 DB=base;mergeKeys()}
async function loadPublic(){try{const j=await sbReq('/rest/v1/rpc/public_info',{method:'POST',auth:false,body:{}});if(j&&typeof j==='object')PUBLIC={...PUBLIC,...j}}catch(e){}}

/* ---- save changes ---- */
function cacheSave(){try{lsSet('eduvanta:theme',DB.theme);lsSet(FLAGS,JSON.stringify(DB.flags||{}));
 lsSet(CACHE,JSON.stringify({uid:SB.uid,db:DB,snap:Object.fromEntries(Object.entries(SNAP).map(([k,v])=>[k,[...v]])),cur:CUR}))}catch(e){}}
function restoreSnap(c){SNAP={};Object.entries(c.snap||{}).forEach(([k,v])=>SNAP[k]=new Map(v));CUR=c.cur||{}}
function cloudPersist(){SYNC_LABEL='Saving…';setPill('Saving…');clearTimeout(saveT);saveT=setTimeout(cacheSave,400);schedSync()}
function schedSync(){lsSet(CACHE+':dirty','1');clearTimeout(syncT);syncT=setTimeout(syncUp,1500);if(SYNCING)again=true}
const chunk=(a,n)=>{const o=[];for(let i=0;i<a.length;i+=n)o.push(a.slice(i,i+n));return o};
async function pushBatch(m,list,upsert){
 for(const part of chunk(list,100)){const rows=part.map(x=>toRow(m,x[0])),up={method:'POST',prefer:'resolution=merge-duplicates,return=minimal',query:'on_conflict=id',body:rows};
  try{await sbReq('/rest/v1/'+m.t,upsert?up:{method:'POST',prefer:'return=minimal',body:rows})}
  catch(e){let bad=e;
   if(!upsert&&e.status===409){try{await sbReq('/rest/v1/'+m.t,up);bad=null}catch(e2){bad=e2}}
   if(bad){if(bad.network||!bad.status||bad.status>=500||bad.status===401)throw bad;console.warn('EduVanta: change not accepted by the server for',m.t,bad.message);warned[m.t]=1}}
  part.forEach(x=>SNAP[m.key].set(x[0].id,x[1]))}}
async function pushDelete(m,ids){for(const part of chunk(ids,40)){
 try{await sbReq('/rest/v1/'+m.t,{method:'DELETE',query:'id=in.('+part.join(',')+')'})}catch(e){if(e.network||!e.status||e.status>=500||e.status===401)throw e;console.warn('EduVanta: delete not accepted for',m.t,e.message)}
 part.forEach(id=>SNAP[m.key].delete(id))}}
async function syncUp(){
 if(!CLOUD||!SB.tok||SYNCING||!DB||!DB.session)return;SYNCING=true;clearTimeout(syncT);let err=null;
 try{const me0=byId('users',SB.uid);if(me0&&me0.role!=='student')deriveKeys();
  for(const m of MAPS){const snap=SNAP[m.key]||(SNAP[m.key]=new Map()),ins=[],upd=[],seen=new Set();
   for(const o of (DB[m.key]||[])){if(!o||!o.id)continue;seen.add(o.id);const h=rowHash(m,o),p=snap.get(o.id);if(p===undefined)ins.push([o,h]);else if(p!==h)upd.push([o,h])}
   const del=[...snap.keys()].filter(id=>!seen.has(id));
   if(ins.length)await pushBatch(m,ins,false);if(upd.length)await pushBatch(m,upd,true);if(del.length)await pushDelete(m,del)}}
 catch(e){err=e}
 SYNCING=false;
 if(!err){SYNC_LABEL='Saved';lsDel(CACHE+':dirty');cacheSave();if(Object.keys(warned).length&&!warned._shown){warned._shown=1;toast('Some changes were not accepted by the school server. If this keeps happening, tell the administrator.','bad')}}
 else if(err.network){SYNC_LABEL='Offline'}
 else{SYNC_LABEL='Not synced';if(!warned.err){warned.err=1;toast(`Your latest changes could not be saved online (${err.message}). They are kept on this device and will retry.`,'bad')}setTimeout(schedSync,20000)}
 setPill(SYNC_LABEL);
 if(again){again=false;schedSync()}}

/* ---- pull other people's changes ---- */
async function pullChanges(){
 if(!CLOUD||!SB.tok||!DB||!DB.session||SYNCING||document.hidden)return;let changed=false;
 try{const res=await Promise.all(MAPS.map(m=>sbReq('/rest/v1/'+m.t,{query:`select=*&updated_at=gt.${encodeURIComponent(CUR[m.t]||'1970-01-01T00:00:00+00:00')}&order=updated_at.asc&limit=1000`})));
  MAPS.forEach((m,i)=>{const snap=SNAP[m.key]||(SNAP[m.key]=new Map());res[i].forEach(r=>{const o=fromRow(m,r);if(r.updated_at>(CUR[m.t]||''))CUR[m.t]=r.updated_at;
   const arr=DB[m.key],ix=arr.findIndex(x=>x.id===o.id),h=rowHash(m,o);
   if(ix>=0){const lh=rowHash(m,arr[ix]);if(lh!==snap.get(o.id))return;if(lh===h){snap.set(o.id,h);return}arr[ix]=o;changed=true}else{arr.push(o);changed=true}
   snap.set(o.id,h)})})}
 catch(e){if(e.network){SYNC_LABEL='Offline';setPill('Offline')}return}
 mergeKeys();const me=byId('users',SB.uid);if(me&&(!me.active||me.status==='pending')){toast('Your account has been switched off.','bad');return cloudLogout(true)}
 if(changed){cacheSave();softRender()}}
function softRender(){const a=document.activeElement,typing=a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName);if(typing||$('#modal.on')||['note','take'].includes(S.view))return;render(true)}
const startPolling=()=>{clearInterval(pollT);pollT=setInterval(pullChanges,30000)};
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&CLOUD&&DB&&DB.session)pullChanges()});
window.addEventListener('online',()=>{if(CLOUD&&DB&&DB.session){SYNC_LABEL='Saving…';setPill('Saving…');schedSync();pullChanges()}});
window.addEventListener('offline',()=>{if(CLOUD){SYNC_LABEL='Offline';setPill('Offline')}});

/* ---- start, sign in, sign up, sign out ---- */
function clearAuth(){SB={tok:null,ref:null,exp:0,uid:null};lsDel(SBK);lsDel(CACHE);lsDel(CACHE+':dirty');SNAP={};CUR={}}
async function cloudBoot(){
 HAS_STORE=true;DB=emptyDB();
 try{const s=JSON.parse(lsGet(SBK)||'null');if(s&&s.ref)SB={tok:s.tok,ref:s.ref,exp:s.exp,uid:s.uid}}catch(e){}
 if(!SB.ref){await loadPublic();return}
 let cache=null;try{cache=JSON.parse(lsGet(CACHE)||'null')}catch(e){}
 const same=!!cache&&cache.uid===SB.uid,dirty=same&&lsGet(CACHE+':dirty')==='1';
 try{if(Date.now()>SB.exp-60000)await refreshSession();await loadRemoteAll(dirty?cache.db:null);DB.session=SB.uid;startPolling();SYNC_LABEL='Saved';if(dirty)schedSync()}
 catch(e){if(e.network&&same){DB=cache.db;restoreSnap(cache);DB.session=SB.uid;SYNC_LABEL='Offline';startPolling()}else{clearAuth();DB=emptyDB();await loadPublic()}}}
const getOwnProfile=async()=>{const r=await sbReq('/rest/v1/profiles',{query:`select=*&id=eq.${SB.uid}`});return r&&r[0]};
const friendly=e=>e.network?'You appear to be offline. Check your internet and try again.':/invalid login|invalid_credentials/i.test((e.message||'')+(e.code||''))?'That email (or admission number) and password do not match. Check them and try again.':e.message||'Something went wrong. Try again.';
async function finishLogin(){await loadRemoteAll(null);DB.session=SB.uid;S.user=activeUser();if(!S.user)throw new Error('Your account could not be loaded.');S.view='dashboard';S.params={};S.auth=null;SYNC_LABEL='Saved';startPolling();logAct(`${S.user.name} signed in`);cloudPersist();render()}
async function cloudLogin(d){
 const id=d.email.trim(),email=id.includes('@')?id.toLowerCase():stuEmail(id);toast('Signing in…');
 try{setSession(await authLogin(email,d.pw));const p=await getOwnProfile();
  if(!p){await cloudSignOutQuiet();return toast('Your sign-in worked, but your school profile was not found. Ask the administrator.','bad')}
  if(p.status==='pending'){await cloudSignOutQuiet();return toast('Your account is waiting for approval from the school. You will be able to sign in once it is approved.','bad')}
  if(!p.active){await cloudSignOutQuiet();return toast('This account is switched off. Ask the school administrator.','bad')}
  await finishLogin()}
 catch(e){await cloudSignOutQuiet();toast(friendly(e),'bad')}}
async function cloudSignOutQuiet(){try{if(SB.tok)await sbReq('/auth/v1/logout',{method:'POST'})}catch(e){}clearAuth();DB=emptyDB()}
async function cloudSignup(d){
 const email=d.email.trim().toLowerCase();
 if(d.pw.length<8)return toast('Use a password with at least 8 characters.','bad');
 if(d.pw!==d.pw2)return toast('The two passwords do not match.','bad');
 await loadPublic();const first=!PUBLIC.owner;
 if(first&&!(d.code||'').trim())return toast('Enter the setup code you created in Supabase.','bad');
 toast('Creating your account…');
 try{let j;try{j=await authSignup(email,d.pw)}catch(e){if(/registered|exists/i.test((e.message||'')+(e.code||'')))j=await authLogin(email,d.pw);else throw e}
  if(!j.access_token)return toast('The school server needs email confirmation switched off for sign-up to work. Tell the owner (see the setup notes).','bad');
  setSession(j);
  if(first){   // the ONLY way to become owner: a correct one-time setup code, checked on the server
   await sbReq('/rest/v1/rpc/claim_owner',{method:'POST',body:{setup_code:d.code.trim(),p_name:d.name.trim(),p_phone:d.phone||''}});
   PUBLIC.owner=true;await finishLogin();return}
  let p=await getOwnProfile();
  if(!p){const o={id:SB.uid,school:'dace',role:'teacher',name:d.name.trim(),email,staffId:'STF-'+Date.now().toString(36).slice(-4).toUpperCase(),phone:d.phone||'',active:false,status:'pending',assign:[]};
   await sbReq('/rest/v1/profiles',{method:'POST',prefer:'return=minimal',body:toRow(mapOf('users'),o)})}
  await cloudSignOutQuiet();S.auth='signin';render();toast('Account created. You can sign in once the school approves it.','ok')}
 catch(e){await cloudSignOutQuiet();toast(friendly(e),'bad');await loadPublic();render()}}
async function flush(){for(let i=0;i<60&&SYNCING;i++)await new Promise(r=>setTimeout(r,100));await syncUp();return lsGet(CACHE+':dirty')!=='1'}
async function cloudLogout(force){
 if(!force){if(!(await flush())){return toast('Some changes are not saved online yet. Reconnect to the internet, wait for "Saved", then sign out.','bad')}}
 clearInterval(pollT);await cloudSignOutQuiet();S.user=null;S.view='dashboard';S.params={};S.auth=null;await loadPublic();render()}
async function cloudPassword(d){
 try{setSession(await authLogin(S.user.email,d.cur))}catch(e){return toast('Your current password is not right.','bad')}
 if(d.nw.length<8)return toast('Use at least 8 characters.','bad');
 try{await sbReq('/auth/v1/user',{method:'PUT',body:{password:d.nw}});toast('Password updated','ok')}catch(e){toast(friendly(e),'bad')}}
async function cloudCreateStaff(u,pw){
 try{const j=await adminCall({action:'createUsers',users:[{email:u.email.toLowerCase(),password:pw,role:'teacher',profile:{name:u.name,staffId:u.staffId,phone:u.phone,assign:u.assign||[]}}]}),r=j.results[0];
  if(r.error){toast(r.error,'bad');return false}
  u.id=r.id;u.email=u.email.toLowerCase();u.status='active';u.active=true;delete u.pw;DB.users.push(u);SNAP.users.set(u.id,rowHash(mapOf('users'),u));return true}
 catch(e){toast(friendly(e),'bad');return false}}

/* ============ start ============ */
(async()=>{await loadDB();S.user=activeUser();render();setTimeout(periodic,1200)})();

/* ---- exams: marking happens on the server ---- */
async function refreshRow(key,id){const m=mapOf(key),r=await sbReq('/rest/v1/'+m.t,{query:`select=*&id=eq.${encodeURIComponent(id)}`});if(!r||!r[0])return;
 const o=fromRow(m,r[0]),arr=DB[key],ix=arr.findIndex(x=>x.id===id);if(ix>=0)arr[ix]=o;else arr.push(o);(SNAP[key]||(SNAP[key]=new Map())).set(id,rowHash(m,o));if(r[0].updated_at>(CUR[m.t]||''))CUR[m.t]=r[0].updated_at;cacheSave()}
const submitting=new Set();
async function cloudSubmit(a,t){
 if(t.status==='submitted')return true;if(submitting.has(t.id))return false;submitting.add(t.id);
 try{if(!(await flush()))throw Object.assign(new Error('Your latest answers have not reached the school server yet.'),{network:true});
  await sbReq('/rest/v1/rpc/submit_attempt',{method:'POST',body:{attempt_id:t.id}});await refreshRow('attempts',t.id);return true}
 catch(e){toast(e.network?'You are offline. Your answers are saved on this device. Reconnect, then tap Submit again.':friendly(e),'bad');return false}
 finally{submitting.delete(t.id)}}
