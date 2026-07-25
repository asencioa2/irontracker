// IronTracker — Pure Utility Functions (utils.js)
// ============================================================
// These functions have NO side effects:
//   ✓ No DOM access
//   ✓ No Supabase calls  
//   ✓ No global state mutation
// They are pure: same input always gives same output.
// This makes them trivially testable.
// ============================================================

// Returns ISO date string for today — YYYY-MM-DD
function today(){return new Date().toISOString().split('T')[0];}


// Returns ISO date string for Monday of current week
function getWeekStart(){
  const d=new Date();const day=d.getDay();const diff=d.getDate()-day+(day===0?-6:1);
  d.setDate(diff);return d.toISOString().split('T')[0];
}


// Calculates current consecutive training day streak
function calcStreak(logs,restDays){
  if(!logs.length)return 0;
  const done=new Set(logs.map(l=>l.date));
  const rested=new Set((restDays||[]).map(r=>r.date));
  let streak=0;const d=new Date();
  for(let i=0;i<60;i++){
    const ds=d.toISOString().split('T')[0];
    if(done.has(ds)){streak++;d.setDate(d.getDate()-1);}
    else if(rested.has(ds)){d.setDate(d.getDate()-1);continue;} // rest day doesn't break streak
    else if(i===0){d.setDate(d.getDate()-1);continue;}
    else break;
  }
  return streak;
}


// Estimates one-rep max using Epley formula
function calc1RM(){
  const w=parseFloat(document.getElementById('orm-weight')?.value);const r=parseInt(document.getElementById('orm-reps')?.value);
  if(!w||!r||r<1)return;const orm=Math.round(w*(1+r/30));current1RM={w,r,orm};
  document.getElementById('orm-result').style.display='block';document.getElementById('orm-save-btn').style.display='inline-flex';
  document.getElementById('orm-value').textContent=orm+' lbs';
  document.getElementById('orm-breakdown').textContent=`${w} lbs x ${r} reps  90%: ${Math.round(orm*0.9)}  80%: ${Math.round(orm*0.8)}  70%: ${Math.round(orm*0.7)}`;
}


// Estimates body fat % using US Navy formula
function calcBF(){
  const h=parseFloat(document.getElementById('bf-height')?.value);const neck=parseFloat(document.getElementById('bf-neck')?.value);const waist=parseFloat(document.getElementById('bf-waist')?.value);const weight=parseFloat(document.getElementById('bf-weight')?.value);
  if(!h||!neck||!waist||!weight)return;
  const bf=86.010*Math.log10(waist-neck)-70.041*Math.log10(h)+36.76;const bfR=Math.max(2,Math.min(50,Math.round(bf*10)/10));
  const fatLbs=Math.round(weight*bfR/100*10)/10;const leanLbs=Math.round((weight-fatLbs)*10)/10;
  document.getElementById('bf-result').style.display='block';document.getElementById('bf-pct').textContent=bfR+'%';document.getElementById('bf-fat-lbs').textContent=fatLbs+' lbs';document.getElementById('bf-lean-lbs').textContent=leanLbs+' lbs';
  const cat=document.getElementById('bf-category');let label,bg,color;
  if(bfR<6){label='Essential fat';bg='var(--red-dim)';color='var(--red)';}else if(bfR<14){label='Athletic';bg='var(--accent-dim)';color='var(--accent)';}else if(bfR<18){label='Fitness';bg='var(--blue-dim)';color='var(--blue)';}else if(bfR<25){label='Average';bg='var(--amber-dim)';color='var(--amber)';}else{label='Above average';bg='var(--red-dim)';color='var(--red)';}
  cat.style.background=bg;cat.style.color=color;cat.textContent=label;
}


// Calculates plate combinations for a given barbell weight
function calcPlates(){
  const target=parseFloat(document.getElementById('plate-target')?.value)||0;
  const barWeight=parseFloat(document.getElementById('plate-bar')?.value)||45;
  const resultEl=document.getElementById('plate-result');
  const errorEl=document.getElementById('plate-error');
  const displayEl=document.getElementById('plate-display');
  const totalEl=document.getElementById('plate-total');

  if(!target){resultEl.style.display='none';errorEl.style.display='none';return;}
  if(target<barWeight){
    resultEl.style.display='none';
    errorEl.textContent=`Target must be at least ${barWeight} lbs (bar weight)`;
    errorEl.style.display='block';return;
  }
  const perSide=(target-barWeight)/2;
  if(perSide%1!==0&&perSide%0.5!==0){
    // Check if achievable with standard plates
  }
  errorEl.style.display='none';
  let remaining=perSide;
  const plates=[];
  for(const p of PLATE_SIZES){
    while(remaining>=p.w){plates.push(p);remaining=Math.round((remaining-p.w)*100)/100;}
  }
  if(remaining>0.01){
    errorEl.textContent=`Can't make exactly ${target} lbs with standard plates. Closest: ${target-remaining*2} lbs`;
    errorEl.style.display='block';
    resultEl.style.display='none';return;
  }
  displayEl.innerHTML=plates.length
    ?plates.map(p=>`<div style="background:${p.color};color:#fff;font-size:12px;font-weight:700;padding:6px 10px;border-radius:6px;font-family:var(--mono)">${p.w}</div>`).join('')
    :'<span class="text-muted text-base">Bar only</span>';
  const grouped=plates.reduce((a,p)=>{a[p.w]=(a[p.w]||0)+1;return a;},{});
  totalEl.textContent='Per side: '+Object.entries(grouped).map(([w,n])=>`${n}×${w}`).join(' + ')+` = ${perSide} lbs`;
  resultEl.style.display='block';
}


// Parses height in multiple formats: 5'9", 5-9, 69 inches
function parseHeightInput(val){
  // Accept formats: 5'10", 5'10, 5-10, 510, 70 (pure inches)
  val=val.trim();
  let inches=0;
  // Try ft'in" format: 5'10" or 5'10
  const ftIn=val.match(/^(\d+)[''`](\d+)/);
  if(ftIn){inches=parseInt(ftIn[1])*12+parseInt(ftIn[2]);}
  // Try ft-in format: 5-10
  else if(val.match(/^\d+-\d+$/)){const p=val.split('-');inches=parseInt(p[0])*12+parseInt(p[1]);}
  // Try pure number (assume inches if >=48, feet if <8)
  else if(val.match(/^\d+\.?\d*$/)){
    const n=parseFloat(val);
    inches=n<8?Math.round(n*12):Math.round(n); // e.g. "5.9" as feet, "69" as inches
  }
  const hiddenEl=document.getElementById('set-height');
  const hint=document.getElementById('height-hint');
  if(inches>=48&&inches<=96){
    if(hiddenEl)hiddenEl.value=inches;
    const ft=Math.floor(inches/12);const inn=inches%12;
    if(hint)hint.textContent=`✓ ${ft}ft ${inn}in = ${inches} inches`;
    hint.style.color='var(--accent)';
  }else if(val.length>0){
    if(hiddenEl)hiddenEl.value='';
    if(hint)hint.textContent="Try: 5'10\" or just 70 inches";
    hint.style.color='var(--red)';
  }else{
    if(hiddenEl)hiddenEl.value='';
    if(hint){hint.textContent="Enter height like 5'10\" or 70 inches";hint.style.color="var(--text3)";}
  }
}


// Formats volume number for display (e.g. 1500 → "1.5k")
function formatVolume(vol){
  // vol is stored as sum of (weight × reps) per set — display cleanly
  if(vol>=1000)return (vol/1000).toFixed(1)+'k';
  return vol.toString();
}


// Formats ISO date to readable string
function formatDateDisplay(dateStr){
  const t=today();
  const yest=new Date();yest.setDate(yest.getDate()-1);
  const yesterStr=yest.toISOString().split('T')[0];
  if(dateStr===t)return 'Today — '+new Date(dateStr+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  if(dateStr===yesterStr)return 'Yesterday — '+new Date(dateStr+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  return new Date(dateStr+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'});
}


// Gets the user's daily water goal from localStorage
function getWaterGoalOz(weights){
  // Check for user-set custom goal first
  const customGoal=localStorage.getItem('water_goal_oz_'+(currentUser?.id||''));
  if(customGoal)return parseInt(customGoal);
  if(weights&&weights.length){const w=weights[weights.length-1].weight_lbs;return Math.round(w*0.55);}
  return 100;
}


