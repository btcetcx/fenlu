// ui_kits/erp-console/doc-table.jsx
// 文档列表 — 表格 + 列宽拖拽 + 列头筛选 + 固定底部全选 / 分页

function DocTable({cols, rows, sel, toggleRow, allChecked, someChecked, toggleAll, onView}){
  const [widths, setWidths] = React.useState(cols.map(c=>c.w));
  const [open, setOpen] = React.useState(null);    // 当前展开的筛选下拉
  const [filter, setFilter] = React.useState({});  // {state:'已发布', type:'工艺方案'}
  const dragRef = React.useRef(null);

  // 列宽拖拽
  const onResize = (i) => (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = widths[i];
    dragRef.current = (ev) => {
      const w = Math.max(64, startW + (ev.clientX - startX));
      setWidths(prev => { const a = [...prev]; a[i] = w; return a; });
    };
    const up = () => {
      window.removeEventListener('mousemove', dragRef.current);
      window.removeEventListener('mouseup', up);
      dragRef.current = null;
    };
    window.addEventListener('mousemove', dragRef.current);
    window.addEventListener('mouseup', up);
  };

  // 不再填充空行 — 全选/分页直接吸在最后一行下面
  const stateTone = (s) => ({'已发布':'g','待审核':'y','已停用':'gray','草稿':'b'})[s] || 'gray';

  return (
    <div className="aw-doc-tbl-inner">
      <table className="aw-doc-tbl" style={{tableLayout:'fixed'}}>
        <colgroup>
          <col style={{width:42}}/>
          {cols.map((c,i)=><col key={c.k} style={{width:widths[i]}}/>)}
        </colgroup>
        <thead>
          <tr>
            <th><span className={'aw-chk'+(allChecked?' on':someChecked?' indet':'')} onClick={toggleAll}/></th>
            {cols.map((c,i)=>(
              <th key={c.k}>
                <div className="aw-th-inner">
                  <span>{c.label}</span>
                  {c.filter && (
                    <span className="aw-th-filter" onClick={()=>setOpen(open===c.k?null:c.k)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                      {open===c.k && (
                        <div className="aw-th-pop" onClick={e=>e.stopPropagation()}>
                          {c.filter.map(o=>(
                            <div key={o} className={'aw-th-opt'+(filter[c.k]===o||(!filter[c.k]&&o==='全部')?' on':'')} onClick={()=>{setFilter({...filter,[c.k]:o});setOpen(null);}}>{o}</div>
                          ))}
                        </div>
                      )}
                    </span>
                  )}
                </div>
                {i<cols.length-1 && <span className="aw-th-resize" onMouseDown={onResize(i)}/>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r,ri)=>(
            <tr key={ri}>
              <td><span className={'aw-chk'+(sel[ri]?' on':'')} onClick={()=>toggleRow(ri)}/></td>
              {cols.map(c => {
                if (c.k === 'state') return <td key={c.k}><span className={'aw-state aw-state-'+r.stTone}>{r.state}</span></td>;
                if (c.k === 'op') return <td key={c.k}><span className="aw-link" onClick={onView}>查看</span></td>;
                return <td key={c.k} className={['code','ver','date'].includes(c.k) ? 'aw-num' : ''}>{r[c.k] || '-'}</td>;
              })}
            </tr>
          ))}
          {rows.length===0 && (
            <tr><td colSpan={cols.length+1} style={{padding:'60px 0',textAlign:'center',color:'#9CA3AF'}}>暂无数据</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function DocFooter({total, pageSize, allChecked, someChecked, toggleAll, selCount}){
  const [page, setPage] = React.useState(1);
  const pageCount = Math.ceil(total/pageSize);
  const pages = [1,2,3,4,5,'...',pageCount];
  return (
    <div className="aw-doc-footer">
      <div className="aw-doc-footer-l">
        <span className={'aw-chk'+(allChecked?' on':someChecked?' indet':'')} onClick={toggleAll}/>
        <span>全选{selCount>0&&` · 已选 ${selCount}`}</span>
        <button className="aw-btn">批量删除</button>
        <button className="aw-btn">批量转移</button>
        <button className="aw-btn">操作键</button>
        <button className="aw-btn">…</button>
      </div>
      <div className="aw-doc-footer-r">
        <span>共 {total} 条</span>
        <span>每页</span>
        <select className="aw-input" style={{width:64}}><option>{pageSize}</option><option>20</option><option>50</option></select>
        <span>条</span>
        {pages.map((p,i)=>(
          <span key={i} className={'aw-pg'+(p===page?' on':'')+(p==='...'?' more':'')} onClick={()=>typeof p==='number'&&setPage(p)}>{p}</span>
        ))}
        <span>前往</span>
        <input className="aw-input" defaultValue="1" style={{width:48,textAlign:'center'}}/>
        <span>页</span>
      </div>
    </div>
  );
}

Object.assign(window, { DocTable, DocFooter });
