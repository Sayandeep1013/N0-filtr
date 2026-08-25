import fs from 'fs';
const d = JSON.parse(fs.readFileSync('./tonik-ix2.json','utf8'));
const tgt = t => t?.selector ? (t.useEventTarget==='CHILDREN'?'↳ ':'')+t.selector
              : t?.objectId ? 'spline obj '+t.objectId.slice(0,8)
              : t?.id ? '#wid:'+String(t.id).slice(-12) : '(self)';
const val = c => {
  if (c.value && typeof c.value==='object') return Object.entries(c.value).filter(([,v])=>v!==null).map(([k,v])=>`${k}:${v}`).join(' ');
  const p=[];
  ['xValue','yValue','zValue','value','widthValue','heightValue'].forEach(k=>{
    if(c[k]===undefined||c[k]===null)return;
    const u = k==='xValue'?c.xUnit:k==='yValue'?c.yUnit:k==='zValue'?c.zUnit:c.unit;
    p.push(`${k.replace('Value','')}:${c[k]}${u==='PX'?'px':u==='%'?'%':/deg/i.test(u||'')?'°':''}`);
  });
  if(c.filters) p.push(c.filters.map(f=>`${f.type} ${f.value}${f.unit||''}`).join('/'));
  return p.join(' ');
};
for (const id of process.argv.slice(2)) {
  const a = d.actionLists[id];
  console.log(`\n╔══ [${id}] "${a.title}" ══════════════════════════════`);
  a.continuousParameterGroups?.forEach(g=>{
    console.log(`  ┌ ${g.type} (${g.parameterLabel})`);
    g.continuousActionGroups.forEach(k=>{
      console.log(`  │  @${String(k.keyframe).padStart(3)}%`);
      k.actionItems.forEach(it=>console.log(`  │     ${it.actionTypeId.padEnd(20)} ${tgt(it.config.target).padEnd(30)} ${val(it.config).padEnd(30)} ${it.config.duration}ms ${it.config.easing||''}`));
    });
  });
  a.actionItemGroups?.forEach((g,i)=>{
    console.log(`  step ${i}${i===0&&a.useFirstGroupAsInitialState?' (INITIAL)':''}`);
    g.actionItems.forEach(it=>console.log(`     ${it.actionTypeId.padEnd(20)} ${tgt(it.config.target).padEnd(30)} ${val(it.config).padEnd(30)} ${it.config.duration}ms ${it.config.easing||''}`));
  });
}
