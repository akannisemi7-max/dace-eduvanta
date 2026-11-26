'use strict';
/* Supabase project (public values only). The publishable key is safe in the browser; the database rules protect the data. */
const CLOUD_URL='https://qcfpbkdwayrkqozoaafd.supabase.co',CLOUD_KEY='sb_publishable_QSqh5ExGfHL5oEuxZ5fBHw_weo4wRfW',STU_DOMAIN='students.eduvanta.app';
const CLOUD=!!(CLOUD_URL&&CLOUD_KEY);
/* ============ utilities ============ */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-3);
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parse=s=>new Date(s+'T00:00:00');
const nowHM=()=>{const d=new Date();return pad(d.getHours())+':'+pad(d.getMinutes())};
const toMin=t=>{const [h,m]=String(t||'0:0').split(':').map(Number);return h*60+m};
const fromMin=m=>pad(Math.floor(m/60))+':'+pad(m%60);
const addMin=(t,m)=>fromMin(toMin(t)+m);
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'');
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS=['Mon','Tue','Wed','Thu','Fri'],DAYL=['Monday','Tuesday','Wednesday','Thursday','Friday'];
const fmtD=s=>{if(!s)return '—';const d=parse(s);return `${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`};
const fmtDL=s=>{const d=parse(s);return `${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`};
const fmtTs=t=>{const d=new Date(t);return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${pad(d.getHours())}:${pad(d.getMinutes())}`};
const dow=s=>(parse(s).getDay()+6)%7;
const addDays=(s,n)=>{const d=parse(s);d.setDate(d.getDate()+n);return iso(d)};
const bytes=b=>b<1024?b+' B':b<1048576?(b/1024).toFixed(1)+' KB':(b/1048576).toFixed(2)+' MB';
const pct=(a,b)=>b?Math.round(a/b*100):0;
const PERIODS=[{n:1,s:'08:00',e:'08:40'},{n:2,s:'08:40',e:'09:20'},{n:3,s:'09:20',e:'10:00'},{n:4,s:'10:30',e:'11:10'},{n:5,s:'11:10',e:'11:50'},{n:6,s:'11:50',e:'12:30'}];

/* The demo treats weekends as the previous Friday so there is always a school day to work with. */
const isWeekend=()=>[0,6].includes(new Date().getDay());
function workDate(){const d=new Date();if(d.getDay()===0)d.setDate(d.getDate()-2);if(d.getDay()===6)d.setDate(d.getDate()-1);return d}
const TODAY=()=>iso(workDate());
function weekdaysRange(from,to){const out=[];let d=from;while(d<=to){if(dow(d)<5)out.push(d);d=addDays(d,1)}return out}
function weekdaysBack(n,end=TODAY()){const out=[];let d=end;while(out.length<n){if(dow(d)<5)out.push(d);d=addDays(d,-1)}return out.reverse()}
const mondayOf=s=>addDays(s,-dow(s));

/* ============ seed ============ */
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function scaffold(subject,cls,topic){return{
 objectives:`By the end of the lesson, students should be able to:\n1. State what ${topic} means in ${subject}.\n2. Explain the key ideas behind ${topic} using examples.\n3. Apply ${topic} to solve or discuss simple problems.`,
 prior:`Students already know the basic terms from earlier ${subject} lessons in ${cls}.`,
 materials:`Whiteboard and markers, charts, students' notebooks, textbook.`,
 references:`Approved ${cls} ${subject} textbook and the current scheme of work.`,
 intro:`Begin with short questions on previous knowledge, then link them to today's topic: ${topic}.`,
 content:`1. Meaning and definition of ${topic}.\n2. Main features or rules, each with a worked example.\n3. Common mistakes and how to avoid them.\n4. Examples from everyday Nigerian life to make the idea concrete.`,
 activities:`Teacher explains and demonstrates. Students answer oral questions, work in pairs on two examples and present one answer to the class.`,
 evaluation:`1. Define ${topic} in your own words.\n2. Give two examples.\n3. Work through one new example on the board.`,
 assignment:`Write short notes on ${topic} and complete the exercise given in class.`}}


function seedFresh(){
 const id='dace',db={v:3,session:null,theme:(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light',
  schools:[{id,name:'D-Ace Ultimate Secondary School',city:'',code:'DAUSS',created:iso(new Date()),active:true,plan:'Free',settings:{resume:'08:00',close:'15:00',grace:5,geofence:false,lat:null,lng:null,radius:150,noteDay:4,aiEnabled:true}}],
  users:[],classes:[],subjects:[],sessions:[],slots:[],attendance:[],lessons:[],notes:[],notifs:[],audit:[],announce:[],folders:[],activity:[],comments:[],termresults:[],assessments:[],attempts:[],marks:[],sheets:[],flags:{},config:{free:true,storageCapMB:50,uploadMaxKB:700}};
 ['JSS1','JSS2','JSS3','SS1','SS2','SS3'].forEach(c=>db.classes.push({id:id+'_c_'+c,school:id,name:c}));
 ['English Language','Mathematics','Civic Education','Basic Science','Physics','Chemistry','Biology','Economics','Government','Literature-in-English','Agricultural Science','Computer Studies'].forEach(n=>db.subjects.push({id:id+'_s_'+slug(n),school:id,name:n}));
 db.sessions.push({id:id+'_ses_2627',school:id,name:'2026/2027',current:true,termIdx:0,terms:[{name:'First Term',start:'2026-09-14',end:'2026-12-18'},{name:'Second Term',start:'2027-01-11',end:'2027-04-02'},{name:'Third Term',start:'2027-04-26',end:'2027-07-16'}]});
 return db}
async function hp(p){try{if(window.crypto&&crypto.subtle){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('eduvanta:'+p));return 'h:'+[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}}catch(e){}return 'p:'+p}
async function checkPw(u,p){return u.pw===await hp(p)||u.pw==='p:'+p}

/* ============ storage ============ */
let DB=null;const KEY='eduvanta:db:v3';let HAS_STORE=false,saveT=null;
let STORE_KIND='none';
const lsOK=()=>{try{localStorage.setItem('__t','1');localStorage.removeItem('__t');return true}catch(e){return false}};
async function loadDB(){
 if(CLOUD){await cloudBoot();return}
 HAS_STORE=false;let raw=null;
 try{if(window.storage&&window.storage.get){const r=await window.storage.get(KEY);STORE_KIND='cloud';HAS_STORE=true;if(r&&r.value)raw=r.value}}catch(e){}
 if(!raw&&lsOK()){if(STORE_KIND==='none'){STORE_KIND='local';HAS_STORE=true}try{raw=localStorage.getItem(KEY)||raw}catch(e){}}
 try{if(raw){const d=JSON.parse(raw);if(d.v===3){DB=d;['assessments','attempts','marks','sheets','comments','termresults'].forEach(k=>{DB[k]=DB[k]||[]});return}}}catch(e){}
 DB=seedFresh();
}
function persist(){if(CLOUD){cloudPersist();return}clearTimeout(saveT);setPill('Saving…');saveT=setTimeout(async()=>{const js=JSON.stringify(DB);let ok=false,full=false;
 try{if(STORE_KIND==='cloud'){await window.storage.set(KEY,js);ok=true}}catch(e){}
 try{if(lsOK()){localStorage.setItem(KEY,js);ok=true}}catch(e){full=true}
 if(full&&!ok&&!S.warnFail){S.warnFail=1;toast("This browser's storage is full, so the latest changes are not saved. Download a backup now.",'bad')}
 else if(js.length>4.2e6&&!S.warnFull){S.warnFull=1;toast('Storage is nearly full. Download a backup now and plan to connect Supabase.','bad')}
 setPill(ok?'Saved':'Session only')},350)}
function setPill(t){const p=$('#pill');if(p){p.textContent=t;p.className='pill hm'+(/Session only|Offline|Not synced/.test(t)?' off':'')}}

/* ============ session + data access (every query is scoped to the signed-in school) ============ */
const S={user:null,view:'dashboard',params:{},menu:false,tab:{},f:{},ttMode:'week',ttTarget:'',date:null,rep:{key:'attDaily'}};
const sid=()=>S.user&&S.user.school;
const school=()=>DB.schools.find(s=>s.id===sid());
const mine=t=>DB[t].filter(x=>x.school===sid());
const byId=(t,id)=>DB[t].find(x=>x.id===id);
const nm=(t,id)=>{const r=byId(t,id);return r?r.name:'—'};
const teachers=(active)=>mine('users').filter(u=>u.role==='teacher'&&(!active||u.active));
const curSession=()=>{const s=mine('sessions').find(x=>x.current);return s||mine('sessions')[0]};
const curTerm=()=>{const s=curSession();return s?s.terms[s.termIdx]:null};
function weekOfTerm(date=TODAY()){const t=curTerm();if(!t)return 1;return Math.max(1,Math.floor((parse(date)-parse(t.start))/604800000)+1)}
const activeUser=()=>byId('users',DB.session);
function logAct(text){DB.activity.unshift({id:uid(),ts:Date.now(),school:sid(),userId:S.user&&S.user.id,text});DB.activity=DB.activity.slice(0,300)}
function notify(to,title,body,type='Info'){DB.notifs.push({id:uid(),school:sid(),to,title,body,type,ts:Date.now(),read:false})}
const notifyAdmins=(t,b,ty)=>mine('users').filter(u=>u.role==='admin').forEach(u=>notify(u.id,t,b,ty));

/* ============ metrics ============ */
function instances(from,to,f={}){
 const today=TODAY(),now=nowHM(),LM=new Map(mine('lessons').filter(l=>l.slotId).map(l=>[l.slotId+'|'+l.date,l]));
 const slots=mine('slots').filter(s=>(!f.teacher||s.teacherId===f.teacher)&&(!f.cls||s.classId===f.cls)),out=[];
 for(const d of weekdaysRange(from,to)){const w=dow(d);
  for(const s of slots){if(s.day!==w)continue;const p=PERIODS[s.period-1],l=LM.get(s.id+'|'+d);let st;
   if(l)st=l.status==='completed'?'Completed':l.status==='active'?'In progress':'In classroom';
   else if(d<today||(d===today&&p.e<now))st='Missed';
   else if(d===today&&p.s<=now)st='Awaiting start';
   else st='Upcoming';
   out.push({date:d,slot:s,p,lesson:l,status:st})}}
 return out.sort((a,b)=>a.date.localeCompare(b.date)||a.p.s.localeCompare(b.p.s));
}
const attOn=(uid_,d)=>mine('attendance').find(a=>a.userId===uid_&&a.date===d);
const attToday=u=>attOn(u,TODAY());
function teacherStats(uid_,n=15){
 const ds=weekdaysBack(n),today=TODAY(),sc=school().settings,A=mine('attendance').filter(a=>a.userId===uid_);
 let pres=0,late=0,abs=0,early=0;
 ds.forEach(d=>{const a=A.find(x=>x.date===d);
  if(a){if(a.status==='absent')abs++;else{a.status==='late'?late++:pres++;if(a.early)early++}}
  else if(d<today||nowHM()>addMin(sc.resume,60))abs++});
 const inst=instances(ds[0],ds[ds.length-1],{teacher:uid_}).filter(i=>['Completed','In progress','In classroom','Missed'].includes(i.status));
 const done=inst.filter(i=>i.status==='Completed').length,missed=inst.filter(i=>i.status==='Missed').length;
 const ses=curSession(),tm=curTerm(),notes=mine('notes').filter(x=>x.teacherId===uid_&&x.sessionId===ses.id&&tm&&x.term===tm.name);
 const out=outstandingFor(uid_);
 return{pres,late,abs,early,days:pres+late+abs,attPct:pct(pres+late,pres+late+abs),punct:pct(pres,pres+late),sched:inst.length,done,missed,
  submitted:notes.filter(x=>x.status!=='draft').length,approved:notes.filter(x=>x.status==='approved').length,drafts:notes.filter(x=>x.status==='draft').length,outstanding:out.length,outList:out}
}
function pairsOf(uid_){const m=new Map();mine('slots').filter(s=>s.teacherId===uid_).forEach(s=>m.set(s.classId+'|'+s.subjectId,{classId:s.classId,subjectId:s.subjectId}));((byId('users',uid_)||{}).assign||[]).forEach(a=>m.set(a.classId+'|'+a.subjectId,{classId:a.classId,subjectId:a.subjectId}));return[...m.values()]}
function outstandingFor(uid_){const ses=curSession(),tm=curTerm(),wk=weekOfTerm(),N=mine('notes');
 return pairsOf(uid_).filter(p=>!N.some(n=>n.teacherId===uid_&&n.sessionId===ses.id&&tm&&n.term===tm.name&&n.week===wk&&n.classId===p.classId&&n.subjectId===p.subjectId&&n.status!=='draft'))}
const noteDeadline=()=>{const d=school().settings.noteDay;return addDays(mondayOf(TODAY()),d)};
