<template>
  <operation-setting-page v-if="settingModule" :module="settingModule" />

  <div v-else class="production-schedule-page">
    <div v-if="actionMessage" class="aw-form-note schedule-message">{{ actionMessage }}</div>

    <div class="aw-meta-bar schedule-stats">
      <button type="button" class="schedule-stat" @click="noop">
        <span>本周计划工时</span>
        <strong>{{ totalHours }} h</strong>
      </button>
      <button type="button" class="schedule-stat warn" @click="openModal('conflicts')">
        <span>冲突提醒</span>
        <strong>{{ schedule.conflicts.length }} 条</strong>
      </button>
      <button type="button" class="schedule-stat" @click="switchPage('排班计划')">
        <span>待审批计划</span>
        <strong>{{ pendingPlanCount }} 份</strong>
      </button>
      <button type="button" class="schedule-stat" @click="noop">
        <span>加班工时</span>
        <strong>{{ overtimeHours }} h</strong>
      </button>
    </div>

    <section class="schedule-card">
      <div v-if="currentPage === '排班列表'" class="schedule-roster-page">
        <aside class="aw-doc-tree">
          <div class="aw-doc-tree-h">车间分组 <span class="aw-doc-tree-n">({{ Math.max(schedule.workshops.length - 1, 0) }})</span></div>
          <div class="aw-doc-tree-list">
            <div
              v-for="(workshop, index) in schedule.workshops"
              :key="workshop"
              :class="['aw-tree-row', 'aw-tree-l2', { on: rosterWorkshop === workshop }]"
              @click="selectRosterWorkshop(workshop)"
            >
              <span class="aw-tree-caret">{{ index === 0 ? '▾' : '' }}</span>
              <span class="aw-line-icon line-folder" />
              <span>{{ workshop }}</span>
              <em>{{ rosterWorkshopCount(workshop) }}</em>
            </div>
          </div>
        </aside>
        <div class="aw-doc-main">
          <div class="aw-list-toolbar schedule-toolbar">
            <div class="aw-toolbar-left">
              <div class="aw-search">
                <span class="aw-line-icon line-search" />
                <input v-model="rosterKeyword" placeholder="搜索姓名、工号、班组、技能、工位" />
              </div>
            </div>
            <div class="aw-toolbar-right">
              <button class="aw-tool-btn" type="button" @click="rosterView = rosterView === '周视图' ? '月视图' : '周视图'">{{ rosterView }}</button>
              <button class="aw-tool-btn" type="button" @click="runScheduleAction('batch-adjust')">批量调班</button>
              <button class="aw-btn primary" type="button" @click="openNew">新增排班</button>
            </div>
          </div>
          <div class="aw-meta-bar schedule-plan-meta">
            <span><em>当前计划</em><b>{{ activePlan.code }}</b></span>
            <span><em>循环模式</em><b>{{ activePlan.pattern }}</b></span>
            <span><em>参考日历</em><b>{{ activePlan.calendar }}</b></span>
            <span><em>周期</em><b>{{ activePlan.start }} 至 {{ activePlan.end }}</b></span>
            <span><em>覆盖率</em><b>{{ activePlan.coverage }}</b></span>
          </div>
          <div class="aw-doc-tbl-wrap schedule-roster-wrap">
            <div class="aw-doc-tbl-inner">
              <table class="aw-doc-tbl schedule-roster-table">
                <thead>
                  <tr>
                    <th><div class="aw-th-inner">员工</div></th>
                    <th><div class="aw-th-inner">工号</div></th>
                    <th><div class="aw-th-inner">班组</div></th>
                    <th><div class="aw-th-inner">工位/产线</div></th>
                    <th><div class="aw-th-inner">技能资质</div></th>
                    <th><div class="aw-th-inner">本周工时</div></th>
                    <th><div class="aw-th-inner">来源</div></th>
                    <th v-for="day in schedule.days" :key="day"><div class="aw-th-inner">{{ day }}</div></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="employee in rosterRows" :key="employee.no">
                    <td>
                      <div class="schedule-person">
                        <span>{{ employee.name.slice(0, 1) }}</span>
                        {{ employee.name }}
                      </div>
                    </td>
                    <td class="aw-num">{{ employee.no }}</td>
                    <td>{{ employee.team }}</td>
                    <td>{{ employee.station }}</td>
                    <td>{{ employee.skill }} / {{ employee.cert }}</td>
                    <td class="aw-num" :class="{ danger: employeeWeekHours(employee) > employee.weeklyLimit }">{{ employeeWeekHours(employee) }}h / {{ employee.weeklyLimit }}h</td>
                    <td>{{ employee.source }}</td>
                    <td v-for="(shiftCode, index) in employee.shifts" :key="`${employee.no}-${index}`" class="schedule-shift-cell">
                      <span class="schedule-shift-chip clickable" :style="shiftChipStyle(shiftCode)" @click="openCell(employee, index)">
                        <span class="aw-num">{{ shiftCode || '+' }}</span>
                        <span v-if="shiftCode">{{ shiftByCode(shiftCode)?.short }}</span>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="aw-meta-bar schedule-counts">
            本周工时合计 <b>{{ rosterTotalHours }}h</b>
            <span v-for="shift in schedule.shifts" :key="shift.code">{{ shift.code }}{{ shift.short }} <b>{{ rosterShiftCounts[shift.code] || 0 }}</b></span>
            <span>休息天数 <b>{{ rosterShiftCounts.R || 0 }}</b></span>
          </div>
        </div>
      </div>

      <div v-else-if="currentPage === '排班计划'" class="aw-doc-main">
        <div class="aw-list-toolbar schedule-toolbar">
          <div class="aw-toolbar-left">
            <div class="aw-search">
              <span class="aw-line-icon line-search" />
              <input v-model="planKeyword" placeholder="搜索计划编号、计划名称、适用班组" />
            </div>
          </div>
          <div class="aw-toolbar-right">
            <button class="aw-tool-btn" type="button" @click="runScheduleAction('publish')">发布 {{ selectedPlans.length ? `(${selectedPlans.length})` : '' }}</button>
            <button class="aw-tool-btn" type="button" @click="runScheduleAction('archive')">归档</button>
            <button class="aw-tool-btn" type="button" @click="openModal('conflicts')">冲突校验</button>
            <button class="aw-btn primary" type="button" @click="openNew">新增排班计划</button>
          </div>
        </div>
        <div class="aw-doc-tbl-wrap">
          <div class="aw-doc-tbl-inner">
            <table class="aw-doc-tbl schedule-plan-table">
              <thead>
                <tr>
                  <th class="aw-check-col">
                    <label class="aw-check">
                      <input type="checkbox" :checked="allPlansChecked" :indeterminate.prop="somePlansChecked && !allPlansChecked" @change="toggleAllPlans" />
                      <span />
                    </label>
                  </th>
                  <th><div class="aw-th-inner">序号</div></th>
                  <th v-for="header in planHeaders" :key="header"><div class="aw-th-inner">{{ header }}</div></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(plan, index) in planRows" :key="plan.code">
                  <td>
                    <label class="aw-check">
                      <input type="checkbox" :checked="selectedPlans.includes(plan.code)" @change="togglePlan(plan.code)" />
                      <span />
                    </label>
                  </td>
                  <td>{{ index + 1 }}</td>
                  <td class="aw-num">{{ plan.code }}</td>
                  <td><span class="aw-link" @click="openModal('planDetail', plan)">{{ plan.name }}</span></td>
                  <td>{{ plan.team }}</td>
                  <td>{{ plan.pattern }}</td>
                  <td>{{ plan.start }} 至 {{ plan.end }}</td>
                  <td>{{ plan.people }}</td>
                  <td>{{ plan.hours }}</td>
                  <td>{{ plan.demandHours }}</td>
                  <td>{{ plan.coverage }}</td>
                  <td :class="plan.conflicts ? 'danger' : 'success'">{{ plan.conflicts }}</td>
                  <td>{{ plan.approval }}</td>
                  <td><span :class="['aw-status', statusTone(plan.status)]">{{ plan.status }}</span></td>
                  <td><span class="aw-link" @click="openModal('planDetail', plan)">查看</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="aw-list-footer">
          <div class="aw-footer-left">
            <label class="aw-check">
              <input type="checkbox" :checked="allPlansChecked" :indeterminate.prop="somePlansChecked && !allPlansChecked" @change="toggleAllPlans" />
              <span />
            </label>
            <span>共 {{ planRows.length }} 条</span>
            <span>已选 {{ selectedPlans.length }} 条</span>
            <button class="aw-bulk-btn" type="button" @click="runScheduleAction('publish')">发布</button>
            <button class="aw-bulk-btn" type="button" @click="runScheduleAction('archive')">归档</button>
          </div>
          <div class="aw-pagination">
            <button type="button">上一页</button>
            <button class="on" type="button">1</button>
            <button type="button">下一页</button>
          </div>
        </div>
      </div>

      <div v-else-if="currentPage === '生产班组'" class="schedule-team-page">
        <aside class="aw-doc-tree">
          <div class="aw-doc-tree-h">车间分组 <span class="aw-doc-tree-n">(4)</span></div>
          <div class="aw-doc-tree-list">
            <div
              v-for="(workshop, index) in schedule.workshops"
              :key="workshop"
              :class="['aw-tree-row', 'aw-tree-l2', { on: activeWorkshop === workshop }]"
              @click="activeWorkshop = workshop"
            >
              <span class="aw-tree-caret">{{ index === 0 ? '▾' : '' }}</span>
              <span class="aw-line-icon line-folder" />
              <span>{{ workshop }}</span>
            </div>
          </div>
        </aside>
        <div class="aw-doc-main">
          <div class="aw-list-toolbar schedule-toolbar">
            <div class="aw-toolbar-left">
              <div class="aw-search">
                <span class="aw-line-icon line-search" />
                <input v-model="teamKeyword" placeholder="搜索班组名称、班组长、技能方向" />
              </div>
            </div>
            <div class="aw-toolbar-right">
              <button class="aw-tool-btn" type="button" @click="runScheduleAction('team-export')">导出</button>
              <button class="aw-btn primary" type="button" @click="openNew">新建班组</button>
            </div>
          </div>
          <div class="schedule-team-grid">
            <article v-for="team in teamRows" :key="team.code" class="schedule-team-card" @click="openModal('teamDetail', team)">
              <div class="schedule-card-head">
                <b>{{ team.name }}</b>
                <span class="aw-status">{{ team.pattern }}</span>
              </div>
              <p>{{ team.workshop }} · {{ team.line }} · 班组长 {{ team.leader }}</p>
              <div class="schedule-tags">
                <span v-for="skill in team.skills" :key="skill">{{ skill }}</span>
              </div>
              <div class="schedule-team-metrics">
                <span>成员<b>{{ team.members }}</b></span>
                <span>产能<b>{{ team.capacity }}</b></span>
                <span>需求<b>{{ team.demand }}</b></span>
                <span>到岗率<b>{{ team.attendance }}</b></span>
              </div>
            </article>
          </div>
        </div>
      </div>

      <div v-else-if="currentPage === '工作日历'" class="aw-doc-main">
        <div class="aw-list-toolbar schedule-toolbar">
          <div class="aw-toolbar-left">
            <div class="aw-search">
              <span class="aw-line-icon line-search" />
              <input v-model="calendarKeyword" placeholder="搜索日历名称、适用范围" />
            </div>
          </div>
          <div class="aw-toolbar-right">
            <select v-model="selectedCalendarId" class="aw-select compact">
              <option v-for="calendar in calendarOptions" :key="calendar.id" :value="calendar.id">{{ calendar.name }}</option>
            </select>
            <select v-model="calendarMonth" class="aw-select compact">
              <option v-for="month in calendarMonthOptions" :key="month" :value="month">{{ month }}</option>
            </select>
            <button class="aw-tool-btn" type="button" @click="runScheduleAction('sync-holiday')">同步法定节假日</button>
            <button class="aw-tool-btn" type="button" @click="openCalendarEdit">编辑工作日历</button>
            <button class="aw-btn primary" type="button" @click="openNew">新增工作日历</button>
          </div>
        </div>
        <div class="schedule-calendar-body">
          <div class="aw-meta-bar schedule-calendar-meta">
            <div>
              <b>{{ calendarTitle }}</b>
              <span>工作制：{{ currentCalendar.workMode }} · 继承来源：{{ currentCalendar.inheritFrom }} · 适用范围：{{ currentCalendar.scope }}</span>
            </div>
            <div class="schedule-legend">
              <span><i></i>工作</span>
              <span><i class="rest"></i>休息</span>
              <span><i class="holiday"></i>节假日</span>
              <span><i class="swap"></i>调班</span>
            </div>
          </div>
          <div class="schedule-exception-grid">
            <article v-for="item in calendarExceptions" :key="item.date || item.day">
              <div><b>{{ item.day }}</b><span :class="['aw-status', item.type === '节假日' ? 'red' : '']">{{ item.type }}</span></div>
              <p>{{ item.rule }} · {{ item.note }}</p>
            </article>
            <article v-if="!calendarExceptions.length" class="schedule-empty-exception">
              <div><b>{{ calendarMonth }}</b><span class="aw-status gray">无例外日</span></div>
              <p>当前月份按工作制自动生成工作日与休息日。</p>
            </article>
          </div>
          <div class="schedule-month-grid">
            <div v-for="week in weekdays" :key="week" class="schedule-week-head">{{ week }}</div>
            <div v-for="cell in calendarDayCells" :key="cell.key" :class="['schedule-day', calendarCellClass(cell)]">
              <template v-if="!cell.blank">
                <div><b>{{ cell.day }}</b><span>{{ cell.type }}</span></div>
                <p>{{ cell.rule }}</p>
              </template>
            </div>
          </div>
          <div class="schedule-calendar-total">
            <span>工作日 {{ calendarTotals.work }} 天</span>
            <span>休息日 {{ calendarTotals.rest }} 天</span>
            <span>节假日 {{ calendarTotals.holiday }} 天</span>
            <span>调班 {{ calendarTotals.swap }} 天</span>
          </div>
        </div>
      </div>

      <div v-else-if="currentPage === '班次管理'" class="aw-doc-main">
        <div class="aw-list-toolbar schedule-toolbar">
          <div class="aw-toolbar-left">
            <div class="aw-search">
              <span class="aw-line-icon line-search" />
              <input v-model="shiftKeyword" placeholder="搜索班次编码、班次名称、起止时间" />
            </div>
          </div>
          <div class="aw-toolbar-right">
            <button class="aw-tool-btn" type="button" @click="runScheduleAction('disable-shifts')">批量停用 {{ selectedShifts.length ? `(${selectedShifts.length})` : '' }}</button>
            <button class="aw-tool-btn" type="button" @click="runScheduleAction('shift-export')">导出</button>
            <button class="aw-btn primary" type="button" @click="openNew">新增班次</button>
          </div>
        </div>
        <div class="schedule-shift-grid">
          <article v-for="shift in shiftRows" :key="shift.code" class="schedule-shift-card">
            <label class="aw-check">
              <input type="checkbox" :checked="selectedShifts.includes(shift.code)" @change="toggleShift(shift.code)" />
              <span />
            </label>
            <div class="schedule-shift-icon" :style="{ background: shift.color, color: shift.fg }">{{ shift.code }}</div>
            <div>
              <div class="schedule-card-head">
                <b>{{ shift.name }}</b>
                <span :class="['aw-status', statusTone(shift.status)]">{{ shift.status }}</span>
              </div>
              <p>起止 {{ shift.time }} · 工时 {{ shift.hours }}h · 休息 {{ shift.rest }}</p>
              <p>{{ shift.cross ? '跨天班次' : '当日班次' }} · 倍率 {{ shift.ratio }} · 打卡窗口 前30后30 · {{ shift.preset ? '系统预置，不可删除' : '自定义' }}</p>
            </div>
            <span class="aw-link" @click="openModal('shiftEdit', shift)">编辑</span>
          </article>
        </div>
      </div>
    </section>

    <div v-if="modal" class="aw-mask" @click="closeModal">
      <div :class="['aw-modal', 'schedule-modal', modalLarge ? 'lg' : '']" @click.stop>
        <div class="head">
          <span>
            <span class="aw-modal-title">{{ modalTitle }}</span>
            <span v-if="modalSubtitle" class="aw-modal-sub">{{ modalSubtitle }}</span>
          </span>
          <button class="aw-modal-close" type="button" @click="closeModal">×</button>
        </div>
        <div class="body">
          <div v-if="modal.type === 'cell'" class="schedule-modal-body">
            <div class="schedule-shift-picker">
              <button
                v-for="shift in schedule.shifts"
                :key="shift.code"
                type="button"
                :class="{ on: modalForm.shift === shift.code }"
                @click="modalForm.shift = shift.code"
              >
                <span class="schedule-shift-chip" :style="shiftChipStyle(shift.code)">
                  <span class="aw-num">{{ shift.code }}</span><span>{{ shift.short }}</span>
                </span>
                <small>{{ shift.time }}</small>
              </button>
              <button type="button" :class="{ on: modalForm.shift === '' }" @click="modalForm.shift = ''">清空</button>
            </div>
            <label class="aw-field">
              <span>调整原因</span>
              <input v-model="modalForm.reason" class="aw-input" placeholder="请假、调班、临时加班等" />
            </label>
            <div class="aw-meta-bar">保存后记录调整来源、原因和操作留痕；已发布或锁定日期在真实系统中应触发审批。</div>
          </div>

          <div v-else-if="modal.type === 'shift' || modal.type === 'shiftEdit'" class="schedule-form two">
            <label class="aw-field req"><span>班次编码</span><input v-model="modalForm.code" class="aw-input" /></label>
            <label class="aw-field req"><span>班次名称</span><input v-model="modalForm.name" class="aw-input" /></label>
            <label class="aw-field req"><span>开始时间</span><input v-model="modalForm.startTime" class="aw-input" /></label>
            <label class="aw-field req"><span>结束时间</span><input v-model="modalForm.endTime" class="aw-input" /></label>
            <label class="aw-field"><span>标准工时</span><input v-model="modalForm.hours" class="aw-input" /></label>
            <label class="aw-field"><span>休息时长</span><input v-model="modalForm.rest" class="aw-input" /></label>
            <label class="aw-field"><span>工时倍率</span><input v-model="modalForm.ratio" class="aw-input" /></label>
            <label class="aw-field"><span>打卡窗口</span><input v-model="modalForm.clockWindow" class="aw-input" /></label>
            <label class="aw-field"><span>是否跨天</span><select v-model="modalForm.cross" class="aw-select"><option>否</option><option>是</option></select></label>
            <label class="aw-field"><span>状态</span><select v-model="modalForm.status" class="aw-select"><option>启用</option><option>停用</option></select></label>
          </div>

          <div v-else-if="modal.type === 'calendar' || modal.type === 'calendarEdit'">
            <div class="schedule-form two">
              <label class="aw-field req"><span>日历名称</span><input v-model="modalForm.name" class="aw-input" /></label>
              <label class="aw-field req"><span>适用范围</span><select v-model="modalForm.scope" class="aw-select"><option>全公司</option><option>总装车间</option><option>焊接车间</option></select></label>
              <label class="aw-field"><span>工作制</span><select v-model="modalForm.workMode" class="aw-select"><option>双休</option><option>单休</option><option>大小周</option></select></label>
              <label class="aw-field"><span>继承来源</span><input v-model="modalForm.inheritFrom" class="aw-input" /></label>
              <label class="aw-field"><span>节假日规则</span><input v-model="modalForm.holidayRule" class="aw-input" /></label>
              <label class="aw-field"><span>调班规则</span><input v-model="modalForm.swapRule" class="aw-input" /></label>
            </div>
            <div class="schedule-section-head">
              <div class="schedule-section-title">例外日规则</div>
              <button class="aw-tool-btn" type="button" @click="addCalendarException">新增例外日</button>
            </div>
            <table class="aw-table schedule-exception-table">
              <thead><tr><th>日期</th><th>类型</th><th>规则</th><th>说明</th><th>操作</th></tr></thead>
              <tbody>
                <tr v-for="(item, index) in modalExceptions" :key="item.key">
                  <td><input v-model="item.date" class="aw-input" type="date" /></td>
                  <td><select v-model="item.type" class="aw-select"><option>工作</option><option>休息</option><option>节假日</option><option>调班</option></select></td>
                  <td><input v-model="item.rule" class="aw-input" /></td>
                  <td><input v-model="item.note" class="aw-input" /></td>
                  <td><span class="aw-link" @click="removeCalendarException(index)">删除</span></td>
                </tr>
                <tr v-if="!modalExceptions.length"><td colspan="5" class="schedule-empty-cell">暂无例外日</td></tr>
              </tbody>
            </table>
          </div>

          <div v-else-if="modal.type === 'team'" class="schedule-form two">
            <label class="aw-field req"><span>班组名称</span><input v-model="modalForm.name" class="aw-input" /></label>
            <label class="aw-field req"><span>所属车间</span><select v-model="modalForm.workshop" class="aw-select"><option>总装车间</option><option>焊接车间</option></select></label>
            <label class="aw-field req"><span>适用产线</span><input v-model="modalForm.line" class="aw-input" /></label>
            <label class="aw-field req"><span>班组长</span><input v-model="modalForm.leader" class="aw-input" /></label>
            <label class="aw-field req"><span>班次模式</span><select v-model="modalForm.pattern" class="aw-select"><option>常白</option><option>两班倒</option><option>三班两运转</option><option>四班三倒</option><option>自定义</option></select></label>
            <label class="aw-field"><span>技能方向</span><input v-model="modalForm.skills" class="aw-input" /></label>
            <label class="aw-field"><span>岗位编制</span><input v-model="modalForm.staffing" class="aw-input" /></label>
            <label class="aw-field"><span>替补规则</span><input v-model="modalForm.backupRule" class="aw-input" /></label>
          </div>

          <div v-else-if="modal.type === 'plan'">
            <div class="schedule-section-title">基础信息</div>
            <div class="schedule-form two">
              <label class="aw-field req"><span>计划名称</span><input v-model="modalForm.name" class="aw-input" /></label>
              <label class="aw-field req"><span>适用班组</span><select v-model="modalForm.team" class="aw-select"><option>总装一班</option><option>焊接夜班</option></select></label>
              <label class="aw-field req"><span>适用车间/产线</span><input v-model="modalForm.line" class="aw-input" /></label>
              <label class="aw-field req"><span>参考工作日历</span><select v-model="modalForm.calendar" class="aw-select"><option v-for="calendar in schedule.calendars" :key="calendar.id">{{ calendar.name }}</option></select></label>
              <label class="aw-field req"><span>周期</span><input v-model="modalForm.period" class="aw-input" /></label>
              <label class="aw-field"><span>排班策略</span><select v-model="modalForm.strategy" class="aw-select"><option>均衡工时优先</option><option>产能优先</option><option>技能优先</option></select></label>
            </div>
            <div class="schedule-section-title">循环模式</div>
            <div class="schedule-pattern">
              <span v-for="code in ['A', 'B', 'C', 'R']" :key="code" class="schedule-shift-chip" :style="shiftChipStyle(code)">
                <span class="aw-num">{{ code }}</span><span>{{ shiftByCode(code)?.short }}</span>
              </span>
            </div>
            <div class="schedule-section-title">发布前校验</div>
            <div class="schedule-info-grid">
              <label><span>需求工时</span><input class="aw-input" value="688h" readonly /></label>
              <label><span>计划工时</span><input class="aw-input" value="720h" readonly /></label>
              <label><span>冲突数</span><input class="aw-input" value="1 条" readonly /></label>
            </div>
          </div>

          <div v-else-if="modal.type === 'roster'" class="schedule-form two">
            <label class="aw-field req"><span>班组</span><select v-model="modalForm.team" class="aw-select"><option>总装一班</option></select></label>
            <label class="aw-field req"><span>排班周期</span><input v-model="modalForm.period" class="aw-input" /></label>
            <label class="aw-field"><span>生成方式</span><select v-model="modalForm.generateMode" class="aw-select"><option>按计划生成</option><option>手动新增</option><option>按工单负荷生成</option></select></label>
            <label class="aw-field"><span>是否覆盖已有排班</span><select v-model="modalForm.cover" class="aw-select"><option>否</option><option>是</option></select></label>
            <label class="aw-field"><span>冲突处理</span><select v-model="modalForm.conflictMode" class="aw-select"><option>生成后标记冲突</option><option>自动避让冲突</option></select></label>
            <label class="aw-field"><span>锁定已发布日期</span><select v-model="modalForm.lockPublished" class="aw-select"><option>是</option><option>否</option></select></label>
          </div>

          <div v-else-if="modal.type === 'teamDetail'">
            <div class="schedule-info-grid">
              <label><span>班组编码</span><input class="aw-input" :value="(modal.data as ProductionScheduleTeam).code" readonly /></label>
              <label><span>适用产线</span><input class="aw-input" :value="(modal.data as ProductionScheduleTeam).line" readonly /></label>
              <label><span>默认班制</span><input class="aw-input" :value="(modal.data as ProductionScheduleTeam).pattern" readonly /></label>
            </div>
            <table class="aw-table">
              <thead><tr><th>姓名</th><th>工号</th><th>工位/产线</th><th>技能</th><th>资质</th><th>周工时上限</th><th>本月计划工时</th></tr></thead>
              <tbody>
                <tr v-for="employee in teamMembers(modal.data as ProductionScheduleTeam)" :key="employee.no">
                  <td>{{ employee.name }}</td><td>{{ employee.no }}</td><td>{{ employee.station }}</td><td>{{ employee.skill }}</td><td>{{ employee.cert }}</td><td>{{ employee.weeklyLimit }}h</td><td>{{ employeeWeekHours(employee) * 4 }}h</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else-if="modal.type === 'planDetail'">
            <div class="schedule-section-title">基础信息</div>
            <div class="schedule-info-grid">
              <label><span>计划编号</span><input class="aw-input" :value="(modal.data as ProductionSchedulePlan).code" readonly /></label>
              <label><span>计划名称</span><input class="aw-input" :value="(modal.data as ProductionSchedulePlan).name" readonly /></label>
              <label><span>适用班组</span><input class="aw-input" :value="(modal.data as ProductionSchedulePlan).team" readonly /></label>
              <label><span>计划周期</span><input class="aw-input" :value="`${(modal.data as ProductionSchedulePlan).start} 至 ${(modal.data as ProductionSchedulePlan).end}`" readonly /></label>
              <label><span>覆盖率</span><input class="aw-input" :value="(modal.data as ProductionSchedulePlan).coverage" readonly /></label>
              <label><span>状态</span><input class="aw-input" :value="(modal.data as ProductionSchedulePlan).status" readonly /></label>
            </div>
            <div class="schedule-section-title">循环模式预览</div>
            <div class="schedule-pattern">
              <span v-for="(code, index) in planPatternPreview(modal.data as ProductionSchedulePlan)" :key="index" class="schedule-shift-chip compact" :style="shiftChipStyle(code, true)">
                <span class="aw-num">{{ code }}</span>
              </span>
            </div>
            <div class="schedule-section-title">校验结果</div>
            <table class="aw-table">
              <thead><tr><th>等级</th><th>对象</th><th>问题</th><th>建议</th></tr></thead>
              <tbody>
                <tr v-for="item in schedule.conflicts.slice(0, (modal.data as ProductionSchedulePlan).conflicts || 1)" :key="item.target">
                  <td><span :class="['aw-status', item.level === '高' ? 'red' : 'yellow']">{{ item.level }}</span></td>
                  <td>{{ item.target }}</td>
                  <td>{{ item.issue }}</td>
                  <td>{{ item.fix }}</td>
                </tr>
              </tbody>
            </table>
            <div class="schedule-section-title">本期排班网格预览</div>
            <div class="aw-doc-tbl-wrap schedule-roster-wrap detail-preview">
              <div class="aw-doc-tbl-inner">
                <table class="aw-doc-tbl schedule-roster-table">
                  <thead><tr><th>员工</th><th>工号</th><th>班组</th><th v-for="day in schedule.days" :key="day">{{ day }}</th></tr></thead>
                  <tbody>
                    <tr v-for="employee in schedule.employees" :key="employee.no">
                      <td>{{ employee.name }}</td><td>{{ employee.no }}</td><td>{{ employee.team }}</td>
                      <td v-for="(code, index) in employee.shifts" :key="index"><span class="schedule-shift-chip compact" :style="shiftChipStyle(code, true)"><span class="aw-num">{{ code }}</span></span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <table v-else-if="modal.type === 'conflicts'" class="aw-table">
            <thead><tr><th>等级</th><th>定位</th><th>冲突规则</th><th>处理建议</th></tr></thead>
            <tbody>
              <tr v-for="item in schedule.conflicts" :key="item.target">
                <td><span :class="['aw-status', item.level === '高' ? 'red' : 'yellow']">{{ item.level }}</span></td>
                <td>{{ item.target }}</td>
                <td>{{ item.issue }}</td>
                <td>{{ item.fix }}</td>
              </tr>
            </tbody>
          </table>

          <div v-else-if="modal.type === 'policy'">
            <div class="schedule-form two">
              <label class="aw-field"><span>排班策略</span><select v-model="modalForm.strategy" class="aw-select"><option>均衡工时优先</option><option>产能优先</option><option>技能优先</option></select></label>
              <label class="aw-field"><span>最小休息间隔</span><input v-model="modalForm.restGap" class="aw-input" /></label>
              <label class="aw-field"><span>连续出勤上限</span><input v-model="modalForm.workLimit" class="aw-input" /></label>
              <label class="aw-field"><span>周工时上限</span><input v-model="modalForm.weeklyLimit" class="aw-input" /></label>
              <label class="aw-field"><span>节假日排班</span><select v-model="modalForm.holidayWork" class="aw-select"><option>需加班审批</option><option>禁止排班</option><option>允许排班并预警</option></select></label>
              <label class="aw-field"><span>发布后调整</span><select v-model="modalForm.adjustAfterPublish" class="aw-select"><option>记录原因并审批</option><option>仅记录原因</option></select></label>
            </div>
            <div class="schedule-section-title">校验规则</div>
            <table class="aw-table">
              <thead><tr><th>规则</th><th>处理方式</th><th>说明</th></tr></thead>
              <tbody>
                <tr><td>同日重叠班次</td><td>阻断发布</td><td>人员不可在同一时间窗重复排班</td></tr>
                <tr><td>资质不匹配</td><td>阻断发布</td><td>关键工序需满足技能和证书要求</td></tr>
                <tr><td>产能不足</td><td>预警</td><td>计划工时低于工单需求时给出补位建议</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="foot">
          <button class="aw-btn" type="button" @click="closeModal">{{ modalCancelText }}</button>
          <button v-if="showModalConfirm" class="aw-btn primary" type="button" @click="saveModal">{{ modalConfirmText }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  createProductionScheduleItem,
  createProductionWorkCalendar,
  getProductionScheduleData,
  getProductionWorkCalendarMonth,
  runProductionScheduleAction,
  syncProductionCalendarHolidays,
  updateProductionScheduleCell,
  updateProductionWorkCalendar,
} from '@/app/api/production/resources';
import type {
  ProductionScheduleCalendarException,
  ProductionScheduleData,
  ProductionScheduleEmployee,
  ProductionSchedulePlan,
  ProductionScheduleShift,
  ProductionScheduleTeam,
  ProductionWorkCalendar,
  ProductionWorkCalendarDay,
  ProductionWorkCalendarDayType,
  ProductionWorkCalendarMonth,
} from '@/app/api/production/types';
import OperationSettingPage from '@/views/operation/shared/OperationSettingPage.vue';

type SchedulePage = '排班列表' | '排班计划' | '生产班组' | '工作日历' | '班次管理';
type ModalType = 'cell' | 'shift' | 'shiftEdit' | 'calendar' | 'calendarEdit' | 'team' | 'plan' | 'roster' | 'teamDetail' | 'planDetail' | 'conflicts' | 'policy';

interface ScheduleModal {
  type: ModalType;
  data?: ProductionScheduleShift | ProductionScheduleTeam | ProductionSchedulePlan | ProductionScheduleEmployee | ProductionWorkCalendar;
  dayIndex?: number;
}

interface CalendarCell extends Partial<ProductionWorkCalendarDay> {
  key: string;
  blank: boolean;
}

interface EditableCalendarException {
  key: string;
  date: string;
  type: string;
  rule: string;
  note: string;
}

const route = useRoute();
const router = useRouter();
const planHeaders = ['计划编号', '计划名称', '适用班组', '循环模式', '周期', '人数', '计划工时', '需求工时', '覆盖率', '冲突', '审批', '状态', '操作'];
const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

const settingModule = computed(() => (route.query.setting ? 'productionSchedules' as const : null));
const currentPage = ref<SchedulePage>('排班列表');
const schedule = ref<ProductionScheduleData>(emptyScheduleData());
const actionMessage = ref('');
const modal = ref<ScheduleModal | null>(null);
const modalForm = reactive<Record<string, string>>({});
const modalExceptions = ref<EditableCalendarException[]>([]);

const rosterKeyword = ref('');
const rosterWorkshop = ref('全部车间');
const rosterView = ref('周视图');
const planKeyword = ref('');
const teamKeyword = ref('');
const shiftKeyword = ref('');
const calendarKeyword = ref('');
const selectedCalendarId = ref('');
const calendarMonth = ref('2026-06');
const calendarMonthData = ref<ProductionWorkCalendarMonth>(emptyCalendarMonth('', '2026-06'));
const activeWorkshop = ref('全部车间');
const selectedPlans = ref<string[]>(['SP-202606-A01']);
const selectedShifts = ref<string[]>([]);

const actionPageMap: Record<string, SchedulePage> = {
  排班列表: '排班列表',
  排班计划: '排班计划',
  生产班组: '生产班组',
  工作日历: '工作日历',
  班次管理: '班次管理',
};

const activePlan = computed(() => schedule.value.plans[0] || emptyPlan());
const teamWorkshopMap = computed(() => new Map(schedule.value.teams.map((team) => [team.name, team.workshop])));
const rosterRows = computed(() => {
  const key = rosterKeyword.value.trim().toLowerCase();
  return schedule.value.employees.filter((employee) => {
    const workshop = employeeWorkshop(employee);
    const text = `${employee.name}${employee.no}${employee.team}${employee.skill}${employee.station}${workshop}`.toLowerCase();
    const matchesKeyword = !key || text.includes(key);
    const matchesWorkshop = rosterWorkshop.value === '全部车间' || workshop === rosterWorkshop.value;
    return matchesKeyword && matchesWorkshop;
  });
});
const planRows = computed(() => {
  const key = planKeyword.value.trim().toLowerCase();
  return schedule.value.plans.filter((plan) => !key || `${plan.code}${plan.name}${plan.team}`.toLowerCase().includes(key));
});
const teamRows = computed(() => {
  const key = teamKeyword.value.trim().toLowerCase();
  return schedule.value.teams.filter((team) => {
    const text = `${team.name}${team.leader}${team.skills.join('')}`.toLowerCase();
    return (!key || text.includes(key)) && (activeWorkshop.value === '全部车间' || team.workshop === activeWorkshop.value);
  });
});
const shiftRows = computed(() => {
  const key = shiftKeyword.value.trim().toLowerCase();
  return schedule.value.shifts.filter((shift) => !key || `${shift.code}${shift.name}${shift.time}`.toLowerCase().includes(key));
});
const calendarOptions = computed(() => {
  const calendars = schedule.value.calendars || [];
  const key = calendarKeyword.value.trim().toLowerCase();
  if (!key) return calendars;
  const filtered = calendars.filter((calendar) => `${calendar.name}${calendar.scope}${calendar.workMode}`.toLowerCase().includes(key));
  return filtered.length ? filtered : calendars;
});
const currentCalendar = computed<ProductionWorkCalendar>(() => {
  return schedule.value.calendars.find((calendar) => calendar.id === selectedCalendarId.value) || schedule.value.calendars[0] || emptyCalendar();
});
const calendarMonthOptions = computed(() => {
  const months = Object.keys(currentCalendar.value.exceptionsByMonth || {});
  return Array.from(new Set(['2026-06', '2026-07', calendarMonth.value, ...months])).filter(Boolean).sort();
});
const calendarTitle = computed(() => `${calendarMonth.value.replace('-', '年')}月`);
const calendarExceptions = computed(() => calendarMonthData.value.exceptions || []);
const calendarDayCells = computed<CalendarCell[]>(() => {
  const days = calendarMonthData.value.days || [];
  const firstDay = days[0];
  const leading = firstDay ? Math.max(0, weekdays.indexOf(firstDay.weekday)) : 0;
  const cells: CalendarCell[] = Array.from({ length: leading }, (_, index) => ({ key: `blank-start-${index}`, blank: true }));
  days.forEach((day) => cells.push({ ...day, key: day.date, blank: false }));
  while (cells.length < 35 || cells.length % 7 !== 0) cells.push({ key: `blank-end-${cells.length}`, blank: true });
  return cells;
});
const calendarTotals = computed(() => {
  const days = calendarMonthData.value.days || [];
  return {
    work: days.filter((day) => !['周六', '周日'].includes(day.weekday)).length,
    rest: days.filter((day) => day.type === '休息').length,
    holiday: days.filter((day) => day.type === '节假日').length,
    swap: days.filter((day) => day.type === '调班').length,
  };
});
const shiftCounts = computed(() => {
  return schedule.value.shifts.reduce<Record<string, number>>((result, shift) => {
    result[shift.code] = schedule.value.employees.reduce((sum, employee) => sum + employee.shifts.filter((code) => code === shift.code).length, 0);
    return result;
  }, {});
});
const rosterShiftCounts = computed(() => {
  return schedule.value.shifts.reduce<Record<string, number>>((result, shift) => {
    result[shift.code] = rosterRows.value.reduce((sum, employee) => sum + employee.shifts.filter((code) => code === shift.code).length, 0);
    return result;
  }, {});
});
const totalHours = computed(() => schedule.value.employees.reduce((sum, employee) => sum + employeeWeekHours(employee), 0));
const rosterTotalHours = computed(() => rosterRows.value.reduce((sum, employee) => sum + employeeWeekHours(employee), 0));
const overtimeHours = computed(() => schedule.value.employees.reduce((sum, employee) => sum + Math.max(0, employeeWeekHours(employee) - employee.weeklyLimit), 0));
const pendingPlanCount = computed(() => schedule.value.plans.filter((plan) => plan.status === '待审批').length);
const allPlansChecked = computed(() => planRows.value.length > 0 && planRows.value.every((plan) => selectedPlans.value.includes(plan.code)));
const somePlansChecked = computed(() => planRows.value.some((plan) => selectedPlans.value.includes(plan.code)));
const modalLarge = computed(() => modal.value ? ['calendarEdit', 'teamDetail', 'planDetail', 'conflicts'].includes(modal.value.type) : false);
const modalTitle = computed(() => {
  const titles: Record<ModalType, string> = {
    cell: '调整班次',
    shift: '新增班次',
    shiftEdit: '编辑班次',
    calendar: '新增工作日历',
    calendarEdit: '编辑工作日历',
    team: '新建班组',
    plan: '新增排班计划',
    roster: '新增排班',
    teamDetail: '班组人员',
    planDetail: '排班计划详情',
    conflicts: '排班冲突校验',
    policy: '生产排班策略设置',
  };
  return modal.value ? titles[modal.value.type] : '';
});
const modalSubtitle = computed(() => {
  if (!modal.value) return '';
  if (modal.value.type === 'cell') return `${modalForm.employeeName || ''} · ${modalForm.day || ''}`;
  if (modal.value.type === 'planDetail') return (modal.value.data as ProductionSchedulePlan).code;
  if (modal.value.type === 'teamDetail') return (modal.value.data as ProductionScheduleTeam).name;
  return '';
});
const showModalConfirm = computed(() => modal.value ? !['teamDetail', 'planDetail', 'conflicts'].includes(modal.value.type) : false);
const modalConfirmText = computed(() => (modal.value?.type === 'cell' ? '保存调整' : '保存'));
const modalCancelText = computed(() => (showModalConfirm.value ? '取消' : '关闭'));

onMounted(loadSchedule);

watch(
  () => route.query.action,
  (value) => {
    const action = String(value || '');
    if (!action) return;
    if (actionPageMap[action]) {
      currentPage.value = actionPageMap[action];
      return;
    }
    if (action === '生产排班策略设置') openModal('policy');
    if (action === 'new' || action.startsWith('新增')) openNew();
  },
  { immediate: true },
);

watch([selectedCalendarId, calendarMonth], () => {
  void loadCalendarMonth();
});

async function loadSchedule() {
  schedule.value = await getProductionScheduleData();
  if (!schedule.value.workshops.includes(rosterWorkshop.value)) rosterWorkshop.value = '全部车间';
  if (!selectedCalendarId.value && schedule.value.calendars[0]) selectedCalendarId.value = schedule.value.calendars[0].id;
  if (!calendarMonthOptions.value.includes(calendarMonth.value)) calendarMonth.value = calendarMonthOptions.value[0] || '2026-06';
  await loadCalendarMonth();
}

function emptyScheduleData(): ProductionScheduleData {
  return { shifts: [], teams: [], plans: [], employees: [], days: [], calendarExceptions: [], calendars: [], conflicts: [], workshops: ['全部车间'] };
}

function emptyPlan(): ProductionSchedulePlan {
  return { code: '-', name: '-', team: '-', pattern: '-', calendar: '-', start: '-', end: '-', days: 0, people: 0, hours: 0, demandHours: 0, coverage: '-', conflicts: 0, approval: '-', status: '-' };
}

function emptyCalendar(): ProductionWorkCalendar {
  return {
    id: '',
    name: '-',
    scope: '-',
    workMode: '-',
    inheritFrom: '-',
    holidayRule: '-',
    swapRule: '-',
    status: '-',
    exceptionsByMonth: {},
  };
}

function emptyCalendarMonth(calendarId: string, month: string): ProductionWorkCalendarMonth {
  return {
    calendarId,
    month,
    days: [],
    exceptions: [],
  };
}

async function loadCalendarMonth() {
  const calendarId = selectedCalendarId.value || schedule.value.calendars[0]?.id || '';
  if (!calendarId) {
    calendarMonthData.value = emptyCalendarMonth('', calendarMonth.value);
    return;
  }
  calendarMonthData.value = await getProductionWorkCalendarMonth(calendarId, calendarMonth.value);
}

function switchPage(page: SchedulePage) {
  currentPage.value = page;
  const query = { ...route.query };
  delete query.setting;
  if (page === '排班列表') delete query.action;
  else query.action = page;
  void router.replace({ path: route.path, query });
}

function noop() {
  actionMessage.value = '该统计块与原 JSX 一致，仅作为排班总览入口展示。';
}

function shiftByCode(code: string) {
  return schedule.value.shifts.find((shift) => shift.code === code);
}

function shiftHours(code: string) {
  return Number(shiftByCode(code)?.hours || 0);
}

function employeeWeekHours(employee: ProductionScheduleEmployee) {
  return employee.shifts.reduce((sum, code) => sum + shiftHours(code), 0);
}

function employeeWorkshop(employee: ProductionScheduleEmployee) {
  return teamWorkshopMap.value.get(employee.team) || '未分组';
}

function rosterWorkshopCount(workshop: string) {
  return schedule.value.employees.filter((employee) => workshop === '全部车间' || employeeWorkshop(employee) === workshop).length;
}

function selectRosterWorkshop(workshop: string) {
  rosterWorkshop.value = workshop;
}

function shiftChipStyle(code: string, compact = false) {
  const shift = shiftByCode(code);
  if (!shift) {
    return {
      minWidth: compact ? '34px' : '54px',
      height: compact ? '24px' : '34px',
      border: '1px dashed var(--aw-border-strong)',
      color: 'var(--aw-fg-4)',
      background: '#fff',
    };
  }
  return {
    minWidth: compact ? '38px' : '58px',
    height: compact ? '24px' : '34px',
    background: shift.color,
    color: shift.fg,
    fontSize: compact ? '12px' : '13px',
  };
}

function statusTone(status: string) {
  if (['启用', '已发布', '已完成'].includes(status)) return 'green';
  if (['待审批', '生产中'].includes(status)) return 'yellow';
  if (['停用'].includes(status)) return 'red';
  return 'gray';
}

function togglePlan(code: string) {
  selectedPlans.value = selectedPlans.value.includes(code) ? selectedPlans.value.filter((item) => item !== code) : [...selectedPlans.value, code];
}

function toggleAllPlans() {
  selectedPlans.value = allPlansChecked.value ? [] : planRows.value.map((plan) => plan.code);
}

function toggleShift(code: string) {
  selectedShifts.value = selectedShifts.value.includes(code) ? selectedShifts.value.filter((item) => item !== code) : [...selectedShifts.value, code];
}

function openCell(employee: ProductionScheduleEmployee, dayIndex: number) {
  clearModalForm();
  Object.assign(modalForm, {
    employeeNo: employee.no,
    employeeName: employee.name,
    day: schedule.value.days[dayIndex],
    dayIndex: String(dayIndex),
    shift: employee.shifts[dayIndex] || '',
    reason: employee.reason === '-' ? '' : employee.reason,
  });
  modal.value = { type: 'cell', data: employee, dayIndex };
}

function openNew() {
  if (currentPage.value === '班次管理') openModal('shift');
  else if (currentPage.value === '工作日历') openModal('calendar');
  else if (currentPage.value === '生产班组') openModal('team');
  else if (currentPage.value === '排班计划') openModal('plan');
  else openModal('roster');
}

function openCalendarEdit() {
  openModal('calendarEdit', currentCalendar.value);
}

function openModal(type: ModalType, data?: ScheduleModal['data']) {
  clearModalForm();
  fillModalForm(type, data);
  modal.value = { type, data };
}

function closeModal() {
  modal.value = null;
}

function clearModalForm() {
  Object.keys(modalForm).forEach((key) => delete modalForm[key]);
  modalExceptions.value = [];
}

function fillModalForm(type: ModalType, data?: ScheduleModal['data']) {
  if (type === 'shift' || type === 'shiftEdit') {
    const shift = data as ProductionScheduleShift | undefined;
    Object.assign(modalForm, {
      code: shift?.code || 'F',
      name: shift?.name || '培训',
      startTime: (shift?.time || '09:00-12:00').split('-')[0],
      endTime: (shift?.time || '09:00-12:00').split('-')[1],
      hours: `${shift?.hours ?? 3}h`,
      rest: shift?.rest || '0分钟',
      ratio: shift?.ratio || '1.0x',
      clockWindow: '上班前30分钟 / 下班后30分钟',
      cross: shift?.cross ? '是' : '否',
      status: shift?.status || '启用',
    });
  }
  if (type === 'calendar' || type === 'calendarEdit') {
    const calendar = (data as ProductionWorkCalendar | undefined) || currentCalendar.value;
    Object.assign(modalForm, {
      name: calendar.name === '-' ? '2026标准工作日历' : calendar.name,
      scope: calendar.scope === '-' ? '全公司' : calendar.scope,
      workMode: calendar.workMode === '-' ? '双休' : calendar.workMode,
      inheritFrom: calendar.inheritFrom === '-' ? '集团标准日历' : calendar.inheritFrom,
      holidayRule: calendar.holidayRule === '-' ? '同步国务院法定节假日' : calendar.holidayRule,
      swapRule: calendar.swapRule === '-' ? '调班日若循环为R自动改A' : calendar.swapRule,
    });
    modalExceptions.value = calendarExceptions.value.map((item, index) => toEditableCalendarException(item, index));
  }
  if (type === 'team') {
    Object.assign(modalForm, {
      name: '总装二班',
      workshop: '总装车间',
      line: '总装产线B',
      leader: '陈思源',
      pattern: '三班两运转',
      skills: '总装、包装',
      staffing: '班组长1 / 技工12 / 质检1',
      backupRule: '同技能同车间优先补位',
    });
  }
  if (type === 'plan') {
    Object.assign(modalForm, {
      name: '2026年6月总装一班排班',
      team: '总装一班',
      line: '总装车间 / 总装产线A',
      calendar: '2026标准工作日历',
      period: '2026-06-01 至 2026-06-30',
      strategy: '均衡工时优先',
    });
  }
  if (type === 'roster') {
    Object.assign(modalForm, {
      team: '总装一班',
      period: '2026-06-01 至 2026-06-07',
      generateMode: '按计划生成',
      cover: '否',
      conflictMode: '生成后标记冲突',
      lockPublished: '是',
    });
  }
  if (type === 'policy') {
    Object.assign(modalForm, {
      strategy: '均衡工时优先',
      restGap: '夜班后至少 12 小时',
      workLimit: '6 天',
      weeklyLimit: '48 小时',
      holidayWork: '需加班审批',
      adjustAfterPublish: '记录原因并审批',
    });
  }
}

async function saveModal() {
  if (!modal.value) return;
  if (modal.value.type === 'cell') {
    await updateProductionScheduleCell({
      employeeNo: modalForm.employeeNo,
      dayIndex: Number(modalForm.dayIndex),
      shift: modalForm.shift,
      reason: modalForm.reason,
    });
    const employee = schedule.value.employees.find((item) => item.no === modalForm.employeeNo);
    if (employee) {
      employee.shifts[Number(modalForm.dayIndex)] = modalForm.shift;
      employee.source = '手工调整';
      employee.reason = modalForm.reason || '班次调整';
    }
    actionMessage.value = `已保存 ${modalForm.employeeName} ${modalForm.day} 的班次调整`;
    closeModal();
    return;
  }
  if (modal.value.type === 'shiftEdit') {
    await runProductionScheduleAction('shift/update', { ...modalForm });
    const shift = schedule.value.shifts.find((item) => item.code === (modal.value?.data as ProductionScheduleShift).code);
    if (shift) {
      shift.name = modalForm.name;
      shift.time = `${modalForm.startTime}-${modalForm.endTime}`;
      shift.hours = Number(modalForm.hours.replace(/[^\d.]/g, '') || 0);
      shift.rest = modalForm.rest;
      shift.ratio = modalForm.ratio;
      shift.cross = modalForm.cross === '是';
      shift.status = modalForm.status;
    }
    actionMessage.value = `已保存班次 ${modalForm.code}`;
    closeModal();
    return;
  }
  if (modal.value.type === 'policy') {
    await runProductionScheduleAction('policy', { ...modalForm });
    actionMessage.value = '已保存生产排班策略设置';
    closeModal();
    return;
  }
  if (modal.value.type === 'calendar') {
    const calendar = await createProductionWorkCalendar(buildCreatePayload('calendar'));
    selectedCalendarId.value = calendar.id;
    await loadSchedule();
    await loadCalendarMonth();
    actionMessage.value = `新增工作日历 已保存并调用生产排班 create API：${calendar.name}`;
    closeModal();
    return;
  }
  if (modal.value.type === 'calendarEdit') {
    const result = await updateProductionWorkCalendar(selectedCalendarId.value, buildCalendarPayload());
    await loadSchedule();
    selectedCalendarId.value = result.calendar.id;
    calendarMonthData.value = result.month;
    actionMessage.value = `编辑工作日历 已保存并调用生产排班 update API：${result.calendar.name}`;
    closeModal();
    return;
  }
  const typeMap: Partial<Record<ModalType, 'shift' | 'calendar' | 'team' | 'plan' | 'roster'>> = {
    shift: 'shift',
    team: 'team',
    plan: 'plan',
    roster: 'roster',
  };
  const createType = typeMap[modal.value.type];
  if (!createType) {
    closeModal();
    return;
  }
  await createProductionScheduleItem(createType, buildCreatePayload(createType));
  await loadSchedule();
  actionMessage.value = `${modalTitle.value} 已保存并调用生产排班 create API`;
  closeModal();
}

function buildCreatePayload(type: 'shift' | 'calendar' | 'team' | 'plan' | 'roster') {
  if (type === 'calendar') {
    return buildCalendarPayload();
  }
  if (type === 'shift') {
    return {
      code: modalForm.code,
      name: modalForm.name,
      short: modalForm.name.slice(0, 1),
      time: `${modalForm.startTime}-${modalForm.endTime}`,
      hours: Number(modalForm.hours.replace(/[^\d.]/g, '') || 0),
      rest: modalForm.rest,
      ratio: modalForm.ratio,
      color: '#E8F5F4',
      fg: '#16756A',
      cross: modalForm.cross === '是',
      status: modalForm.status,
      preset: false,
    };
  }
  if (type === 'team') {
    return {
      code: `TEAM-${Date.now()}`,
      name: modalForm.name,
      workshop: modalForm.workshop,
      line: modalForm.line,
      leader: modalForm.leader,
      pattern: modalForm.pattern,
      skills: modalForm.skills.split(/[、,]/).filter(Boolean),
      members: 0,
      hours: 0,
      attendance: '100%',
      capacity: 0,
      demand: 0,
      plan: '-',
      status: '启用',
    };
  }
  if (type === 'plan') {
    const [start, end] = modalForm.period.split(' 至 ');
    return {
      code: `SP-${Date.now()}`,
      name: modalForm.name,
      team: modalForm.team,
      pattern: 'A-B-C-R',
      calendar: modalForm.calendar,
      start,
      end: end || start,
      days: 30,
      people: 18,
      hours: 720,
      demandHours: 688,
      coverage: '104.7%',
      conflicts: 1,
      approval: '草稿未提交',
      status: '草稿',
    };
  }
  if (type === 'roster') {
    return {
      name: '新增排班',
      no: `P${Date.now().toString().slice(-3)}`,
      team: modalForm.team,
      station: '总装工位01',
      skill: '总装',
      cert: '装配上岗证',
      weeklyLimit: 48,
      shifts: ['A', 'B', 'C', 'R', 'A', 'R', 'R'],
      source: modalForm.generateMode,
      reason: '-',
    };
  }
  return { ...modalForm };
}

function buildCalendarPayload() {
  return {
    name: modalForm.name,
    scope: modalForm.scope,
    workMode: modalForm.workMode,
    inheritFrom: modalForm.inheritFrom,
    holidayRule: modalForm.holidayRule,
    swapRule: modalForm.swapRule,
    status: '启用',
    month: calendarMonth.value,
    baseCalendarId: selectedCalendarId.value,
    exceptions: modalExceptions.value
      .filter((item) => item.date || item.rule || item.note)
      .map((item) => ({
        date: item.date,
        day: calendarExceptionDayLabel(item.date),
        type: item.type,
        rule: item.rule || defaultCalendarExceptionRule(item.type),
        note: item.note,
      })),
  };
}

function toEditableCalendarException(item: ProductionScheduleCalendarException, index: number): EditableCalendarException {
  return {
    key: `${item.date || item.day || 'exception'}-${index}`,
    date: item.date || calendarExceptionDateFromDay(item.day),
    type: item.type || '休息',
    rule: item.rule || defaultCalendarExceptionRule(item.type),
    note: item.note || '',
  };
}

function addCalendarException() {
  const date = `${calendarMonth.value}-01`;
  modalExceptions.value = [
    ...modalExceptions.value,
    {
      key: `new-${Date.now()}`,
      date,
      type: '休息',
      rule: '强制休 R',
      note: '',
    },
  ];
}

function removeCalendarException(index: number) {
  modalExceptions.value = modalExceptions.value.filter((_, itemIndex) => itemIndex !== index);
}

function calendarExceptionDateFromDay(day: string) {
  const matched = day?.match(/\d{2}-\d{2}/);
  return matched ? `${calendarMonth.value.slice(0, 4)}-${matched[0]}` : `${calendarMonth.value}-01`;
}

function calendarExceptionDayLabel(date: string) {
  if (!date) return '';
  const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date(`${date}T00:00:00`).getDay()];
  return `${date.slice(5)} ${weekday}`;
}

function defaultCalendarExceptionRule(type: string) {
  if (type === '调班') return '按早班计算';
  if (type === '节假日' || type === '休息') return '强制休 R';
  return '可排班';
}

async function runScheduleAction(action: string) {
  if (action === 'sync-holiday') {
    const result = await syncProductionCalendarHolidays(selectedCalendarId.value, calendarMonth.value);
    await loadSchedule();
    calendarMonthData.value = result.month;
    actionMessage.value = result.message;
    return;
  }
  await runProductionScheduleAction(action, {
    selectedPlans: selectedPlans.value,
    selectedShifts: selectedShifts.value,
  });
  const textMap: Record<string, string> = {
    publish: `发布动作已提交${selectedPlans.value.length ? `（${selectedPlans.value.length} 条）` : ''}`,
    archive: '归档动作已提交',
    'batch-adjust': '批量调班动作已触发',
    'sync-holiday': '已同步法定节假日',
    'team-export': '生产班组导出动作已触发',
    'disable-shifts': `批量停用动作已提交${selectedShifts.value.length ? `（${selectedShifts.value.length} 条）` : ''}`,
    'shift-export': '班次导出动作已触发',
  };
  actionMessage.value = textMap[action] || `${action} 动作已触发`;
}

function teamMembers(team: ProductionScheduleTeam) {
  return schedule.value.employees.filter((employee) => employee.team === team.name);
}

function planPatternPreview(plan: ProductionSchedulePlan) {
  const pattern = plan.pattern.split('-').filter(Boolean);
  return Array.from({ length: 14 }, (_, index) => pattern[index % pattern.length] || 'R');
}

function calendarCellClass(cell: CalendarCell) {
  if (cell.blank) return 'blank';
  const type = cell.type as ProductionWorkCalendarDayType;
  if (type === '节假日') return 'holiday';
  if (type === '调班') return 'swap';
  if (type === '休息') return 'rest';
  return 'work';
}
</script>

<style scoped>
.production-schedule-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;
}

.schedule-message {
  margin: 0;
}

.schedule-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.schedule-stat {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  padding: 10px 12px;
  border: 1px solid var(--aw-border);
  background: #fff;
  color: var(--aw-fg-1);
  text-align: left;
  cursor: default;
}

.schedule-stat.warn {
  background: #fff7ed;
  cursor: pointer;
}

.schedule-stat span {
  color: var(--aw-fg-3);
  font-size: 12px;
}

.schedule-stat strong {
  color: var(--aw-fg-1);
  font-size: 18px;
  font-weight: 600;
}

.schedule-stat.warn strong {
  color: var(--aw-warning);
}

.schedule-card {
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--aw-border);
  border-radius: 8px;
  background: #fff;
}

.schedule-toolbar {
  border-width: 0 0 1px;
  border-radius: 0;
}

.aw-select.compact {
  width: auto;
  min-width: 132px;
}

.schedule-plan-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 14px;
  margin: 0 12px 12px;
  padding: 10px 12px;
  line-height: 1.5;
}

.schedule-plan-meta span {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
}

.schedule-plan-meta em {
  flex: none;
  color: var(--aw-fg-3);
  font-style: normal;
  font-size: 12px;
}

.schedule-plan-meta b {
  color: var(--aw-fg-1);
  font-weight: 600;
}

.schedule-roster-wrap {
  margin: 0 12px;
}

.schedule-roster-table {
  min-width: 1180px;
}

.schedule-person {
  display: flex;
  align-items: center;
  gap: 8px;
}

.schedule-person span {
  display: inline-flex;
  width: 26px;
  height: 26px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--aw-primary-soft);
  color: var(--aw-primary);
  font-weight: 600;
}

.schedule-shift-cell {
  height: 56px;
}

.schedule-shift-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 8px;
  border-radius: 6px;
  font-weight: 600;
  vertical-align: middle;
}

.schedule-shift-chip.compact {
  gap: 3px;
}

.schedule-shift-chip.clickable {
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(15, 23, 42, .08);
}

.schedule-counts {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin: 12px;
}

.schedule-plan-table {
  min-width: 1260px;
}

.schedule-roster-page,
.schedule-team-page {
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr);
  min-height: 560px;
}

.aw-tree-row em {
  margin-left: auto;
  color: var(--aw-fg-3);
  font-style: normal;
  font-size: 12px;
}

.schedule-team-grid,
.schedule-shift-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(220px, 1fr));
  gap: 12px;
  padding: 12px;
}

.schedule-team-card,
.schedule-shift-card {
  min-width: 0;
  border: 1px solid var(--aw-border);
  border-radius: 8px;
  background: #fff;
  padding: 14px;
}

.schedule-team-card {
  cursor: pointer;
}

.schedule-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.schedule-team-card p,
.schedule-shift-card p,
.schedule-exception-grid p,
.schedule-day p {
  margin: 8px 0 0;
  color: var(--aw-fg-3);
  font-size: 12px;
}

.schedule-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.schedule-tags span {
  padding: 2px 8px;
  border-radius: 12px;
  background: var(--aw-surface-2);
  font-size: 12px;
}

.schedule-team-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin-top: 14px;
  font-size: 12px;
}

.schedule-team-metrics b {
  display: block;
  margin-top: 2px;
  font-size: 18px;
}

.schedule-calendar-body {
  padding: 12px;
}

.schedule-calendar-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.schedule-calendar-meta span {
  margin-left: 12px;
  color: var(--aw-fg-3);
  font-size: 12px;
}

.schedule-legend {
  display: flex;
  gap: 10px;
  align-items: center;
}

.schedule-legend span {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  margin-left: 0;
}

.schedule-legend i {
  width: 12px;
  height: 12px;
  border: 1px solid var(--aw-border);
  background: #fff;
}

.schedule-legend .rest {
  background: #fdecdc;
}

.schedule-legend .holiday {
  background: #fbdfdf;
}

.schedule-legend .swap {
  background: #dce7fb;
}

.schedule-exception-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.schedule-exception-grid article {
  padding: 10px;
  border: 1px solid var(--aw-border);
  border-radius: 6px;
  background: #fff;
}

.schedule-empty-exception {
  border-style: dashed;
}

.schedule-exception-grid article > div {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.schedule-month-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  border: 1px solid var(--aw-border);
  background: #fff;
}

.schedule-week-head {
  padding: 8px;
  border-bottom: 1px solid var(--aw-border);
  background: var(--aw-surface-2);
  color: var(--aw-fg-3);
  text-align: center;
  font-size: 12px;
}

.schedule-day {
  min-height: 96px;
  padding: 8px;
  border-right: 1px solid var(--aw-border);
  border-bottom: 1px solid var(--aw-border);
}

.schedule-day.blank {
  background: var(--aw-surface-2);
}

.schedule-day > div {
  display: flex;
  justify-content: space-between;
}

.schedule-day.rest {
  background: #fdecdc;
  color: #b26a24;
}

.schedule-day.holiday {
  background: #fbdfdf;
  color: #b42318;
}

.schedule-day.swap {
  background: #dce7fb;
  color: #2e4a85;
}

.schedule-calendar-total {
  display: flex;
  gap: 18px;
  margin-top: 12px;
  color: var(--aw-fg-3);
  font-size: 12px;
}

.schedule-shift-card {
  display: grid;
  grid-template-columns: 24px 56px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;
}

.schedule-shift-icon {
  display: flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 20px;
  font-weight: 700;
}

.schedule-modal .body {
  padding: 14px 18px;
}

.schedule-modal .foot {
  display: flex;
  flex: none;
  gap: 8px;
  justify-content: flex-end;
  padding: 12px 20px;
  border-top: 1px solid var(--aw-divider);
  background: var(--aw-surface-2);
}

.schedule-form {
  display: grid;
  gap: 16px 18px;
}

.schedule-form.two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.schedule-form .aw-field > span,
.schedule-modal-body .aw-field > span,
.schedule-info-grid label > span {
  color: var(--aw-fg-2);
  font-size: 13px;
}

.schedule-form .aw-field.req > span::after {
  content: " *";
  color: var(--aw-danger);
}

.schedule-shift-picker {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.schedule-shift-picker button {
  display: flex;
  min-height: 76px;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--aw-border);
  background: #fff;
  cursor: pointer;
}

.schedule-shift-picker button.on {
  border-color: var(--aw-primary);
  background: var(--aw-primary-soft);
}

.schedule-section-title {
  margin: 14px 0 10px;
  color: var(--aw-fg-1);
  font-size: 14px;
  font-weight: 600;
}

.schedule-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.schedule-section-head .schedule-section-title {
  margin-bottom: 10px;
}

.schedule-exception-table th,
.schedule-exception-table td {
  white-space: nowrap;
}

.schedule-exception-table .aw-input,
.schedule-exception-table .aw-select {
  min-width: 120px;
}

.schedule-empty-cell {
  color: var(--aw-fg-3);
  text-align: center;
}

.schedule-pattern {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.schedule-info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px 18px;
  margin-bottom: 14px;
}

.schedule-info-grid label {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 7px;
}

.detail-preview {
  margin: 0;
}

.danger {
  color: var(--aw-danger);
}

.success {
  color: var(--aw-success);
}

.aw-status.red {
  background: #fff1f0;
  color: var(--aw-danger);
}

@media (max-width: 1180px) {
  .schedule-stats,
  .schedule-team-grid,
  .schedule-shift-grid,
  .schedule-exception-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .schedule-roster-page,
  .schedule-team-page {
    grid-template-columns: 170px minmax(0, 1fr);
  }
}
</style>
