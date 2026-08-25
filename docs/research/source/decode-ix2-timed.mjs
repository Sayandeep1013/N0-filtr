import fs from 'fs';
const d = JSON.parse(fs.readFileSync('./tonik-ix2.json','utf8'));
const {events, actionLists} = d;

const tgt = t => {
  if (!t) return '(event target)';
  if (t.useEventTarget === 'CHILDREN') return `↳ children ${t.selector||''}`.trim();
  if (t.useEventTarget === 'PARENT')   return `↑ parent ${t.selector||''}`.trim();
  if (t.useEventTarget === 'SIBLINGS') return `↔ siblings ${t.selector||''}`.trim();
  if (t.useEventTarget === true || t.useEventTarget === 'TRUE') return '(self)';
  return t.selector || (t.id ? `#wid:${String(t.id).slice(0,8)}` : '(self)');
};
const val = c => {
  const p = [];
  for (const k of ['xValue','yValue','zValue','value','widthValue','heightValue',
                   'globalSwatchId','rValue','gValue','bValue','aValue','filters']) {
    if (c[k] === undefined || c[k] === null) continue;
    if (k === 'filters') { p.push('filters:'+c[k].map(f=>`${f.type} ${f.value}${f.unit||''}`).join('/')); continue; }
    let u = '';
    if (k==='xValue') u = c.xUnit||''; if (k==='yValue') u = c.yUnit||'';
    if (k==='zValue') u = c.zUnit||''; if (k==='value') u = c.unit||'';
    if (k==='widthValue'||k==='heightValue') u = c.widthUnit||c.heightUnit||'';
    p.push(`${k.replace('Value','')}:${c[k]}${u==='PX'?'px':u==='%'?'%':u==='DEG'||u==='deg'?'°':u}`);
  }
  if (c.rValue!==undefined) return `rgba(${c.rValue},${c.gValue},${c.bValue},${c.aValue??1})`;
  return p.join(' ');
};

const renderList = (id, indent='    ') => {
  const a = actionLists[id];
  if (!a) return indent+'(missing '+id+')';
  const out = [`${indent}[${id}] "${a.title||''}"`];
  a.actionItemGroups?.forEach((g,gi) => {
    out.push(`${indent}  ${gi===0 && a.useFirstGroupAsInitialState ? 'INITIAL STATE' : 'step '+gi}`);
    g.actionItems.forEach(it => {
      const c = it.config;
      const dur = c.duration!==undefined ? `${c.duration}ms` : '';
      const dly = c.delay ? ` delay ${c.delay}ms` : '';
      const ez  = c.easing ? ` ${c.easing}` : '';
      out.push(`${indent}    ${it.actionTypeId.padEnd(22)} ${tgt(c.target).padEnd(38)} ${val(c).padEnd(26)} ${dur}${ez}${dly}`);
    });
  });
  return out.join('\n');
};

const want = process.argv[2] || 'MOUSE_OVER,MOUSE_MOVE,MOUSE_CLICK,SCROLLING_IN_VIEW,PAGE_START';
const types = want.split(',');
const seen = new Set();
let n=0;
for (const e of Object.values(events)) {
  if (!types.includes(e.eventTypeId)) continue;
  const listId = e.action?.config?.actionListId;
  const key = e.eventTypeId+'|'+(e.target?.selector||e.target?.originalId)+'|'+listId;
  if (seen.has(key)) continue; seen.add(key);
  n++;
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log(`${e.eventTypeId}  on  ${e.target?.selector || '#wid:'+String(e.target?.originalId||'').slice(-12)}   [${(e.mediaQueries||[]).join(',')}]`);
  console.log(renderList(listId));
}
console.error(`\n(${n} unique events of type ${want})`);
