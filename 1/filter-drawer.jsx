// filter-drawer.jsx
function FilterDrawer({ onClose }) {
  const [preset, setPreset] = React.useState(null);
  const [typeFilter, setTypeFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [creatorFilter, setCreatorFilter] = React.useState('');
  const [dateEnabled, setDateEnabled] = React.useState(false);
  const [startMonth, setStartMonth] = React.useState('');
  const [endMonth, setEndMonth] = React.useState('');
  const [presetName, setPresetName] = React.useState('');

  const presets = ['预设名称1', '预设名称2', '预设名称3', '预设名称4'];

  return (
    <>
      {/* 遮罩 */}
      <div
        onClick={onClose}
        style={{
          position:'fixed', inset:0,
          background:'rgba(16,24,40,.3)', zIndex:40
        }}
      />

      {/* 抽屉面板 */}
      <div style={{
        position:'fixed', top:0, right:0,
        height:'100vh', width:380,
        background:'#fff',
        boxShadow:'-4px 0 24px rgba(16,24,40,.1)',
        display:'flex', flexDirection:'column', zIndex:41,
        animation:'awFilterSlideIn .22s ease-out'
      }}>

        {/* 头部 */}
        <div style={{
          padding:'16px 20px',
          borderBottom:'1px solid #F0F1F4',
          flexShrink:0
        }}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <span style={{width:3, height:14, background:'#5677FC', borderRadius:2, display:'inline-block'}}/>
              <span style={{fontSize:15, fontWeight:600}}>筛选</span>
            </div>
            <span onClick={onClose} style={{cursor:'pointer', color:'#9CA3AF', fontSize:16, lineHeight:1}}>✕</span>
          </div>
          <div style={{fontSize:12, color:'#6B7280', marginTop:4, paddingLeft:11}}>
            配置筛选条件或使用预设快速筛选
          </div>
        </div>

        {/* 主体 */}
        <div style={{flex:1, overflowY:'auto', padding:'16px 20px'}}>

          {/* 常用筛选预设 */}
          <div style={{marginBottom:16}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
              <span style={{fontSize:13, fontWeight:600}}>常用筛选预设</span>
              <span
                onClick={() => setPreset(null)}
                style={{fontSize:12, color:'#5677FC', cursor:'pointer'}}
              >清空</span>
            </div>
            <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
              {presets.map(name => (
                <span
                  key={name}
                  onClick={() => setPreset(preset === name ? null : name)}
                  style={{
                    padding:'5px 12px',
                    border:'1px solid ' + (preset === name ? '#5677FC' : '#E5E7EB'),
                    borderRadius:14, fontSize:12, cursor:'pointer',
                    background: preset === name ? '#EEF1FF' : '#fff',
                    color: preset === name ? '#5677FC' : '#1F2937',
                    transition:'all .15s'
                  }}
                >{name}</span>
              ))}
            </div>
          </div>

          <div style={{borderTop:'1px solid #F0F1F4', margin:'16px 0'}}/>

          {/* 自定义筛选条件 */}
          <div style={{fontSize:13, fontWeight:600, marginBottom:12}}>自定义筛选条件</div>

          {/* 类型 */}
          <div style={{marginBottom:12}}>
            <label style={{fontSize:12, color:'#6B7280', display:'block', marginBottom:4}}>类型</label>
            <select
              className="aw-select"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              style={{width:'100%'}}
            >
              <option value="">全部</option>
              <option value="plan">工艺方案</option>
              <option value="craft">工艺文件</option>
              <option value="tech">技术文档</option>
              <option value="spec">操作规范</option>
            </select>
          </div>

          {/* 状态 */}
          <div style={{marginBottom:12}}>
            <label style={{fontSize:12, color:'#6B7280', display:'block', marginBottom:4}}>状态</label>
            <select
              className="aw-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{width:'100%'}}
            >
              <option value="">全部</option>
              <option value="published">已发布</option>
              <option value="review">待审核</option>
              <option value="disabled">已停用</option>
              <option value="draft">草稿</option>
            </select>
          </div>

          {/* 编制人 */}
          <div style={{marginBottom:12}}>
            <label style={{fontSize:12, color:'#6B7280', display:'block', marginBottom:4}}>编制人</label>
            <select
              className="aw-select"
              value={creatorFilter}
              onChange={e => setCreatorFilter(e.target.value)}
              style={{width:'100%'}}
            >
              <option value="">全部</option>
              <option value="laoxia">老夏</option>
              <option value="liwentao">李文涛</option>
              <option value="chensiyuan">陈思源</option>
            </select>
          </div>

          {/* 起止日期 */}
          <div style={{marginBottom:12}}>
            <label style={{fontSize:12, color:'#6B7280', display:'block', marginBottom:4}}>起止日期</label>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <span
                className={'aw-chk' + (dateEnabled ? ' on' : '')}
                onClick={() => setDateEnabled(v => !v)}
              />
              <input
                type="text"
                placeholder="开始月份"
                value={startMonth}
                onChange={e => setStartMonth(e.target.value)}
                disabled={!dateEnabled}
                style={{
                  flex:1, padding:'6px 10px',
                  border:'1px solid #E5E7EB', borderRadius:6,
                  fontSize:13, outline:'none',
                  background: dateEnabled ? '#fff' : '#F5F6FA',
                  color: dateEnabled ? '#1F2937' : '#9CA3AF'
                }}
              />
              <span style={{fontSize:13, color:'#6B7280', flexShrink:0}}>至</span>
              <input
                type="text"
                placeholder="结束月份"
                value={endMonth}
                onChange={e => setEndMonth(e.target.value)}
                disabled={!dateEnabled}
                style={{
                  flex:1, padding:'6px 10px',
                  border:'1px solid #E5E7EB', borderRadius:6,
                  fontSize:13, outline:'none',
                  background: dateEnabled ? '#fff' : '#F5F6FA',
                  color: dateEnabled ? '#1F2937' : '#9CA3AF'
                }}
              />
            </div>
          </div>

          {/* 保存为预设 */}
          <div style={{marginTop:24, paddingTop:16, borderTop:'1px solid #F0F1F4'}}>
            <label style={{
              fontSize:13, fontWeight:500,
              display:'flex', alignItems:'center', gap:4,
              marginBottom:8
            }}>
              保存为预设
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="#9CA3AF" strokeWidth="2">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 8v1M12 12v4"/>
              </svg>
            </label>
            <div style={{display:'flex', gap:8}}>
              <input
                className="aw-input"
                placeholder="请输入预设名称"
                value={presetName}
                onChange={e => setPresetName(e.target.value)}
                style={{flex:1}}
              />
              <button style={{
                border:'1px solid #E5E7EB', borderRadius:6,
                padding:'6px 10px', cursor:'pointer',
                background:'#fff', display:'flex',
                alignItems:'center', justifyContent:'center'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="#4B5563" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
              </button>
            </div>
          </div>

        </div>

        {/* 底部 */}
        <div style={{
          padding:'12px 20px',
          borderTop:'1px solid #F0F1F4',
          display:'flex', justifyContent:'space-between',
          alignItems:'center', flexShrink:0
        }}>
          <div style={{display:'flex', alignItems:'center', gap:6}}>
            <svg width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="#9CA3AF" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              style={{cursor:'pointer'}}
              onClick={() => {
                setPreset(null); setTypeFilter(''); setStatusFilter('');
                setCreatorFilter(''); setDateEnabled(false);
                setStartMonth(''); setEndMonth('');
              }}
            >
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
            <span
              onClick={() => {
                setPreset(null); setTypeFilter(''); setStatusFilter('');
                setCreatorFilter(''); setDateEnabled(false);
                setStartMonth(''); setEndMonth('');
              }}
              style={{fontSize:13, color:'#5677FC', cursor:'pointer'}}
            >重置</span>
          </div>
          <button
            className="aw-btn primary"
            style={{width:120}}
            onClick={onClose}
          >筛选</button>
        </div>

      </div>

      {/* 动画 keyframe（只注入一次）*/}
      <style>{`
        @keyframes awFilterSlideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

window.FilterDrawer = FilterDrawer;
