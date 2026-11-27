/* ============ UI components ============ */
const IC={home:'M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',clock:'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',cal:'M4 5h16v16H4zM4 10h16M9 3v4M15 3v4',users:'M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M21 20v-1a4 4 0 0 0-3-3.9M16 4.1a3.5 3.5 0 0 1 0 6.8',book:'M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z',file:'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6',folder:'M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',spark:'M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z',bell:'M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0',user:'M20 21v-1a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v1M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8',cog:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1',chart:'M4 20V10M10 20V4M16 20v-7M22 20H2',mega:'M3 11v2a1 1 0 0 0 1 1h3l8 4V6L7 10H4a1 1 0 0 0-1 1zM19 8a5 5 0 0 1 0 8',check:'M5 12l5 5 9-10',build:'M4 21V4h10v17M14 9h6v12M8 8h2M8 12h2M8 16h2M3 21h18',play:'M7 4l13 8-13 8z',dl:'M12 3v12M7 10l5 5 5-5M5 21h14',up:'M12 15V3M7 8l5-5 5 5M5 21h14',plus:'M12 5v14M5 12h14',x:'M6 6l12 12M18 6L6 18',moon:'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',sun:'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',menu:'M4 7h16M4 12h16M4 17h16',out:'M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9',db:'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6'};
const ico=n=>`<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="${IC[n]||''}"/></svg>`;
const LOGO=(s=32)=>`<svg width="${s}" height="${s}" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#050506" stroke="#2a2d35"/><path d="M8 10l8 14 8-14" fill="none" stroke="#D4AF37" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M12.5 9h7" stroke="#4d7bff" stroke-width="3" stroke-linecap="round"/></svg>`;
const chip=(t,k='')=>`<span class="chip ${k}">${esc(t)}</span>`;
const NOTE_ST={draft:['Draft',''],submitted:['Submitted','blue'],approved:['Approved','ok'],rejected:['Rejected','bad'],corrections:['Needs corrections','warn']};
const stChip=s=>chip(...(NOTE_ST[s]||[s,'']));
const LS={Completed:'ok','In progress':'blue','In classroom':'blue',Missed:'bad','Awaiting start':'warn',Upcoming:''};
const lsChip=s=>chip(s,LS[s]||'');
const ATT={present:['On time','ok'],late:['Late','warn'],absent:['Absent','bad']};
const attChip=a=>!a?chip('Not clocked in','bad'):chip(...(ATT[a.status]||[a.status,'']));
const stat=(l,v,s,g)=>`<div class="stat ${g?'gold':''}"><div class="sl">${l}</div><div class="sv">${v}</div>${s?`<div class="ss">${s}</div>`:''}</div>`;
const card=(t,b,a='')=>`<section class="card"><header><h3>${t}</h3>${a}</header>${b}</section>`;
const empty=(t,s='')=>`<div class="empty"><strong>${t}</strong>${s}</div>`;
const tr=(cells,attr='')=>`<tr ${attr}>${cells.map(c=>`<td>${c}</td>`).join('')}</tr>`;
const table=(head,rows)=>`<div class="tw"><table><thead><tr>${head.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')||`<tr><td colspan="${head.length}" class="mut c">Nothing to show yet.</td></tr>`}</tbody></table></div>`;
const page=(t,sub,act,body)=>`<div class="phead"><div><h1>${t}</h1>${sub?`<p>${sub}</p>`:''}</div><div class="sp"></div><div class="row">${act||''}</div></div>${body}`;
const btn=(label,act,cls='',data='')=>`<button class="btn ${cls}" data-act="${act}" ${data}>${label}</button>`;
const opts=(arr,val)=>arr.map(o=>{const v=typeof o==='object'?o.v:o,l=typeof o==='object'?o.l:o;return`<option value="${esc(v)}" ${String(v)===String(val)?'selected':''}>${esc(l)}</option>`}).join('');
const fld=(label,name,o={})=>{const t=o.type||'text',v=o.value??'';
 const inp=o.opts?`<select name="${name}" ${o.req?'required':''} ${o.attr||''}>${opts(o.opts,v)}</select>`:t==='area'?`<textarea name="${name}" rows="${o.rows||3}" ${o.req?'required':''} ${o.attr||''} ${o.ph?`placeholder="${esc(o.ph)}"`:''}>${esc(v)}</textarea>`:`<input type="${t}" name="${name}" value="${esc(v)}" ${o.req?'required':''} ${o.attr||''} ${o.ph?`placeholder="${esc(o.ph)}"`:''}>`;
 return`<label class="f">${label}${o.hint?` <span class="hint">${o.hint}</span>`:''}${inp}</label>`};
function toast(m,k=''){const t=document.createElement('div');t.className='toast '+k;t.textContent=m;$('#toast').appendChild(t);setTimeout(()=>t.remove(),4200)}
function modal(title,body,wide){$('#modal').innerHTML=`<div class="dlg ${wide?'wide':''}"><h3>${title}</h3>${body}</div>`;$('#modal').classList.add('on');const f=$('#modal input,#modal select,#modal textarea');f&&f.focus()}
const closeModal=()=>{$('#modal').classList.remove('on');$('#modal').innerHTML=''};
function confirmBox(title,msg,act,data=''){modal(title,`<p>${msg}</p><div class="acts"><button class="btn" data-act="close">Cancel</button><button class="btn pri" data-act="${act}" ${data}>Confirm</button></div>`)}

/* ============ charts (inline SVG) ============ */
function bars(data,{h=150,color='var(--blue)',max}={}){const m=max||Math.max(1,...data.map(d=>d.v)),w=Math.max(34,Math.min(60,560/data.length));
 return`<svg class="chart" viewBox="0 0 ${data.length*w} ${h+26}" role="img">`+data.map((d,i)=>{const bh=Math.round(d.v/m*h);return`<rect x="${i*w+w*.2}" y="${h-bh}" width="${w*.6}" height="${Math.max(bh,1)}" rx="4" style="fill:${d.c||color}"/><text x="${i*w+w/2}" y="${h+14}" text-anchor="middle" class="ct">${esc(d.l)}</text><text x="${i*w+w/2}" y="${h-bh-4}" text-anchor="middle" class="cv">${d.v}</text>`}).join('')+`</svg>`}
function lineChart(vals,labels,{h=140,color='var(--blue)',max=100}={}){const W=520,n=vals.length,px=i=>20+i*(W-40)/Math.max(1,n-1),py=v=>h-(v/max)*h+8;
 const pts=vals.map((v,i)=>`${px(i)},${py(v)}`).join(' ');
 return`<svg class="chart" viewBox="0 0 ${W} ${h+34}" role="img"><line x1="20" x2="${W-20}" y1="${py(max)}" y2="${py(max)}" stroke="var(--line)"/><line x1="20" x2="${W-20}" y1="${py(0)}" y2="${py(0)}" stroke="var(--line)"/><polyline points="${pts}" fill="none" style="stroke:${color}" stroke-width="2.5" stroke-linejoin="round"/>`+vals.map((v,i)=>`<circle cx="${px(i)}" cy="${py(v)}" r="3.5" style="fill:${color}"/>${n<=16?`<text x="${px(i)}" y="${h+26}" text-anchor="middle" class="ct">${esc(labels[i])}</text>`:''}`).join('')+`</svg>`}
function donut(parts){const tot=parts.reduce((a,p)=>a+p.v,0)||1;let acc=0;const R=42,C=2*Math.PI*R;
 return`<div class="row" style="gap:20px"><svg viewBox="0 0 110 110" width="132" height="132" role="img"><circle cx="55" cy="55" r="${R}" fill="none" stroke="var(--line)" stroke-width="14"/>`+parts.map(p=>{const len=p.v/tot*C,s=`<circle cx="55" cy="55" r="${R}" fill="none" style="stroke:${p.c}" stroke-width="14" stroke-dasharray="${len} ${C-len}" stroke-dashoffset="${-acc}" transform="rotate(-90 55 55)"/>`;acc+=len;return s}).join('')+`<text x="55" y="60" text-anchor="middle" style="font:600 18px var(--serif);fill:var(--text)">${tot}</text></svg><div class="legend" style="flex-direction:column;gap:6px;margin:0">${parts.map(p=>`<span><i style="background:${p.c}"></i>${esc(p.l)}: <b style="color:var(--text)">${p.v}</b></span>`).join('')}</div></div>`}
const meter=(v,cls='')=>`<div class="row" style="gap:8px;flex-wrap:nowrap"><div class="bar ${cls} sp"><i style="width:${Math.min(100,v)}%"></i></div><span class="sm">${v}%</span></div>`;

/* ============ navigation ============ */
const NAV={
 teacher:[['dashboard','Dashboard','home'],['attendance','Attendance','clock'],['timetable','My timetable','cal'],['classes','My classes','users'],['activities','Classroom activities','play'],['notes','Lesson notes','file'],['bank','Academic note bank','folder'],['assess','Assessments and CBT','check'],['students','Students','users'],['results','Results','chart'],['ai','AI lesson assistant','spark'],['notifications','Notifications','bell'],['profile','Profile','user'],['settings','Settings','cog'],['help','Help','book']],
 admin:[['dashboard','Dashboard','home'],['staff','Staff management','users'],['attendance','Attendance monitoring','clock'],['classroom','Classroom monitoring','play'],['students','Students','users'],['assess','Assessments','check'],['results','Results','chart'],['timetable','Timetable management','cal'],['notes','Lesson note management','file'],['sessions','Academic sessions','book'],['reports','Reports and analytics','chart'],['announcements','Announcements','mega'],['settings','Settings','cog'],['help','Help','book']],
 proprietor:[['dashboard','School overview','home'],['staff','Staff and roles','users'],['performance','Staff performance','users'],['attendance','Attendance analytics','clock'],['academic','Academic activities','book'],['assess','Assessments','check'],['results','Academic results','chart'],['notestats','Lesson note statistics','file'],['reports','Management reports','chart'],['help','Help','book']],
 student:[['dashboard','Dashboard','home'],['exams','My assessments','check'],['results','My results','chart'],['notifications','Notifications','bell'],['profile','Profile','user'],['settings','Settings','cog'],['help','Help','book']],
 super:[['dashboard','Platform overview','home'],['schools','Schools','build'],['activity','Platform activity','chart'],['storage','Storage and usage','db'],['config','System configuration','cog']]};
const ROLE_L={student:'Student',teacher:'Teacher',admin:'School administrator',proprietor:'Owner and proprietor',super:'Super administrator'};
const NAVALIAS={note:'notes',take:'exams',asmEdit:'assess',sheet:'results'};
const VIEWS={},ACT={},FORMS={},COMMON={};
function go(v,p={}){S.view=v;S.params=p;S.menu=false;render();window.scrollTo(0,0)}
function render(keepScroll){
 const y=window.scrollY;document.documentElement.dataset.theme=DB.theme;
 S.user=activeUser();const app=$('#app');
 if(!S.user){app.innerHTML=loginView();return}
 const nav=NAV[S.user.role],unread=DB.notifs.filter(n=>n.to===S.user.id&&!n.read).length;
 const fn=VIEWS[S.user.role+':'+S.view]||COMMON[S.view]||VIEWS[S.user.role+':dashboard'];
 const label=({note:'Lesson notes',take:'Assessment',asmEdit:'Assessment',sheet:'Result sheet'})[S.view]||(nav.find(n=>n[0]===S.view)||[0,'Dashboard'])[1];
 const sc=S.user.school?school():null;
 const pend=S.user.role==='admin'?mine('notes').filter(n=>n.status==='submitted').length:0;
 app.innerHTML=`<div class="shell"><aside class="side ${S.menu?'open':''}" aria-label="Main navigation"><div class="brand">${LOGO(32)}EduVanta</div>
  <div class="schoolname">${sc&&sc.settings.logo?`<img src="${sc.settings.logo}" alt="" style="width:36px;height:36px;object-fit:contain;border-radius:8px;background:#fff;margin-bottom:8px;display:block">`:''}${esc(sc?sc.name:'EduVanta platform')}<small>${ROLE_L[S.user.role]}</small></div>
  <nav class="nav">${nav.map(n=>`<button class="${S.view===n[0]||NAVALIAS[S.view]===n[0]?'on':''}" data-act="nav" data-v="${n[0]}">${ico(n[2])}<span>${n[1]}</span>${n[0]==='notes'&&pend?`<span class="badge">${pend}</span>`:''}${n[0]==='notifications'&&unread?`<span class="badge">${unread}</span>`:''}</button>`).join('')}</nav>
  <div class="foot">Free access. Your school's data stays private to your school.</div></aside>
  <div class="main"><header class="top"><button class="iconbtn menu" data-act="menu" aria-label="Open menu">${ico('menu')}</button><h2>${label}</h2><div class="sp"></div>
   <span id="pill" class="pill hm ${pillOff()}">${pillText()}</span>
   <button class="iconbtn" data-act="theme" aria-label="Switch light or dark mode">${ico(DB.theme==='dark'?'sun':'moon')}</button>
   <button class="iconbtn" data-act="nav" data-v="notifications" aria-label="Notifications">${ico('bell')}${unread?`<span class="dot">${unread}</span>`:''}</button>
   <button class="iconbtn" data-act="nav" data-v="profile" aria-label="Profile"><span class="avatar">${esc(S.user.name.replace(/^(Mr|Mrs|Miss|Dr|Chief)\.?\s+/,'')[0])}</span></button>
   <button class="iconbtn" data-act="logout" aria-label="Sign out">${ico('out')}</button></header>
  <main class="page">${fn()}</main></div></div>`;
 if(keepScroll)window.scrollTo(0,y);
}

/* ============ login and sign-up ============ */
function loginView(){
 const first=CLOUD?!PUBLIC.owner:DB.users.length===0,mode=S.auth||(first?'signup':'signin'),sn=CLOUD?PUBLIC.name:DB.schools[0].name,lgo=CLOUD?PUBLIC.logo:DB.schools[0].settings.logo;
 const form=mode==='signup'?`<form class="lbox" data-form="signup"><h2>${first?'Set up your school':'Create your account'}</h2><p class="mut" style="margin:0 0 18px">${first?(CLOUD?'This is the first sign-up, so it creates the school owner account. You need the one-time setup code you created in Supabase. Nobody can become owner without it.':'You are the first person here, so you become the school owner. You can choose the administrator afterwards.'):'The school approves new staff accounts. You can sign in as soon as yours is approved.'}</p>
  ${first&&CLOUD?fld('Setup code','code',{req:true,attr:'autocomplete="off"'}):''}${fld('Full name','name',{req:true,attr:'autocomplete="name"'})}${fld('Email','email',{type:'email',req:true,attr:'autocomplete="email"'})}${fld('Phone','phone',{attr:'autocomplete="tel"'})}${fld('Password','pw',{type:'password',req:true,hint:'(at least 8 characters)',attr:'autocomplete="new-password" minlength="8"'})}${fld('Confirm password','pw2',{type:'password',req:true,attr:'autocomplete="new-password"'})}
  <button class="btn gold lg" style="width:100%;justify-content:center">${first?'Create school owner account':'Create account'}</button>${first?'':`<p class="sm" style="margin-top:16px">Already have an account? <a href="#" data-act="auth" data-m="signin">Sign in</a></p>`}</form>`
 :`<form class="lbox" data-form="login"><h2>Sign in</h2><p class="mut" style="margin:0 0 18px">Staff use their email. Students use their admission number and PIN.</p>
  ${fld('Email or admission number','email',{type:'text',req:true,attr:'autocomplete="username" id="lemail"'})}${fld('Password','pw',{type:'password',req:true,attr:'autocomplete="current-password" id="lpw"'})}
  <button class="btn pri lg" style="width:100%;justify-content:center">Sign in</button><p class="sm" style="margin-top:16px">New staff member? <a href="#" data-act="auth" data-m="signup">Create your account</a></p><p class="sm mut">Forgot your password? Ask the administrator to give you a temporary one.</p></form>`;
 return`<div class="login"><section class="lhero"><div class="brand" style="padding:0;font-size:26px">${LOGO(40)}EduVanta</div>
 <div style="position:relative;z-index:1">${lgo?`<img src="${lgo}" alt="" style="width:64px;height:64px;object-fit:contain;border-radius:12px;background:#fff;margin-bottom:16px;display:block">`:''}<h1>${esc(sn)}</h1><p>Staff attendance, classroom activity, timetables and a permanent lesson note bank, in one place.</p></div>
 <div class="lpoints"><div>Clock in with location checks and see late arrivals as they happen</div><div>Lesson notes with version history, approval and a searchable bank</div><div>Room for the whole staff, with roles you choose</div></div></section>
 <section class="lform">${form}</section></div>`}

FORMS.login=async d=>{if(CLOUD)return cloudLogin(d);const em=d.email.trim().toLowerCase(),u=DB.users.find(x=>x.email.toLowerCase()===em);
 if(!u||!(await checkPw(u,d.pw)))return toast('That email and password do not match. Check them and try again.','bad');
 if(u.status==='pending')return toast('Your account is waiting for approval from the school. You will be able to sign in once it is approved.','bad');
 if(!u.active)return toast('This account is switched off. Ask the school administrator.','bad');
 DB.session=u.id;S.user=u;S.view='dashboard';S.params={};logAct(`${u.name} signed in`);persist();render()};
FORMS.signup=async d=>{if(CLOUD)return cloudSignup(d);const em=d.email.trim().toLowerCase();
 if(d.pw.length<8)return toast('Use a password with at least 8 characters.','bad');
 if(d.pw!==d.pw2)return toast('The two passwords do not match.','bad');
 if(DB.users.some(u=>u.email.toLowerCase()===em))return toast('An account with this email already exists. Sign in instead.','bad');
 const sc=DB.schools[0],first=DB.users.length===0,n=String(DB.users.length+1).padStart(3,'0');
 const u={id:uid(),school:sc.id,role:first?'proprietor':'teacher',name:d.name.trim(),email:d.email.trim(),pw:await hp(d.pw),staffId:(first?'OWN-':'STF-')+n,phone:d.phone||'',active:first,status:first?'active':'pending',assign:[]};
 DB.users.push(u);
 if(first){DB.session=u.id;S.user=u;S.view='dashboard';logAct(`School set up by ${u.name}`);persist();render();return}
 DB.users.filter(x=>x.school===sc.id&&['admin','proprietor'].includes(x.role)).forEach(x=>DB.notifs.push({id:uid(),school:sc.id,to:x.id,title:'New staff account to approve',body:`${u.name} (${u.email}) has signed up.`,type:'Alert',ts:Date.now(),read:false}));
 S.auth='signin';persist();render();toast('Account created. You can sign in once the school approves it.','ok')};

/* ============ shared teacher pieces ============ */
function clockCard(){const u=S.user,a=attToday(u.id),sc=school().settings,today=TODAY();
 let status,b='';
 if(!a||!a.in){status='You have not clocked in today.';b=btn('Clock in','clockin','gold lg')}
 else if(!a.out){status=`Clocked in at ${a.in}. ${a.status==='late'?'Marked late.':'On time.'}`;b=btn('Clock out','clockout','dark lg')}
 else status=`Clocked in ${a.in}, clocked out ${a.out}${a.early?'. Marked early departure':''}.`;
 return`<section class="card clock"><div><div class="mut">${fmtDL(today)}</div><div class="bigtime" id="liveclock">${liveTime()}</div><div>${status}</div><div class="sm mut">School hours ${sc.resume} to ${sc.close}. ${sc.geofence?'Location check is on.':'Your location is recorded when you clock in.'}</div></div><div>${b}</div></section>`}
const liveTime=()=>{const d=new Date();return`${pad(d.getHours())}:${pad(d.getMinutes())}<sup>:${pad(d.getSeconds())}</sup>`};
const weekendNote=()=>isWeekend()?`<div class="card" style="border-color:var(--gold);background:var(--gold-soft)"><b>It's the weekend.</b> This demo uses ${fmtD(TODAY())} as the working day so every screen has live data.</div>`:'';
function ttGrid(slots,{showClass=true,showTeacher=false,showSubject=true}={}){
 const t=TODAY(),td=dow(t);let h=`<div class="tw"><div class="ttg"><div></div>${DAYS.map((d,i)=>`<div class="h ${i===td&&dow(t)<5?'today':''}">${d}</div>`).join('')}`;
 PERIODS.forEach(p=>{if(p.n===4)h+=`<div class="cell brk">Break 10:00 to 10:30</div>`;
  h+=`<div class="p">Period ${p.n}<br>${p.s}</div>`;
  for(let d=0;d<5;d++){const s=slots.find(x=>x.day===d&&x.period===p.n);
   h+=s?`<div class="cell has ${d===td?'today':''}"><b>${esc(showSubject?nm('subjects',s.subjectId):nm('classes',s.classId))}</b>${showSubject&&showClass?esc(nm('classes',s.classId)):''}${showTeacher?`<br><span class="mut">${esc(nm('users',s.teacherId))}</span>`:''}</div>`:`<div class="cell"></div>`}});
 return h+'</div></div>'}
function ttViews(slots,opt){const m=S.ttMode,today=TODAY();
 const tabs=`<div class="tabs">${['day','week','month'].map(x=>`<button class="${m===x?'on':''}" data-act="ttmode" data-m="${x}">${{day:'Daily',week:'Weekly',month:'Monthly'}[x]}</button>`).join('')}</div>`;
 if(m==='week')return tabs+ttGrid(slots,opt);
 if(m==='day'){const L=slots.filter(s=>s.day===dow(today)).sort((a,b)=>a.period-b.period);
  return tabs+`<p class="mut">${fmtDL(today)}</p><div class="list">${L.map(s=>{const p=PERIODS[s.period-1];return`<div class="item"><b style="width:96px">${p.s} to ${p.e}</b><div class="sp"><div class="t">${esc(nm('subjects',s.subjectId))}, ${esc(nm('classes',s.classId))}</div>${opt.showTeacher?`<div class="sm mut">${esc(nm('users',s.teacherId))}</div>`:''}</div></div>`}).join('')||empty('No lessons today')}</div>`}
 const first=today.slice(0,8)+'01',last=iso(new Date(parse(first).getFullYear(),parse(first).getMonth()+1,0)),lead=dow(first);
 let c=`<p class="mut">${['January','February','March','April','May','June','July','August','September','October','November','December'][parse(first).getMonth()]} ${parse(first).getFullYear()}</p><div class="tw"><div class="cal">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<div class="dh">${d}</div>`).join('')}`;
 for(let i=0;i<lead;i++)c+='<div style="border:0"></div>';
 for(let d=first;d<=last;d=addDays(d,1)){const w=dow(d),n=w<5?slots.filter(s=>s.day===w).length:0;c+=`<div class="${n?'on':''} ${d===today?'tdy':''}"><b>${parse(d).getDate()}</b>${n?`<br>${n} lesson${n>1?'s':''}`:''}</div>`}
 return tabs+c+'</div></div>'}

/* ============ teacher views ============ */
VIEWS['teacher:dashboard']=()=>{const u=S.user,today=TODAY(),st=teacherStats(u.id),inst=instances(today,today,{teacher:u.id}),
 done=inst.filter(i=>i.status==='Completed').length,next=inst.find(i=>['Upcoming','Awaiting start'].includes(i.status)),
 h=new Date().getHours(),greet=h<12?'Good morning':h<17?'Good afternoon':'Good evening',alerts=mine('notes').filter(n=>n.teacherId===u.id&&['rejected','corrections'].includes(n.status));
 return page(`${greet}, ${esc(u.name.split(' ').slice(0,2).join(' '))}`,`${esc(school().name)}`,'',weekendNote()+clockCard()+
 `<div class="stats">${stat('Lessons today',`${done} of ${inst.length}`,'completed so far')}${stat('Notes due this week',st.outstanding,st.outstanding?`due ${fmtD(noteDeadline())}`:'all submitted',st.outstanding>0)}${stat('Notes approved',st.approved,'this term')}${stat('Attendance',st.attPct+'%','last 15 school days')}</div>
 <div class="grid g2">${card('Next lesson',next?`<div class="t" style="font:600 22px var(--serif)">${esc(nm('subjects',next.slot.subjectId))}, ${esc(nm('classes',next.slot.classId))}</div><p class="mut">${next.p.s} to ${next.p.e}. ${next.status==='Awaiting start'?'This period has started.':''}</p>${btn('Open classroom activities','nav','pri','data-v="activities"')}`:empty('No more lessons today'))}
 ${card('Notes that need you',alerts.length?`<div class="list">${alerts.map(n=>`<div class="item"><div class="sp"><div class="t">${esc(n.topic)}</div><div class="sm mut">${esc(nm('classes',n.classId))}, week ${n.week}. ${esc(n.feedback||'')}</div></div>${stChip(n.status)}${btn('Open','noteOpen','sm','data-id="'+n.id+'"')}</div>`).join('')}</div>`:empty('Nothing waiting','No notes have been sent back to you.'))}</div>
 ${card('Today\'s lessons',table(['Time','Subject','Class','Status'],inst.map(i=>tr([`${i.p.s} to ${i.p.e}`,esc(nm('subjects',i.slot.subjectId)),esc(nm('classes',i.slot.classId)),lsChip(i.status)]))))}`)};

VIEWS['teacher:attendance']=()=>{const u=S.user,rec=mine('attendance').filter(a=>a.userId===u.id).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,15),st=teacherStats(u.id);
 return page('Attendance','Clock in when you arrive and out when you leave.','',weekendNote()+clockCard()+`<div class="stats">${stat('On time',st.pres,'days')}${stat('Late',st.late,'days')}${stat('Absent',st.abs,'days')}${stat('Early departures',st.early,'days')}</div>`+
 card('Last 15 school days',table(['Date','In','Out','Status','Location'],rec.map(a=>tr([fmtD(a.date),a.in||'—',a.out||'—',attChip(a)+(a.early?' '+chip('Left early','warn'):'')+(a.corrected?' '+chip('Corrected','gold'):''),a.loc==='inside'?'Inside school':a.loc==='recorded'?'Recorded':a.loc==='outside'?'Outside':'Not verified']))))) };

VIEWS['teacher:timetable']=()=>page('My timetable','Your lessons by day, week or month.','',card('Schedule',ttViews(mine('slots').filter(s=>s.teacherId===S.user.id),{showClass:true})));

VIEWS['teacher:classes']=()=>{const u=S.user,pairs=pairsOf(u.id),N=mine('notes').filter(n=>n.teacherId===u.id);
 return page('My classes','Classes and subjects assigned to you.','',`<div class="grid g3">${pairs.map(p=>{const n=N.filter(x=>x.classId===p.classId&&x.subjectId===p.subjectId),per=mine('slots').filter(s=>s.teacherId===u.id&&s.classId===p.classId&&s.subjectId===p.subjectId).length;
  return card(esc(nm('classes',p.classId)),`<div class="serif" style="font-size:20px">${esc(nm('subjects',p.subjectId))}</div><p class="mut sm">${per} periods a week</p><div class="row">${chip(n.length+' notes')}${chip(n.filter(x=>x.status==='approved').length+' approved','ok')}</div>`)}).join('')||empty('No classes assigned yet','Ask your administrator to assign you to a class.')}</div>`)};

VIEWS['teacher:activities']=()=>{const u=S.user,today=TODAY(),a=attToday(u.id),inst=instances(today,today,{teacher:u.id}),
 live=mine('lessons').filter(l=>l.teacherId===u.id&&l.date===today&&l.status!=='completed'),
 hist=mine('lessons').filter(l=>l.teacherId===u.id).sort((x,y)=>(y.date+y.start).localeCompare(x.date+x.start)).slice(0,12);
 const act=i=>{if(i.lesson)return'';if(i.status==='Missed')return chip('No record','bad');return btn('Enter classroom','lessonEnter','sm pri','data-slot="'+i.slot.id+'"')};
 return page('Classroom activities','Record when you enter, start and end each lesson.',btn('Unscheduled lesson','adhoc','gold'),weekendNote()+
 (!a||!a.in?`<div class="card" style="border-color:var(--gold)"><b>Clock in first.</b> Lessons can only be recorded after you have clocked in.</div>`:'')+
 (live.length?card('In progress',live.map(l=>`<div class="item"><div class="sp"><div class="t">${esc(nm('subjects',l.subjectId))}, ${esc(nm('classes',l.classId))}</div><div class="sm mut">${l.status==='entered'?`In classroom since ${l.entered}`:`Started ${l.start}, running for <span data-since="${l.start}">0 min</span>`}</div></div>${l.status==='entered'?btn('Start lesson','lessonStart','pri','data-id="'+l.id+'"'):btn('End lesson','lessonEnd','gold','data-id="'+l.id+'"')}</div>`).join('')):'')+
 card('Today\'s schedule',table(['Time','Subject','Class','Status',''],inst.map(i=>tr([`${i.p.s} to ${i.p.e}`,esc(nm('subjects',i.slot.subjectId)),esc(nm('classes',i.slot.classId)),lsChip(i.status),act(i)]))))+
 card('Recent lessons',table(['Date','Subject','Class','Started','Ended','Duration'],hist.map(l=>tr([fmtD(l.date),esc(nm('subjects',l.subjectId)),esc(nm('classes',l.classId)),l.start||'—',l.end||'—',l.end?`${toMin(l.end)-toMin(l.start)} min`:'—'])))))};

/* ---- lesson notes ---- */
const NOTE_FIELDS=[['objectives','Learning objectives'],['prior','Previous knowledge'],['materials','Instructional materials'],['references','Reference materials'],['intro','Introduction'],['content','Detailed lesson content'],['activities','Teaching and learning activities'],['evaluation','Evaluation'],['assignment','Assignment'],['reflection',"Teacher's reflection"]];
const META=['subjectId','classId','sessionId','term','week','date','topic','subtopic','duration'];
VIEWS['teacher:notes']=()=>{const u=S.user,tab=S.tab.notes||'all',all=mine('notes').filter(n=>n.teacherId===u.id).sort((a,b)=>b.updatedAt-a.updatedAt),
 list=all.filter(n=>tab==='all'||(tab==='review'?['rejected','corrections'].includes(n.status):n.status===tab));
 const tabs=[['all','All'],['draft','Drafts'],['submitted','Submitted'],['approved','Approved'],['review','Sent back']];
 return page('Lesson notes','Write, save and submit your notes.',btn(ico('plus')+'New lesson note','noteNew','gold'),`<div class="tabs">${tabs.map(t=>`<button class="${tab===t[0]?'on':''}" data-act="tab" data-k="notes" data-v="${t[0]}">${t[1]} (${all.filter(n=>t[0]==='all'||(t[0]==='review'?['rejected','corrections'].includes(n.status):n.status===t[0])).length})</button>`).join('')}</div>`+
 card('',table(['Topic','Subject','Class','Term and week','Status','Updated'],list.slice(0,60).map(n=>tr([`<b>${esc(n.topic||'Untitled note')}</b>${n.uploaded?' '+chip('Uploaded file'):''}${n.aiAssisted?' '+chip('AI draft','gold'):''}`,esc(nm('subjects',n.subjectId)),esc(nm('classes',n.classId)),`${esc(n.term)}, week ${n.week}`,stChip(n.status),fmtTs(n.updatedAt)],`class="click" data-act="noteOpen" data-id="${n.id}"`)))+(list.length>60?`<p class="mut sm">Showing the latest 60. Use the Academic note bank to search everything.</p>`:''))) };

VIEWS['teacher:note']=()=>{const n=byId('notes',S.params.id);if(!n)return empty('Note not found');
 const ro=!['draft','rejected','corrections'].includes(n.status),u=S.user,pairs=pairsOf(u.id),
 subs=[...new Set(pairs.map(p=>p.subjectId))].map(i=>({v:i,l:nm('subjects',i)})),cls=[...new Set(pairs.map(p=>p.classId))].map(i=>({v:i,l:nm('classes',i)})),
 ses=mine('sessions'),sObj=byId('sessions',n.sessionId)||ses[0],dis=ro?'disabled':'';
 const field=(k,l)=>`<label class="f">${l}<textarea data-f="${k}" rows="${['content'].includes(k)?8:4}" ${dis}>${esc(n[k])}</textarea></label>`;
 return page(esc(n.topic||'New lesson note'),`${stChip(n.status)} <span id="savestate" class="sm mut">${ro?'Locked while '+(n.status==='approved'?'approved':'under review')+'.':'Changes save automatically.'}</span>`,
  `<button class="btn" data-act="tabBack">Back to notes</button>${btn('Version history','noteVersions','','data-id="'+n.id+'"')}${btn('Word','noteWord','','data-id="'+n.id+'"')}${btn('PDF','notePdf','','data-id="'+n.id+'"')}`,
  (n.feedback&&['rejected','corrections'].includes(n.status)?`<div class="card" style="border-color:var(--gold);background:var(--gold-soft)"><b>Administrator feedback</b><p style="margin:.3em 0 0">${esc(n.feedback)}</p></div>`:'')+
  (ro&&n.status==='approved'?`<div class="card"><b>This note is approved.</b> To change it, duplicate it into a new draft from the Academic note bank. The approved version stays safe.</div>`:'')+
  `<form id="noteform" data-id="${n.id}" onsubmit="return false">${card('Details',`<div class="fgrid">
   <label class="f">School<input type="text" value="${esc(school().name)}" disabled></label><label class="f">Teacher<input type="text" value="${esc(u.name)}" disabled></label>
   <label class="f">Subject<select data-f="subjectId" ${dis}>${opts(subs,n.subjectId)}</select></label><label class="f">Class<select data-f="classId" ${dis}>${opts(cls,n.classId)}</select></label>
   <label class="f">Academic session<select data-f="sessionId" ${dis}>${opts(ses.map(s=>({v:s.id,l:s.name})),n.sessionId)}</select></label><label class="f">Term<select data-f="term" ${dis}>${opts(sObj.terms.map(t=>t.name),n.term)}</select></label>
   <label class="f">Week<input type="number" min="1" max="16" data-f="week" value="${n.week}" ${dis}></label><label class="f">Date<input type="date" data-f="date" value="${n.date}" ${dis}></label>
   <label class="f">Topic<input type="text" data-f="topic" value="${esc(n.topic)}" ${dis}></label><label class="f">Subtopic<input type="text" data-f="subtopic" value="${esc(n.subtopic)}" ${dis}></label>
   <label class="f">Duration <span class="hint">(minutes)</span><input type="number" min="5" data-f="duration" value="${n.duration}" ${dis}></label></div>`)}
  ${n.uploaded?card('Uploaded document',`<div class="item"><div class="sp"><div class="t">${esc(n.uploaded.name)}</div><div class="sm mut">${bytes(n.uploaded.size)}${n.uploaded.dataUrl?'':'. Only the file details were kept because it is larger than the storage limit.'}</div></div>${n.uploaded.dataUrl?btn(ico('dl')+'Download','upDl','','data-id="'+n.id+'"'):''}</div>`):card('Lesson content',NOTE_FIELDS.map(f=>field(...f)).join(''))}
  ${ro?'':`<div class="row"><button class="btn" data-act="noteSave">Save draft</button><button class="btn gold" data-act="noteSubmit">Submit for approval</button>${n.status==='draft'?`<span class="sp"></span><button class="btn bad" data-act="noteDelete" data-id="${n.id}">Delete draft</button>`:''}</div>`}</form>`)};

function blankNote(extra={}){const u=S.user,p=pairsOf(u.id)[0]||{},ses=curSession(),tm=curTerm();
 return{id:uid(),school:sid(),teacherId:u.id,subjectId:p.subjectId||'',classId:p.classId||'',sessionId:ses.id,term:tm.name,week:weekOfTerm(),date:TODAY(),topic:'',subtopic:'',duration:40,...Object.fromEntries(NOTE_FIELDS.map(f=>[f[0],''])),status:'draft',folder:'',versions:[],feedback:'',updatedAt:Date.now(),...extra}}
const snapshot=n=>{n.versions.unshift({ts:Date.now(),status:n.status,data:Object.fromEntries([...META,...NOTE_FIELDS.map(f=>f[0])].map(k=>[k,n[k]]))});n.versions=n.versions.slice(0,25)};
function collectNote(){const f=$('#noteform');if(!f)return null;const n=byId('notes',f.dataset.id);if(!n)return null;
 $$('[data-f]',f).forEach(e=>{const k=e.dataset.f;n[k]=e.type==='number'?Number(e.value):e.value});n.updatedAt=Date.now();return n}
let autoT=null;
function setSave(t){const e=$('#savestate');if(e)e.textContent=t}
function autosave(){setSave('Saving…');clearTimeout(autoT);autoT=setTimeout(()=>{const n=collectNote();if(!n)return;n.pendingSync=!navigator.onLine;persist();setSave(navigator.onLine?'All changes saved':'Saved on this device. It will sync when you are back online.')},800)}

/* ---- note bank ---- */
VIEWS['teacher:bank']=()=>{const u=S.user,f=S.f,fo=mine('folders').filter(x=>x.userId===u.id),ses=mine('sessions'),pairs=pairsOf(u.id);
 return page('Academic note bank','Every note you have written or uploaded, kept permanently.',btn(ico('up')+'Upload a file','uploadOpen')+btn(ico('folder')+'New folder','folderNew'),
 card('',`<div class="fgrid"><label class="f">Search<input type="search" data-filter="q" value="${esc(f.q||'')}" placeholder="Topic, subtopic or keyword"></label>
 <label class="f">Subject<select data-filter="subject"><option value="">All</option>${opts([...new Set(pairs.map(p=>p.subjectId))].map(i=>({v:i,l:nm('subjects',i)})),f.subject)}</select></label>
 <label class="f">Class<select data-filter="cls"><option value="">All</option>${opts([...new Set(pairs.map(p=>p.classId))].map(i=>({v:i,l:nm('classes',i)})),f.cls)}</select></label>
 <label class="f">Session<select data-filter="session"><option value="">All</option>${opts(ses.map(s=>({v:s.id,l:s.name})),f.session)}</select></label>
 <label class="f">Term<select data-filter="term"><option value="">All</option>${opts(['First Term','Second Term','Third Term'],f.term)}</select></label>
 <label class="f">Week<input type="number" min="1" max="16" data-filter="week" value="${esc(f.week||'')}"></label>
 <label class="f">Folder<select data-filter="folder"><option value="">All</option><option value="none" ${f.folder==='none'?'selected':''}>No folder</option>${opts(fo.map(x=>({v:x.id,l:x.name})),f.folder)}</select></label></div>`)+`<div id="banklist">${bankList()}</div>`)};
function bankList(){const u=S.user,f=S.f,q=(f.q||'').toLowerCase();
 const L=mine('notes').filter(n=>n.teacherId===u.id&&(!q||(n.topic+' '+n.subtopic+' '+n.content).toLowerCase().includes(q))&&(!f.subject||n.subjectId===f.subject)&&(!f.cls||n.classId===f.cls)&&(!f.session||n.sessionId===f.session)&&(!f.term||n.term===f.term)&&(!f.week||n.week===Number(f.week))&&(!f.folder||(f.folder==='none'?!n.folder:n.folder===f.folder))).sort((a,b)=>b.date.localeCompare(a.date));
 return card(`${L.length} note${L.length===1?'':'s'}`,table(['Topic','Subject and class','Session','Folder','Status',''],L.slice(0,50).map(n=>{const fo=byId('folders',n.folder);
  return tr([`<b>${esc(n.topic||'Untitled')}</b>${n.uploaded?' '+chip('File'):''}`,`${esc(nm('subjects',n.subjectId))}, ${esc(nm('classes',n.classId))}`,`${esc(nm('sessions',n.sessionId))}, ${esc(n.term)}, week ${n.week}`,fo?esc(fo.name):'<span class="mut">None</span>',stChip(n.status),
   `<div class="row" style="flex-wrap:nowrap;gap:6px">${btn('Open','noteOpen','sm','data-id="'+n.id+'"')}${btn('Duplicate','dupOpen','sm','data-id="'+n.id+'"')}${btn('Folder','moveOpen','sm','data-id="'+n.id+'"')}${btn('PDF','notePdf','sm','data-id="'+n.id+'"')}${btn('Word','noteWord','sm','data-id="'+n.id+'"')}</div>`])}))+(L.length>50?'<p class="mut sm">Showing 50. Narrow the filters to see more.</p>':''))}

/* ---- AI assistant (optional) ---- */
VIEWS['teacher:ai']=()=>{const u=S.user,pairs=pairsOf(u.id),on=school().settings.aiEnabled,r=S.ai;
 if(!on)return page('AI lesson assistant','',' ',card('Switched off',empty('Your school has turned the assistant off','Everything else in EduVanta works without it. Ask your administrator if you would like it back.')));
 return page('AI lesson assistant','Get a starting draft for a lesson. You review and edit everything before it becomes a note.','',
 `<div class="card" style="border-color:var(--gold)"><b>Drafts only.</b> Nothing from the assistant is approved automatically. It becomes a draft note, and your administrator still reviews it.</div>`+
 card('Lesson details',`<form data-form="ai"><div class="fgrid">${fld('Subject','subjectId',{opts:[...new Set(pairs.map(p=>p.subjectId))].map(i=>({v:i,l:nm('subjects',i)})),value:r&&r.subjectId})}${fld('Class','classId',{opts:[...new Set(pairs.map(p=>p.classId))].map(i=>({v:i,l:nm('classes',i)})),value:r&&r.classId})}${fld('Topic','topic',{req:true,value:r?r.topic:''})}</div>${fld('Anything the draft should cover','extra',{type:'area',rows:2,hint:'(optional)',value:r?r.extra:''})}<button class="btn pri" id="aibtn">Generate draft</button></form>`)+
 (r&&r.out?card(`Draft for ${esc(r.topic)} ${r.out.source==='ai'?chip('AI generated','gold'):chip('Starter template','')}`,
  (r.out.source!=='ai'?`<p class="sm mut">The AI service could not be reached, so this is a structured starter template. Edit it before saving.</p>`:'')+
  `<form id="aiform">${NOTE_FIELDS.filter(f=>f[0]!=='prior'&&f[0]!=='references'&&f[0]!=='reflection').map(f=>`<label class="f">${f[1]}<textarea data-ai="${f[0]}" rows="${f[0]==='content'?7:4}">${esc(r.out[f[0]]||'')}</textarea></label>`).join('')}<button type="button" class="btn gold" data-act="aiSave">Save as draft note</button></form>`):''))};
async function aiGenerate(subject,cls,topic,extra){
 try{const c=new AbortController();setTimeout(()=>c.abort(),25000);
  const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',signal:c.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:1000,
   system:'You help Nigerian secondary school teachers draft lesson notes. Reply with ONLY a JSON object with string keys objectives, intro, content, activities, evaluation, assignment, materials. Keep each value under 90 words. Use plain text, numbered lines separated by \\n where useful. No markdown fences.',
   messages:[{role:'user',content:`Subject: ${subject}. Class: ${cls}. Topic: ${topic}. ${extra||''}`}]})});
  if(!r.ok)throw 0;const d=await r.json(),t=d.content.map(i=>i.text||'').join('').replace(/```json|```/g,'').trim(),o=JSON.parse(t);
  return{...scaffold(subject,cls,topic),...o,source:'ai'}}
 catch(e){return{...scaffold(subject,cls,topic),source:'template'}}}
FORMS.ai=async(d,f)=>{const b=$('#aibtn');b.disabled=true;b.textContent='Generating…';
 const out=await aiGenerate(nm('subjects',d.subjectId),nm('classes',d.classId),d.topic,d.extra);S.ai={...d,out};render(true)};

/* ---- common: notifications, profile, settings ---- */
COMMON.notifications=()=>{const L=DB.notifs.filter(n=>n.to===S.user.id).sort((a,b)=>b.ts-a.ts);
 return page('Notifications','Announcements, reminders and alerts.',L.some(n=>!n.read)?btn('Mark all as read','notifAll'):'',card('',`<div class="list">${L.map(n=>`<div class="item ${n.read?'':'unread'}"><div class="sp"><div class="t">${esc(n.title)}</div><div class="sm mut">${esc(n.body)}</div></div>${chip(n.type,n.type==='Alert'?'warn':'')}<span class="sm mut">${fmtTs(n.ts)}</span>${n.read?'':btn('Mark read','notifRead','sm','data-id="'+n.id+'"')}</div>`).join('')||empty('You are all caught up','New announcements will show here.')}</div>`))};
COMMON.profile=()=>{const u=S.user;return page('Profile','','',`<div class="grid g2">${card('Your details',`<form data-form="profile">${fld('Full name','name',{value:u.name,req:true})}${fld('Phone','phone',{value:u.phone})}${u.role==='student'?'':`<label class="f">Email<input type="text" value="${esc(u.email)}" disabled></label>`}<label class="f">${u.role==='student'?'Admission number':'Staff ID'}<input type="text" value="${esc(u.staffId)}" disabled></label><button class="btn pri">Save changes</button></form>`)}
 ${card('Change password',`<form data-form="password">${fld('Current password','cur',{type:'password',req:true})}${fld('New password','nw',{type:'password',req:true,hint:'(at least 8 characters)'})}<button class="btn pri">Update password</button></form>`)}</div>`)};
COMMON.settings=()=>{const sc=S.user.school?school():null,sz=JSON.stringify(DB).length;
 return page('Settings','','',card('Appearance',`<div class="row">${btn('Light','setTheme','','data-t="light"')}${btn('Dark','setTheme','','data-t="dark"')}<span class="mut sm">EduVanta keeps its black, white, gold and blue identity in both.</span></div>`)+(['admin','proprietor'].includes(S.user.role)?backupCard():'')+
 card('Storage',`<p class="mut">${CLOUD?`Everything is saved in the school's online database, so it is there on any phone or computer you sign in from. ${SYNC_LABEL==='Offline'?'You are offline right now, so recent changes will upload when you reconnect.':''}`:`${HAS_STORE?'Accounts and records are saved in this browser on this device.':'This preview cannot save between visits, so data lasts for this session only.'} This device is using ${bytes(sz)}.`}</p>${S.user.role==='proprietor'&&!CLOUD?btn('Erase all school data','resetOpen','bad'):''}`))};
