<template>
  <aw-form-page :actions="craftActions" back-text="返回工艺列表" @back="emit('back')" @action="handleCraftAction">
    <section class="aw-form-card">
      <div class="aw-detail-section-title">工艺基础信息</div>
      <div class="cf-base-grid">
        <div class="aw-field"><label>工艺编号</label><input v-model="craftForm.code" class="aw-input" disabled /></div>
        <div class="aw-field"><label class="req">工艺名称</label><input v-model="craftForm.name" class="aw-input" /></div>
        <div class="aw-field">
          <label class="req">适用产品</label>
          <select v-model="craftForm.product" class="aw-select">
            <option value="">请选择</option>
            <option v-for="product in rdCraftProductOptions" :key="product">{{ product }}</option>
          </select>
        </div>
        <div class="aw-field"><label>版本号</label><input v-model="craftForm.version" class="aw-input" /></div>
        <div class="aw-field">
          <label>工艺分类</label>
          <select v-model="craftForm.category" class="aw-select">
            <option v-for="category in rdCraftCategoryOptions" :key="category">{{ category }}</option>
          </select>
        </div>
        <div class="aw-field"><label>编制人</label><input v-model="craftForm.author" class="aw-input" /></div>
        <div class="aw-field"><label>生效日期</label><input v-model="craftForm.effectiveDate" class="aw-input" type="date" /></div>
      </div>
    </section>

    <section class="cf-summary">
      <div class="cf-summary-card"><div class="l">工序总数</div><div class="n">{{ craftStats.totalOps }}<span class="u">道</span></div></div>
      <div class="cf-summary-card in"><div class="l">自制工序</div><div class="n">{{ craftStats.inOps }}<span class="u">道</span></div></div>
      <div class="cf-summary-card out"><div class="l">委外工序</div><div class="n">{{ craftStats.outOps }}<span class="u">道</span></div></div>
      <div class="cf-summary-card"><div class="l">工艺总时长 <span>(并序取最大)</span></div><div class="n">{{ (craftStats.totalMin / 60).toFixed(1) }}<span class="u">h</span></div></div>
      <div class="cf-summary-card"><div class="l">人工总工时</div><div class="n">{{ (craftStats.laborMin / 60).toFixed(1) }}<span class="u">h</span></div></div>
      <div class="cf-summary-card"><div class="l">单件成本</div><div class="n">¥ {{ craftStats.totalCost }}</div></div>
    </section>

    <section class="cf-route-entry">
      <button class="cf-add-route-btn" type="button" @click="showRouteModal = true">+ 添加工序</button>
      <div v-if="craftStages.length" class="cf-route-brief">
        <span>已添加 {{ craftStats.totalOps }} 道工序</span>
        <span>自制 {{ craftStats.inOps }} 道</span>
        <span>委外 {{ craftStats.outOps }} 道</span>
        <span>预计工艺时长 {{ (craftStats.totalMin / 60).toFixed(1) }} h</span>
        <button class="cf-route-edit-btn" type="button" @click="showRouteModal = true">编辑工序</button>
      </div>
      <div v-else class="cf-route-empty">当前未添加工序，点击“添加工序”进行配置。</div>
    </section>

    <section class="aw-form-card">
      <div class="aw-detail-section-title">工艺详情</div>
      <aw-rich-text-editor v-model="craftDetail" placeholder="请输入工艺说明、执行要求和质量控制说明" />
    </section>

    <div v-if="submitMessage" class="aw-form-note">{{ submitMessage }}</div>
  </aw-form-page>

  <div v-if="showRouteModal" class="aw-mask cf-route-modal-mask">
    <div class="aw-modal cf-route-modal">
      <div class="head cf-route-modal-head">
        <div>
          <strong>添加工序</strong>
          <span>从左侧选择工序模板，拖入画布后配置参数。</span>
        </div>
        <button class="aw-modal-close" type="button" @click="showRouteModal = false">×</button>
      </div>
      <div class="body cf-route-modal-body">
        <div class="cf-editor cf-editor-in-modal">
          <aside class="cf-palette">
            <div class="cf-palette-h">工序模板 <span class="tag">拖拽到画布</span></div>
            <div class="cf-palette-search">
              <div class="box">
                <span>⌕</span>
                <input v-model="paletteKeyword" placeholder="搜索工序" />
              </div>
            </div>
            <div class="cf-palette-tabs">
              <span :class="{ on: paletteTab === 'in' }" @click="paletteTab = 'in'">自制 ({{ inTemplateCount }})</span>
              <span :class="{ on: paletteTab === 'out' }" @click="paletteTab = 'out'">委外 ({{ outTemplateCount }})</span>
            </div>
            <div class="cf-palette-list">
              <div v-for="group in groupedTemplates" :key="group.name" class="cf-pgroup">
                <div class="cf-pgroup-h">{{ group.name }} <span class="n">{{ group.list.length }}</span></div>
                <div
                  v-for="template in group.list"
                  :key="template.key"
                  class="cf-pcard"
                  draggable="true"
                  @pointerdown="startPalettePointerDrag(template, $event)"
                  @dragstart="onPaletteDragStart(template, $event)"
                  @dragend="cleanupPalettePointerDrag"
                >
                  <div :class="['ic', template.type === 'in' ? 'in' : 'out']">{{ template.icon }}</div>
                  <div class="cf-pcard-main">
                    <div class="nm">{{ template.name }}</div>
                    <div class="sub">{{ template.category }} · {{ template.setupTime + template.runTime }} 分钟</div>
                  </div>
                </div>
              </div>
              <div v-if="!groupedTemplates.length" class="cf-empty-text">没有匹配的工序模板</div>
            </div>
          </aside>

          <main ref="routeCanvasRef" class="cf-canvas">
            <div class="cf-cv-bar">
              <span class="legend">
                <span class="lg"><span class="sw in" /> 自制</span>
                <span class="lg"><span class="sw out" /> 委外</span>
                <span class="lg"><span class="sw seq" /> 串序</span>
                <span class="lg"><span class="sw par" /> 并序</span>
              </span>
              <div class="zoom" aria-label="工艺路线缩放">
                <button type="button" :disabled="routeZoom <= routeZoomMin" @click="changeRouteZoom(-routeZoomStep)">−</button>
                <span class="zoom-value">{{ routeZoomPercent }}%</span>
                <button type="button" :disabled="routeZoom >= routeZoomMax" @click="changeRouteZoom(routeZoomStep)">+</button>
                <button class="fit" type="button" @click="fitRouteCanvas">⊞ 适配</button>
              </div>
            </div>

            <div class="cf-flow-shell" :style="routeFlowShellStyle">
              <div ref="routeFlowRef" class="cf-flow" :style="routeFlowStyle">
              <div v-if="craftStages.length" class="cf-conn start">
                <span class="start-dot" />
                <span class="start-badge">开始</span>
                <div class="hline" />
              </div>

              <template v-for="(stage, index) in craftStages" :key="stage.id">
                <div v-if="stage.kind === 'seq'" class="cf-stage cf-stage-seq">
                  <div class="cf-stage-box">
                    <span class="cf-stage-no">{{ index + 1 }}</span>
                    <div
                      v-if="stage.ops[0]"
                      :class="opClass(stage.ops[0])"
                      draggable="true"
                      @click="selectOp(stage.ops[0].id)"
                      @dragstart="onOpDragStart(stage.ops[0], $event)"
                    >
                      <div class="cf-op-h">
                        <span class="grip">⋮⋮</span>
                        <span class="num">{{ stage.ops[0].code }}</span>
                        <span class="nm">{{ stage.ops[0].name }}</span>
                        <span class="x" title="移除工序" @click.stop="removeOp(stage.ops[0].id)">×</span>
                      </div>
                      <op-card-body :op="stage.ops[0]" />
                    </div>
                    <div class="cf-op-actions">
                      <span class="cf-op-action" title="转为并序组" @click="convertToParAndAdd(stage.id)">+ 添加并序工序</span>
                      <span class="cf-op-action" @click="moveStage(stage.id, -1)">←</span>
                      <span class="cf-op-action" @click="moveStage(stage.id, 1)">→</span>
                    </div>
                  </div>
                </div>

                <div
                  v-else
                  :class="['cf-stage', 'cf-stage-par', { 'drop-over': isDragOver(stage.id, 'inPar') }]"
                  @dragover.prevent="setDragOver(stage.id, 'inPar')"
                  @dragleave="clearDragOver"
                  @drop="dropOnStage(stage.id, 'inPar', $event)"
                >
                  <span class="cf-par-gateway in"><span>⫲</span></span>
                  <span class="cf-par-gateway out"><span>⫳</span></span>
                  <span class="cf-stage-no par">{{ index + 1 }}</span>
                  <span class="cf-stage-par-label">⫲ 并序 · 同时执行</span>
                  <div v-for="op in stage.ops" :key="op.id" class="cf-par-op-row">
                    <div :class="opClass(op)" draggable="true" @click="selectOp(op.id)" @dragstart="onOpDragStart(op, $event)">
                      <div class="cf-op-h">
                        <span class="grip">⋮⋮</span>
                        <span class="num">{{ op.code }}</span>
                        <span class="nm">{{ op.name }}</span>
                        <span class="x" title="移除工序" @click.stop="removeOp(op.id)">×</span>
                      </div>
                      <op-card-body :op="op" />
                    </div>
                  </div>
                  <div class="par-add" @click="convertToParAndAdd(stage.id)">+ 添加并序工序（或拖入）</div>
                  <div class="cf-op-actions">
                    <span class="cf-op-action par" @click="splitParallelStage(stage.id)">↩ 转回串序</span>
                    <span class="cf-op-action" @click="moveStage(stage.id, -1)">←</span>
                    <span class="cf-op-action" @click="moveStage(stage.id, 1)">→</span>
                  </div>
                </div>

                <div
                  :class="['cf-conn', { end: index === craftStages.length - 1, 'drop-over': isDragOver(stage.id, 'after') }]"
                  @dragenter.prevent="setDragOver(stage.id, 'after')"
                  @dragover.prevent="setDragOver(stage.id, 'after')"
                  @dragleave="clearDragOver"
                  @drop="dropOnStage(stage.id, 'after', $event)"
                >
                  <div class="hline" />
                  <div class="arrow" title="在此处插入工序">+</div>
                </div>
              </template>

              <div
                :class="['cf-add-stage', { 'end-only': craftStages.length, 'drag-over': dragOver === 'end' }]"
                @dragenter.prevent="dragOver = 'end'"
                @dragover.prevent="dragOver = 'end'"
                @dragleave="clearDragOver"
                @drop="dropAtEnd"
              >
                <div v-if="!craftStages.length" class="pl">+</div>
                <span>拖入新工序</span>
              </div>
              </div>
            </div>
          </main>

          <aside v-if="selectedCraftOp && selectedCraftStage" class="cf-props">
            <div class="cf-props-h">
              <span :class="['typ', selectedCraftOp.type === 'in' ? 'in' : 'out']">{{ selectedCraftOp.type === 'in' ? '自制' : '委外' }}</span>
              <span class="cf-props-title">{{ selectedCraftOp.name }}</span>
              <span class="cf-props-code">{{ selectedCraftOp.code }}</span>
              <button class="cf-props-close" type="button" title="关闭面板" @click="selectedOpId = ''">×</button>
            </div>
            <div class="cf-props-tabs">
              <span v-for="tab in craftPropTabs" :key="tab.key" :class="{ on: activePropTab === tab.key }" @click="activePropTab = tab.key">{{ tab.label }}</span>
            </div>
            <div class="cf-props-b">
              <template v-if="activePropTab === 'basic'">
                <div class="cf-prop-sec">
                  <div class="cf-prop-sec-h">工序信息</div>
                  <div class="cf-prop-row"><label class="req">工序编号</label><input :value="selectedCraftOp.code" disabled /></div>
                  <div class="cf-prop-row"><label class="req">工序名称</label><input :value="selectedCraftOp.name" disabled /></div>
                  <div class="cf-prop-row"><label>工序分类</label><input :value="selectedCraftOp.category" disabled /></div>
                  <div class="cf-prop-row">
                    <label>工序类型</label>
                    <div :class="['cf-seg', selectedCraftOp.type === 'out' ? 'tone-out' : '']">
                      <span :class="{ on: selectedCraftOp.type === 'in' }" @click="setSelectedOpType('in')">自制工序</span>
                      <span :class="{ on: selectedCraftOp.type === 'out' }" @click="setSelectedOpType('out')">委外工序</span>
                    </div>
                  </div>
                </div>
                <div class="cf-prop-sec">
                  <div class="cf-prop-sec-h">工艺节点 <span class="n">本节点</span></div>
                  <div class="cf-prop-row">
                    <label>串 / 并</label>
                    <div :class="['cf-seg', selectedCraftStage.kind === 'par' ? 'tone-par' : '']">
                      <span :class="{ on: selectedCraftStage.kind === 'seq' }" @click="setSelectedStageKind('seq')">串序（独立步骤）</span>
                      <span :class="{ on: selectedCraftStage.kind === 'par' }" @click="setSelectedStageKind('par')">并序（同时执行）</span>
                    </div>
                  </div>
                  <div class="cf-prop-row">
                    <label>节点说明</label>
                    <textarea v-model="selectedStageRemark" placeholder="可填写本节点的总体目标、约束等" />
                  </div>
                </div>
              </template>

              <template v-else-if="activePropTab === 'station'">
                <div class="cf-prop-sec">
                  <div class="cf-prop-sec-h">{{ selectedCraftOp.type === 'in' ? '工作中心 / 设备' : '委外信息' }}</div>
                  <template v-if="selectedCraftOp.type === 'in'">
                    <div class="cf-prop-row"><label class="req">工作中心</label><input :value="selectedCraftOp.workCenter || '未配置'" disabled /></div>
                    <div class="cf-prop-row"><label>设备</label><input :value="selectedCraftOp.equipment || '未配置'" disabled /></div>
                    <div class="cf-prop-row">
                      <label>需用工人</label>
                      <div class="cf-input-suffix"><input v-model.number="selectedCraftOp.laborCount" type="number" /><span class="sfx">人</span></div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="cf-prop-row">
                      <label class="req">委外厂商</label>
                      <select v-model="selectedCraftOp.supplier">
                        <option v-for="supplier in rdCraftSupplierOptions" :key="supplier">{{ supplier }}</option>
                      </select>
                    </div>
                    <div class="cf-prop-row"><label>外协协议</label><input v-model="selectedCraftOp.agreement" placeholder="协议编号 / 报价单号" /></div>
                    <div class="cf-prop-row">
                      <label>外协单价</label>
                      <div class="cf-input-suffix"><input v-model.number="selectedCraftOp.costRate" type="number" /><span class="sfx">元/件</span></div>
                    </div>
                  </template>
                </div>
              </template>

              <template v-else-if="activePropTab === 'time'">
                <div class="cf-prop-sec">
                  <div class="cf-prop-sec-h">工时参数</div>
                  <div class="cf-prop-row"><label>准备工时</label><div class="cf-input-suffix"><input v-model.number="selectedCraftOp.setupTime" type="number" /><span class="sfx">min</span></div></div>
                  <div class="cf-prop-row"><label>单件工时</label><div class="cf-input-suffix"><input v-model.number="selectedCraftOp.runTime" type="number" /><span class="sfx">min</span></div></div>
                  <div class="cf-prop-row"><label>排队等待</label><div class="cf-input-suffix"><input v-model.number="selectedCraftOp.queueTime" type="number" /><span class="sfx">min</span></div></div>
                  <div class="cf-prop-row"><label>合计</label><div class="cf-input-suffix"><input :value="opFullTime(selectedCraftOp)" disabled /><span class="sfx">min</span></div></div>
                  <div class="cf-prop-row"><label>{{ selectedCraftOp.type === 'in' ? '工价' : '外协单价' }}</label><div class="cf-input-suffix"><input v-model.number="selectedCraftOp.costRate" type="number" /><span class="sfx">{{ selectedCraftOp.type === 'in' ? '元/min' : '元/件' }}</span></div></div>
                </div>
              </template>

              <template v-else-if="activePropTab === 'output'">
                <div class="cf-prop-sec">
                  <div class="cf-prop-sec-h">副产品 / 废料</div>
                  <table class="aw-table cf-mini-table">
                    <thead><tr><th>名称</th><th>数量</th><th>单位</th><th>操作</th></tr></thead>
                    <tbody>
                      <tr v-for="row in selectedOutputRows" :key="row.id">
                        <td><input v-model="row.name" /></td>
                        <td><input v-model="row.qty" /></td>
                        <td><input v-model="row.unit" /></td>
                        <td><span class="aw-link danger" @click="removeOutputRow(row.id)">删除</span></td>
                      </tr>
                      <tr v-if="!selectedOutputRows.length"><td colspan="4" class="cf-empty-cell">暂无副产品</td></tr>
                      <tr><td colspan="4" class="cf-add-cell"><span class="aw-link" @click="addOutputRow">+ 添加副产品</span></td></tr>
                    </tbody>
                  </table>
                </div>
              </template>

              <template v-else-if="activePropTab === 'params'">
                <div class="cf-prop-sec">
                  <div class="cf-prop-sec-h">技术参数</div>
                  <div class="cf-prop-row"><label>SOP 编号</label><input v-model="selectedCraftOp.sopCode" /></div>
                  <table class="aw-table cf-mini-table">
                    <thead><tr><th>参数名称</th><th>参数内容</th><th>操作</th></tr></thead>
                    <tbody>
                      <tr v-for="row in selectedTechParams" :key="row.id">
                        <td>{{ row.name }}</td>
                        <td>{{ row.value }}</td>
                        <td><span class="aw-link danger" @click="removeTechParam(row.id)">删除</span></td>
                      </tr>
                      <tr v-if="!selectedTechParams.length"><td colspan="3" class="cf-empty-cell">暂无技术参数</td></tr>
                    </tbody>
                  </table>
                  <button class="aw-tool-btn cf-add-param" type="button" @click="showParamModal = true">+ 添加参数</button>
                </div>
              </template>

              <template v-else-if="activePropTab === 'qc'">
                <div class="cf-prop-sec">
                  <div class="cf-prop-sec-h">质检方案</div>
                  <div class="cf-prop-row">
                    <label>质检方案配置</label>
                    <div class="cf-seg">
                      <span :class="{ on: selectedCraftOp.qcRequired }" @click="selectedCraftOp.qcRequired = true">开启</span>
                      <span :class="{ on: !selectedCraftOp.qcRequired }" @click="selectedCraftOp.qcRequired = false">关闭</span>
                    </div>
                  </div>
                  <template v-if="selectedCraftOp.qcRequired">
                    <div class="cf-prop-row">
                      <label>检验方案</label>
                      <select v-model="selectedCraftOp.qcPlan">
                        <option value="">请选择检验方案</option>
                        <option v-for="plan in rdCraftQcPlanOptions" :key="plan">{{ plan }}</option>
                      </select>
                    </div>
                    <div class="cf-prop-row">
                      <label>不良处理</label>
                      <select v-model="badHandle">
                        <option>返修</option>
                        <option>报废</option>
                        <option>让步接收</option>
                      </select>
                    </div>
                  </template>
                </div>
              </template>

              <template v-else>
                <div class="cf-prop-sec">
                  <div class="cf-prop-sec-h">工序说明</div>
                  <div class="cf-prop-row"><label>关联文档</label><input v-model="selectedCraftOp.sopCode" placeholder="选择工艺规范 / 作业指导书" /></div>
                  <div class="cf-prop-row"><label>说明</label><textarea v-model="selectedCraftOp.remark" placeholder="填写当前工艺下该工序的执行说明、特殊要求和附件备注" /></div>
                </div>
              </template>
            </div>
            <div class="cf-props-foot">
              <span class="aw-link danger" @click="removeSelectedOp">移除此工序</span>
              <button class="aw-btn primary" type="button">应用</button>
            </div>
          </aside>
        </div>
        <div v-if="pointerDrag?.active" class="cf-drag-ghost" :style="pointerGhostStyle">
          <span :class="['ic', pointerDrag.template.type === 'in' ? 'in' : 'out']">{{ pointerDrag.template.icon }}</span>
          <span>{{ pointerDrag.template.name }}</span>
        </div>
      </div>
      <div class="foot cf-route-modal-foot">
        <button class="aw-tool-btn" type="button" @click="showRouteModal = false">取消</button>
        <button class="aw-btn primary" type="button" @click="showRouteModal = false">确认</button>
      </div>
    </div>
  </div>

  <div v-if="showParamModal" class="aw-mask cf-param-mask" @click="showParamModal = false">
    <div class="aw-modal cf-param-modal" @click.stop>
      <div class="head">
        <span class="aw-modal-title">新增技术参数</span>
        <button class="aw-modal-close" type="button" @click="showParamModal = false">×</button>
      </div>
      <div class="body cf-param-body">
        <div class="aw-field"><label class="req">参数名称</label><input v-model="paramDraft.name" class="aw-input" placeholder="如 温度范围 / 扭矩 / 压力" /></div>
        <div class="aw-field"><label class="req">参数内容</label><textarea v-model="paramDraft.value" class="aw-input rd-textarea" placeholder="请输入参数值、标准或控制要求" /></div>
      </div>
      <div class="foot">
        <button class="aw-tool-btn" type="button" @click="showParamModal = false">取消</button>
        <button class="aw-btn primary" type="button" @click="confirmTechParam">确认</button>
      </div>
    </div>
  </div>

  <div v-if="showPreviewModal" class="aw-mask">
    <div class="aw-modal lg">
      <div class="head">
        <div><span class="aw-modal-title">工艺路线预览</span><span class="aw-modal-sub">{{ craftForm.name }}</span></div>
        <button class="aw-modal-close" type="button" @click="showPreviewModal = false">×</button>
      </div>
      <div class="body">
        <div class="cf-preview-grid">
          <div>工艺编号：{{ craftForm.code }}</div>
          <div>适用产品：{{ craftForm.product || '未选择' }}</div>
          <div>工序总数：{{ craftStats.totalOps }}</div>
          <div>工艺总时长：{{ (craftStats.totalMin / 60).toFixed(1) }}h</div>
        </div>
        <table class="aw-table cf-preview-table">
          <thead><tr><th>序号</th><th>工序编号</th><th>工序名称</th><th>工序类型</th><th>节点</th><th>工时</th><th>质检方案</th></tr></thead>
          <tbody>
            <tr v-for="row in flatRouteRows" :key="row.id">
              <td>{{ row.no }}</td>
              <td>{{ row.code }}</td>
              <td>{{ row.name }}</td>
              <td>{{ row.type }}</td>
              <td>{{ row.kind }}</td>
              <td>{{ row.time }}</td>
              <td>{{ row.qcPlan }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="foot">
        <button class="aw-tool-btn" type="button" @click="showPreviewModal = false">关闭</button>
        <button class="aw-btn primary" type="button" @click="handleCraftAction('submit')">提交审批</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, nextTick, onBeforeUnmount, reactive, ref, watch, type PropType } from 'vue';
import AwFormPage from '@/components/form-page/AwFormPage.vue';
import AwRichTextEditor from '@/components/form-page/AwRichTextEditor.vue';
import type { FormAction } from '@/components/form-page/types';
import {
  createRdCraftOperationFromTemplate,
  createRdResource,
  rdCraftCategoryOptions,
  rdCraftDetailText,
  rdCraftPaletteGroupsIn,
  rdCraftPaletteGroupsOut,
  rdCraftProductOptions,
  rdCraftQcPlanOptions,
  rdCraftSupplierOptions,
  rdCraftTemplates,
  type RdCraftOperation,
  type RdCraftOutputRow,
  type RdCraftStage,
  type RdCraftTechParam,
  type RdCraftTemplate,
} from '@/app/api/rd/resources';

type DragState =
  | { kind: 'palette'; template: RdCraftTemplate }
  | { kind: 'op'; op: RdCraftOperation }
  | null;
type DragOver = 'end' | { stageId: string; dropAs: 'after' | 'inPar' } | null;
type PalettePointerDrag = {
  template: RdCraftTemplate;
  startX: number;
  startY: number;
  x: number;
  y: number;
  active: boolean;
  native: boolean;
} | null;

const OpCardBody = defineComponent({
  props: { op: { type: Object as PropType<RdCraftOperation>, required: true } },
  setup(props) {
    return () => {
      const op = props.op;
      const isIn = op.type === 'in';
      const totalTime = op.setupTime + op.runTime;
      return [
        h('div', { class: 'cf-op-tags' }, [
          h('span', { class: ['cf-op-tag', isIn ? 'in-tag' : 'out-tag'] }, isIn ? '自制' : '委外'),
          h('span', { class: 'cf-op-tag' }, op.category),
          op.qcRequired ? h('span', { class: 'cf-op-tag qc-tag' }, '需检验') : null,
        ]),
        h('div', { class: 'cf-op-b' }, [
          h('div', { class: 'cf-op-b-row' }, [h('span', { class: 'k' }, isIn ? '工作中心' : '委外厂商'), h('span', { class: 'v' }, isIn ? op.workCenter || '-' : op.supplier || '-')]),
          h('div', { class: 'cf-op-b-row' }, [h('span', { class: 'k' }, isIn ? '设备' : '工艺时长'), h('span', { class: 'v' }, isIn ? op.equipment || '-' : totalTime >= 60 ? `${(totalTime / 60).toFixed(1)} h` : `${totalTime} min`)]),
          h('div', { class: 'cf-op-b-row' }, [h('span', { class: 'k' }, '单件工时'), h('span', { class: 'v' }, `${totalTime} min`)]),
        ]),
        h('div', { class: 'cf-op-f' }, [
          h('span', { class: 'av' }, isIn ? '内' : '委'),
          h('span', isIn ? `${op.laborCount} 人` : '外部加工'),
          h('span', { class: 'ml' }, `¥ ${(totalTime * op.costRate).toFixed(0)}/件`),
        ]),
      ];
    };
  },
});

const emit = defineEmits<{ back: [] }>();

const craftActions: FormAction[] = [
  { key: 'cancel', label: '取消' },
  { key: 'draft', label: '暂存草稿' },
  { key: 'preview', label: '预览路由' },
  { key: 'submit', label: '提交审批', primary: true },
];
const craftPropTabs = [
  { key: 'basic', label: '基础信息' },
  { key: 'station', label: '工位' },
  { key: 'time', label: '工时' },
  { key: 'output', label: '副产品' },
  { key: 'params', label: '技术参数' },
  { key: 'qc', label: '质检方案' },
  { key: 'note', label: '工序说明' },
];

const craftForm = reactive({
  code: 'GY-2026-018',
  name: '智能控制器整机制造工艺',
  product: '',
  version: 'V 1.0',
  category: '电子装配',
  author: '李文涛 / 工艺组',
  effectiveDate: '2026-06-01',
});
const craftStages = ref<RdCraftStage[]>([]);
const craftDetail = ref(rdCraftDetailText);
const paletteTab = ref<'in' | 'out'>('in');
const paletteKeyword = ref('');
const selectedOpId = ref('');
const activePropTab = ref('basic');
const dragState = ref<DragState>(null);
const dragOver = ref<DragOver>(null);
const pointerDrag = ref<PalettePointerDrag>(null);
const showRouteModal = ref(false);
const showPreviewModal = ref(false);
const showParamModal = ref(false);
const submitMessage = ref('');
const selectedStageRemark = ref('');
const badHandle = ref('返修');
const paramDraft = reactive({ name: '', value: '' });
const routeCanvasRef = ref<HTMLElement | null>(null);
const routeFlowRef = ref<HTMLElement | null>(null);
const routeZoomMin = 0.25;
const routeZoomMax = 1.5;
const routeZoomStep = 0.1;
const routeZoom = ref(1);
const routeFlowNaturalSize = reactive({ width: 2400, height: 320 });

const inTemplateCount = computed(() => rdCraftTemplates.filter((template) => template.type === 'in').length);
const outTemplateCount = computed(() => rdCraftTemplates.filter((template) => template.type === 'out').length);
const routeZoomPercent = computed(() => Math.round(routeZoom.value * 100));
const routeFlowStyle = computed(() => ({
  transform: `scale(${routeZoom.value})`,
  transformOrigin: 'left top',
}));
const pointerGhostStyle = computed(() => {
  if (!pointerDrag.value?.active) return {};
  return {
    left: `${pointerDrag.value.x + 12}px`,
    top: `${pointerDrag.value.y + 12}px`,
  };
});
const routeFlowShellStyle = computed(() => {
  if (!routeFlowNaturalSize.width || !routeFlowNaturalSize.height) return {};
  return {
    width: `${Math.ceil(routeFlowNaturalSize.width * routeZoom.value)}px`,
    height: `${Math.ceil(routeFlowNaturalSize.height * routeZoom.value)}px`,
  };
});
const groupedTemplates = computed(() => {
  const groups = paletteTab.value === 'in' ? rdCraftPaletteGroupsIn : rdCraftPaletteGroupsOut;
  const keyword = paletteKeyword.value.trim();
  return groups.map((name) => ({
    name,
    list: rdCraftTemplates.filter((template) => {
      if (template.type !== paletteTab.value) return false;
      if (template.category !== name) return false;
      return !keyword || template.name.includes(keyword) || template.category.includes(keyword);
    }),
  })).filter((group) => group.list.length);
});
const selectedCraftOp = computed(() => {
  for (const stage of craftStages.value) {
    const found = stage.ops.find((op) => op.id === selectedOpId.value);
    if (found) return found;
  }
  return null;
});
const selectedCraftStage = computed(() => {
  if (!selectedCraftOp.value) return null;
  return craftStages.value.find((stage) => stage.ops.some((op) => op.id === selectedCraftOp.value?.id)) || null;
});
const selectedOutputRows = computed<RdCraftOutputRow[]>(() => selectedCraftOp.value?.outputRows || []);
const selectedTechParams = computed<RdCraftTechParam[]>(() => selectedCraftOp.value?.techParams || []);
const craftStats = computed(() => {
  let inOps = 0;
  let outOps = 0;
  let totalMin = 0;
  let totalCost = 0;
  let laborMin = 0;
  let parStages = 0;
  craftStages.value.forEach((stage) => {
    if (stage.kind === 'par') parStages += 1;
    const stageTimes = stage.ops.map((op) => opTotalTime(op));
    totalMin += stageTimes.length ? Math.max(...stageTimes) : 0;
    stage.ops.forEach((op) => {
      if (op.type === 'in') inOps += 1;
      else outOps += 1;
      totalCost += opTotalTime(op) * Number(op.costRate || 0);
      laborMin += opTotalTime(op) * Number(op.laborCount || 0);
    });
  });
  return { inOps, outOps, totalOps: inOps + outOps, totalMin, totalCost: totalCost.toFixed(0), laborMin, parStages };
});
const flatRouteRows = computed(() => craftStages.value.flatMap((stage, stageIndex) => stage.ops.map((op, opIndex) => ({
  id: `${stage.id}-${op.id}`,
  no: `${stageIndex + 1}${stage.ops.length > 1 ? `.${opIndex + 1}` : ''}`,
  code: op.code,
  name: op.name,
  type: op.type === 'in' ? '自制' : '委外',
  kind: stage.kind === 'par' ? '并序' : '串序',
  time: `${opTotalTime(op)} min`,
  qcPlan: op.qcRequired ? op.qcPlan : '不启用',
}))));

watch(selectedCraftOp, () => {
  activePropTab.value = 'basic';
  selectedStageRemark.value = selectedCraftStage.value?.kind === 'par' ? '该节点为并行执行组，多个工序同时进行，时长取最大值。' : '';
});

watch(showRouteModal, (visible) => {
  if (visible) void updateRouteFlowSize();
});

watch(craftStages, () => {
  if (showRouteModal.value) void updateRouteFlowSize();
}, { deep: true });

onBeforeUnmount(() => {
  cleanupPalettePointerDrag();
});

function opTotalTime(op: RdCraftOperation) {
  return Number(op.setupTime || 0) + Number(op.runTime || 0);
}

function opFullTime(op: RdCraftOperation) {
  return opTotalTime(op) + Number(op.queueTime || 0);
}

function normalizeRouteZoom(value: number) {
  return Math.min(routeZoomMax, Math.max(routeZoomMin, Number(value.toFixed(2))));
}

async function updateRouteFlowSize() {
  await nextTick();
  const flow = routeFlowRef.value;
  if (!flow) return;
  routeFlowNaturalSize.width = Math.ceil(flow.offsetWidth);
  routeFlowNaturalSize.height = Math.ceil(flow.offsetHeight);
}

function changeRouteZoom(delta: number) {
  routeZoom.value = normalizeRouteZoom(routeZoom.value + delta);
  void updateRouteFlowSize();
}

async function fitRouteCanvas() {
  await updateRouteFlowSize();
  const canvas = routeCanvasRef.value;
  if (!canvas || !routeFlowNaturalSize.width || !routeFlowNaturalSize.height) return;
  const bar = canvas.querySelector('.cf-cv-bar') as HTMLElement | null;
  const availableWidth = Math.max(260, canvas.clientWidth - 56);
  const availableHeight = Math.max(220, canvas.clientHeight - (bar?.offsetHeight || 0) - 86);
  const fitZoom = Math.min(1, availableWidth / routeFlowNaturalSize.width, availableHeight / routeFlowNaturalSize.height);
  routeZoom.value = normalizeRouteZoom(fitZoom);
  await nextTick();
  canvas.scrollLeft = 0;
  canvas.scrollTop = 0;
}

function opClass(op: RdCraftOperation) {
  return ['cf-op', op.type === 'in' ? 'in' : 'out', { selected: selectedOpId.value === op.id }];
}

function appendTemplateToEnd(template: RdCraftTemplate) {
  const op = createRdCraftOperationFromTemplate(template);
  craftStages.value = [...craftStages.value, { id: `st-${Date.now()}-${op.id}`, kind: 'seq', ops: [op] }];
  selectedOpId.value = op.id;
  void updateRouteFlowSize();
}

function startPalettePointerDrag(template: RdCraftTemplate, event: PointerEvent) {
  if (event.button !== 0) return;
  pointerDrag.value = {
    template,
    startX: event.clientX,
    startY: event.clientY,
    x: event.clientX,
    y: event.clientY,
    active: false,
    native: false,
  };
  window.addEventListener('pointermove', handlePalettePointerMove);
  window.addEventListener('pointerup', handlePalettePointerUp, { once: true });
}

function handlePalettePointerMove(event: PointerEvent) {
  const current = pointerDrag.value;
  if (!current) return;
  current.x = event.clientX;
  current.y = event.clientY;
  if (!current.active && Math.hypot(event.clientX - current.startX, event.clientY - current.startY) > 6) {
    current.active = true;
  }
}

function handlePalettePointerUp(event: PointerEvent) {
  const current = pointerDrag.value;
  cleanupPalettePointerDrag();
  if (!current?.active || current.native) return;
  const target = document.elementFromPoint(event.clientX, event.clientY);
  if (target?.closest('.cf-canvas')) {
    appendTemplateToEnd(current.template);
  }
}

function cleanupPalettePointerDrag() {
  window.removeEventListener('pointermove', handlePalettePointerMove);
  window.removeEventListener('pointerup', handlePalettePointerUp);
  pointerDrag.value = null;
}

function selectOp(id: string) {
  selectedOpId.value = id;
}

function removeOp(opId: string) {
  craftStages.value = craftStages.value
    .map((stage) => ({ ...stage, ops: stage.ops.filter((op) => op.id !== opId) }))
    .filter((stage) => stage.ops.length);
  if (selectedOpId.value === opId) selectedOpId.value = '';
}

function removeSelectedOp() {
  if (selectedCraftOp.value) removeOp(selectedCraftOp.value.id);
}

function convertToParAndAdd(stageId: string) {
  const template = rdCraftTemplates.find((item) => item.key === 'ipqc') || rdCraftTemplates[0];
  const op = createRdCraftOperationFromTemplate(template);
  craftStages.value = craftStages.value.map((stage) => stage.id === stageId ? { ...stage, kind: 'par', ops: [...stage.ops, op] } : stage);
  selectedOpId.value = op.id;
}

function splitParallelStage(stageId: string) {
  const index = craftStages.value.findIndex((stage) => stage.id === stageId);
  if (index < 0) return;
  const stage = craftStages.value[index];
  const split = stage.ops.map((op) => ({ id: `st-${Date.now()}-${op.id}`, kind: 'seq' as const, ops: [op] }));
  const next = [...craftStages.value];
  next.splice(index, 1, ...split);
  craftStages.value = next;
}

function moveStage(stageId: string, offset: number) {
  const index = craftStages.value.findIndex((stage) => stage.id === stageId);
  const target = index + offset;
  if (index < 0 || target < 0 || target >= craftStages.value.length) return;
  const next = [...craftStages.value];
  const [stage] = next.splice(index, 1);
  next.splice(target, 0, stage);
  craftStages.value = next;
}

function setSelectedOpType(type: 'in' | 'out') {
  const op = selectedCraftOp.value;
  if (!op || op.type === type) return;
  op.type = type;
  if (type === 'out') {
    op.supplier = op.supplier || rdCraftSupplierOptions[0];
    op.agreement = op.agreement || 'XY-2026-007';
    op.workCenter = '';
    op.equipment = '';
    op.laborCount = 0;
    op.costRate = op.costRate || 8.5;
  } else {
    op.workCenter = op.workCenter || '一车间';
    op.equipment = op.equipment || 'CNC-01';
    op.laborCount = op.laborCount || 1;
    op.costRate = op.costRate || 1.2;
  }
}

function setSelectedStageKind(kind: 'seq' | 'par') {
  const stage = selectedCraftStage.value;
  if (!stage) return;
  if (kind === 'seq' && stage.ops.length > 1 && selectedCraftOp.value) {
    splitParallelStage(stage.id);
    return;
  }
  stage.kind = kind;
}

function addOutputRow() {
  if (!selectedCraftOp.value) return;
  selectedCraftOp.value.outputRows = [...(selectedCraftOp.value.outputRows || []), { id: `out-${Date.now()}`, name: '副产品', qty: '0', unit: 'kg' }];
}

function removeOutputRow(id: string) {
  if (!selectedCraftOp.value) return;
  selectedCraftOp.value.outputRows = (selectedCraftOp.value.outputRows || []).filter((row) => row.id !== id);
}

function removeTechParam(id: string) {
  if (!selectedCraftOp.value) return;
  selectedCraftOp.value.techParams = (selectedCraftOp.value.techParams || []).filter((row) => row.id !== id);
}

function confirmTechParam() {
  if (!selectedCraftOp.value || !paramDraft.name.trim() || !paramDraft.value.trim()) return;
  selectedCraftOp.value.techParams = [
    ...(selectedCraftOp.value.techParams || []),
    { id: `tp-${Date.now()}`, name: paramDraft.name.trim(), value: paramDraft.value.trim() },
  ];
  paramDraft.name = '';
  paramDraft.value = '';
  showParamModal.value = false;
}

function onPaletteDragStart(template: RdCraftTemplate, event: DragEvent) {
  dragState.value = { kind: 'palette', template };
  if (pointerDrag.value?.template.key === template.key) pointerDrag.value.native = true;
  event.dataTransfer?.setData('text/plain', template.key);
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copy';
}

function onOpDragStart(op: RdCraftOperation, event: DragEvent) {
  dragState.value = { kind: 'op', op };
  event.dataTransfer?.setData('text/plain', op.id);
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
}

function setDragOver(stageId: string, dropAs: 'after' | 'inPar') {
  dragOver.value = { stageId, dropAs };
}

function clearDragOver() {
  dragOver.value = null;
}

function isDragOver(stageId: string, dropAs: 'after' | 'inPar') {
  return typeof dragOver.value === 'object' && dragOver.value?.stageId === stageId && dragOver.value.dropAs === dropAs;
}

function dropOnStage(stageId: string, dropAs: 'after' | 'inPar', event: DragEvent) {
  event.preventDefault();
  const dragged = takeDraggedOperation();
  if (!dragged) return;
  if (dropAs === 'inPar') {
    craftStages.value = craftStages.value.map((stage) => stage.id === stageId ? { ...stage, kind: 'par', ops: [...stage.ops, dragged] } : stage);
  } else {
    const index = craftStages.value.findIndex((stage) => stage.id === stageId);
    const next = [...craftStages.value];
    next.splice(index + 1, 0, { id: `st-${Date.now()}-${dragged.id}`, kind: 'seq', ops: [dragged] });
    craftStages.value = next;
  }
  selectedOpId.value = dragged.id;
  clearDragState();
}

function dropAtEnd(event: DragEvent) {
  event.preventDefault();
  const dragged = takeDraggedOperation();
  if (!dragged) return;
  craftStages.value = [...craftStages.value, { id: `st-${Date.now()}-${dragged.id}`, kind: 'seq', ops: [dragged] }];
  selectedOpId.value = dragged.id;
  clearDragState();
}

function takeDraggedOperation() {
  const current = dragState.value;
  if (!current) return null;
  if (current.kind === 'palette') return createRdCraftOperationFromTemplate(current.template);
  removeOp(current.op.id);
  return current.op;
}

function clearDragState() {
  dragState.value = null;
  dragOver.value = null;
}

async function handleCraftAction(key: string) {
  if (key === 'cancel') {
    emit('back');
    return;
  }
  if (key === 'preview') {
    showPreviewModal.value = true;
    return;
  }
  const response = await createRdResource({
    module: 'crafts',
    action: key,
    form: {
      ...craftForm,
      owner: craftForm.author,
      detailText: craftDetail.value,
      parallelOutsource: `${craftStats.value.parStages} / ${craftStats.value.outOps}`,
      stats: craftStats.value,
    },
    lines: flatRouteRows.value.map((row) => ({ ...row })),
  }) as { message?: string };
  submitMessage.value = `${response.message || '新增工艺已保存'}，已通过新增接口调用。`;
  showPreviewModal.value = false;
}
</script>

<style scoped>
.cf-base-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px 20px;
}

.cf-summary {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}

.cf-summary-card {
  background: #fff;
  border: 1px solid var(--aw-border);
  border-radius: 6px;
  padding: 12px 14px;
}

.cf-summary-card .l {
  font-size: 11px;
  color: var(--aw-fg-3);
}

.cf-summary-card .l span {
  color: var(--aw-fg-4);
}

.cf-summary-card .n {
  margin-top: 4px;
  font-family: var(--aw-font-num);
  font-size: 18px;
  font-weight: 600;
  color: var(--aw-fg-1);
}

.cf-summary-card .u {
  margin-left: 4px;
  color: var(--aw-fg-4);
  font-family: inherit;
  font-size: 11px;
  font-weight: 400;
}

.cf-summary-card.in .n {
  color: #3d5dc9;
}

.cf-summary-card.out .n {
  color: #b26a24;
}

.cf-route-entry {
  min-height: 168px;
  background: #fff;
  border: 1px solid var(--aw-border);
  border-radius: 8px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 14px;
}

.cf-add-route-btn {
  height: 34px;
  padding: 0 18px;
  border: 1px solid var(--aw-border);
  background: #fff;
  color: var(--aw-fg-1);
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.cf-add-route-btn:hover {
  border-color: var(--aw-primary);
  color: var(--aw-primary);
}

.cf-route-empty,
.cf-empty-text {
  font-size: 12px;
  color: var(--aw-fg-4);
}

.cf-empty-text {
  padding: 30px 10px;
  text-align: center;
}

.cf-route-brief {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 12px 14px;
  background: var(--aw-bg);
  border: 1px solid var(--aw-divider);
  border-radius: 6px;
  font-size: 12px;
  color: var(--aw-fg-2);
}

.cf-route-brief span:first-child {
  color: var(--aw-fg-1);
  font-weight: 600;
}

.cf-route-edit-btn {
  margin-left: auto;
  height: 28px;
  padding: 0 12px;
  border: 1px solid var(--aw-primary);
  color: var(--aw-primary);
  background: #fff;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
}

.cf-route-modal-mask {
  z-index: 3000;
  padding: 38px;
}

.cf-route-modal {
  width: min(1520px, calc(100vw - 76px));
  height: min(900px, calc(100vh - 76px));
  max-height: none;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cf-route-modal-head {
  height: 56px;
  flex: none;
}

.cf-route-modal-head strong {
  margin-right: 10px;
  color: var(--aw-fg-1);
  font-size: 15px;
}

.cf-route-modal-head span {
  color: var(--aw-fg-3);
  font-size: 12px;
}

.cf-route-modal-body {
  flex: 1;
  min-height: 0;
  padding: 14px;
  background: #f4f6fa;
}

.cf-route-modal-foot {
  height: 56px;
  flex: none;
}

.cf-editor {
  display: flex;
  height: 100%;
  background: #fff;
  border: 1px solid var(--aw-border);
  border-radius: 6px;
  overflow: hidden;
}

.cf-palette {
  width: 240px;
  flex: none;
  border-right: 1px solid var(--aw-divider);
  background: #fafbfc;
  display: flex;
  flex-direction: column;
}

.cf-palette-h {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--aw-divider);
  font-size: 13px;
  font-weight: 600;
  color: var(--aw-fg-1);
}

.cf-palette-h .tag {
  padding: 1px 5px;
  border: 1px solid var(--aw-divider);
  border-radius: 3px;
  background: #fff;
  color: var(--aw-fg-4);
  font-size: 10px;
  font-weight: 400;
}

.cf-palette-search {
  padding: 10px 12px 6px;
  border-bottom: 1px solid var(--aw-divider);
}

.cf-palette-search .box {
  height: 28px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1px solid var(--aw-border);
  border-radius: 6px;
  padding: 0 10px;
}

.cf-palette-search input {
  flex: 1;
  border: 0;
  background: transparent;
  outline: 0;
  font: inherit;
  font-size: 12px;
}

.cf-palette-tabs {
  display: flex;
  gap: 4px;
  padding: 4px 12px;
  border-bottom: 1px solid var(--aw-divider);
}

.cf-palette-tabs span {
  flex: 1;
  padding: 6px 0;
  border-radius: 4px;
  color: var(--aw-fg-3);
  cursor: pointer;
  font-size: 12px;
  text-align: center;
}

.cf-palette-tabs span.on {
  background: #fff;
  color: var(--aw-primary);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(16, 24, 40, .04);
}

.cf-palette-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px 8px;
}

.cf-pgroup {
  margin-bottom: 10px;
}

.cf-pgroup-h {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  color: var(--aw-fg-3);
  font-size: 11px;
  font-weight: 500;
}

.cf-pgroup-h::before {
  content: "";
  width: 3px;
  height: 10px;
  border-radius: 1px;
  background: var(--aw-primary);
  opacity: .6;
}

.cf-pgroup-h .n {
  margin-left: auto;
  color: var(--aw-fg-4);
  font-family: var(--aw-font-num);
}

.cf-pcard {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid var(--aw-divider);
  background: #fff;
  cursor: grab;
  margin-bottom: 4px;
  font-size: 12px;
  transition: all .12s;
}

.cf-pcard:hover {
  border-color: var(--aw-primary);
  box-shadow: 0 2px 6px rgba(86, 119, 252, .08);
}

.cf-pcard .ic {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex: none;
}

.cf-pcard .ic.in {
  background: var(--aw-tint-sky);
  color: #2e4a85;
}

.cf-pcard .ic.out {
  background: var(--aw-tint-peach);
  color: #b26a24;
}

.cf-pcard-main {
  flex: 1;
  min-width: 0;
}

.cf-pcard .nm {
  color: var(--aw-fg-1);
  font-size: 13px;
  font-weight: 500;
}

.cf-pcard .sub {
  margin-top: 1px;
  color: var(--aw-fg-3);
  font-size: 11px;
}

.cf-drag-ghost {
  position: fixed;
  z-index: 1200;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 136px;
  padding: 9px 12px;
  border: 1px solid var(--aw-primary);
  border-radius: 6px;
  background: #fff;
  color: var(--aw-fg-1);
  box-shadow: 0 8px 24px rgba(16, 24, 40, .16);
  font-size: 12px;
  pointer-events: none;
}

.cf-drag-ghost .ic {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  font-size: 13px;
}

.cf-drag-ghost .ic.in {
  background: var(--aw-tint-sky);
  color: #2e4a85;
}

.cf-drag-ghost .ic.out {
  background: var(--aw-tint-peach);
  color: #b26a24;
}

.cf-canvas {
  flex: 1;
  position: relative;
  overflow: auto;
  padding: 28px 28px 60px;
  background: #f5f6fa;
  background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px);
  background-size: 16px 16px;
}

.cf-cv-bar {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  margin-bottom: 18px;
  background: #fff;
  border: 1px solid var(--aw-border);
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(16, 24, 40, .04);
  color: var(--aw-fg-3);
  font-size: 12px;
}

.cf-cv-bar .legend,
.cf-cv-bar .lg {
  display: inline-flex;
  align-items: center;
  gap: 14px;
}

.cf-cv-bar .lg {
  gap: 5px;
  color: var(--aw-fg-2);
}

.cf-cv-bar .sw {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  display: inline-block;
}

.cf-cv-bar .sw.in {
  background: var(--aw-tint-sky);
  border: 1.5px solid #5677fc;
}

.cf-cv-bar .sw.out {
  background: var(--aw-tint-peach);
  border: 1.5px solid #d97706;
}

.cf-cv-bar .sw.seq {
  width: 24px;
  height: 2px;
  background: #5677fc;
}

.cf-cv-bar .sw.par {
  width: 24px;
  height: 8px;
  background: #fff;
  border: 1.5px dashed #10b981;
}

.cf-cv-bar .zoom {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--aw-border);
  border-radius: 5px;
  padding: 1px;
  background: #fff;
}

.cf-cv-bar .zoom button,
.cf-cv-bar .zoom-value {
  padding: 2px 8px;
  border: 0;
  border-radius: 3px;
  background: transparent;
  color: var(--aw-fg-2);
  font-family: var(--aw-font-num);
  font-size: 12px;
  line-height: 1.5;
}

.cf-cv-bar .zoom button {
  cursor: pointer;
}

.cf-cv-bar .zoom button:hover:not(:disabled) {
  background: var(--aw-bg);
  color: var(--aw-primary);
}

.cf-cv-bar .zoom button:disabled {
  color: var(--aw-fg-4);
  cursor: not-allowed;
  opacity: .55;
}

.cf-cv-bar .zoom-value {
  min-width: 42px;
  text-align: center;
  cursor: default;
}

.cf-cv-bar .zoom .fit {
  min-width: 60px;
  text-align: center;
}

.cf-flow-shell {
  width: max-content;
  min-width: max-content;
  position: relative;
}

.cf-flow {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: stretch;
  width: max-content;
  min-width: max-content;
  padding: 18px 0 8px;
  transform-origin: left top;
  will-change: transform;
}

.cf-stage {
  display: flex;
  align-items: center;
}

.cf-stage-box {
  position: relative;
}

.cf-conn {
  position: relative;
  width: 60px;
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.cf-conn .hline {
  position: absolute;
  top: 50%;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 2px;
  background: #5677fc;
  transform: translateY(-50%);
}

.cf-conn .arrow {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  width: 24px;
  height: 24px;
  background: #5677fc;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 4px #f5f6fa;
  cursor: pointer;
}

.cf-conn.drop-over .arrow {
  background: #10b981;
  box-shadow: 0 0 0 5px rgba(16, 185, 129, .18), 0 3px 10px rgba(16, 185, 129, .28);
}

.cf-conn.start {
  width: 70px;
  align-self: stretch;
}

.cf-conn.start .hline {
  left: 27px;
  width: calc(100% - 27px);
}

.cf-conn.start .arrow {
  display: none;
}

.start-dot {
  position: absolute;
  left: 18px;
  top: 50%;
  z-index: 2;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #5677fc;
  transform: translateY(-50%);
  box-shadow: 0 0 0 4px #f5f6fa;
}

.start-badge {
  position: absolute;
  top: calc(50% - 34px);
  left: 5px;
  z-index: 3;
  height: 20px;
  line-height: 20px;
  padding: 0 8px;
  border-radius: 10px;
  background: #eef2ff;
  color: #3d5dc9;
  border: 1px solid rgba(86, 119, 252, .35);
  font-size: 11px;
  font-weight: 600;
}

.cf-stage-no {
  position: absolute;
  top: -12px;
  left: -8px;
  z-index: 3;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  background: #5677fc;
  color: #fff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--aw-font-num);
  font-size: 11px;
  font-weight: 600;
}

.cf-stage-no.par {
  background: #10b981;
}

.cf-stage-par {
  position: relative;
  border: 1.5px dashed #10b981;
  border-radius: 12px;
  padding: 28px 30px 18px;
  background: rgba(219, 243, 230, .32);
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 290px;
}

.cf-stage-par.drop-over {
  outline: 2px solid #10b981;
}

.cf-stage-par-label {
  position: absolute;
  top: -10px;
  left: 14px;
  z-index: 2;
  padding: 1px 8px;
  border-radius: 9px;
  background: #10b981;
  color: #fff;
  font-size: 11px;
  font-weight: 500;
}

.cf-par-gateway {
  position: absolute;
  top: 50%;
  z-index: 4;
  width: 16px;
  height: 16px;
  background: #fff;
  border: 1.5px solid #10b981;
  color: #10b981;
  transform: translateY(-50%) rotate(45deg);
  box-shadow: 0 0 0 4px rgba(219, 243, 230, .78);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cf-par-gateway.in {
  left: 8px;
}

.cf-par-gateway.out {
  right: 8px;
}

.cf-par-gateway span {
  transform: rotate(-45deg);
  font-size: 10px;
  line-height: 1;
  font-weight: 700;
}

.cf-par-op-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cf-par-op-row::before,
.cf-par-op-row::after {
  content: "";
  position: absolute;
  top: 50%;
  z-index: 1;
  height: 1px;
  border-top: 1px dashed #10b981;
  transform: translateY(-50%);
}

.cf-par-op-row::before {
  left: -22px;
  right: calc(100% - 1px);
}

.cf-par-op-row::after {
  left: calc(100% - 1px);
  right: -22px;
}

.cf-stage-par .cf-op,
.cf-par-op-row .cf-op {
  z-index: 2;
}

.cf-op {
  width: 220px;
  background: #fff;
  border: 1.5px solid var(--aw-border);
  border-radius: 10px;
  cursor: grab;
  position: relative;
  transition: all .15s;
  box-shadow: 0 1px 3px rgba(16, 24, 40, .04);
  user-select: none;
}

.cf-op:hover {
  box-shadow: 0 4px 12px rgba(16, 24, 40, .08);
  transform: translateY(-1px);
}

.cf-op.selected {
  box-shadow: 0 0 0 2px var(--aw-primary), 0 4px 12px rgba(86, 119, 252, .18);
}

.cf-op.in {
  border-color: #5677fc;
  background: linear-gradient(to bottom, #f1f5ff, #fff 50px);
}

.cf-op.in .cf-op-h {
  background: linear-gradient(135deg, #5677fc, #3d5dc9);
  color: #fff;
}

.cf-op.out {
  border-color: #d97706;
  background: linear-gradient(to bottom, #fff7ed, #fff 50px);
}

.cf-op.out .cf-op-h {
  background: linear-gradient(135deg, #d97706, #b45309);
  color: #fff;
}

.cf-op.out.selected {
  box-shadow: 0 0 0 2px #b45309, 0 4px 12px rgba(217, 119, 6, .22);
}

.cf-op-h {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px 8px 0 0;
  font-size: 13px;
  font-weight: 600;
}

.cf-op-h .grip {
  cursor: grab;
  opacity: .55;
  font-size: 13px;
  letter-spacing: -2px;
}

.cf-op-h .num {
  font-family: var(--aw-font-num);
  background: rgba(255, 255, 255, .22);
  padding: 0 6px;
  border-radius: 3px;
  font-size: 11px;
  line-height: 1.5;
}

.cf-op-h .nm,
.cf-props-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cf-op-h .x {
  cursor: pointer;
  opacity: .75;
  font-size: 14px;
  line-height: 1;
  padding: 2px 4px;
  border-radius: 3px;
}

.cf-op-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px 12px 0;
}

.cf-op-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  line-height: 1.6;
  font-weight: 500;
  background: #eef2ff;
  color: #5677fc;
}

.cf-op-tag.in-tag {
  background: var(--aw-tint-sky);
  color: #2e4a85;
}

.cf-op-tag.out-tag {
  background: var(--aw-tint-peach);
  color: #b26a24;
}

.cf-op-tag.qc-tag {
  background: #fbdfdf;
  color: #7a2a2a;
}

.cf-op-b {
  padding: 8px 12px 12px;
  font-size: 12px;
  color: var(--aw-fg-2);
}

.cf-op-b-row {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  line-height: 1.5;
}

.cf-op-b-row .k {
  color: var(--aw-fg-3);
  font-size: 11px;
}

.cf-op-b-row .v {
  color: var(--aw-fg-1);
  font-family: var(--aw-font-num);
  font-size: 12px;
  font-weight: 500;
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cf-op-f {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-top: 1px solid var(--aw-divider);
  background: #fafbfc;
  border-radius: 0 0 8px 8px;
  color: var(--aw-fg-3);
  font-size: 11px;
}

.cf-op-f .av {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--aw-primary-soft);
  color: var(--aw-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
}

.cf-op-f .ml {
  margin-left: auto;
  font-family: var(--aw-font-num);
}

.cf-op-actions {
  display: flex;
  justify-content: center;
  margin-top: 6px;
  gap: 6px;
}

.cf-op-action {
  font-size: 11px;
  background: #fff;
  border: 1px solid var(--aw-border);
  border-radius: 10px;
  padding: 2px 10px;
  color: var(--aw-fg-3);
  cursor: pointer;
  line-height: 1.6;
}

.cf-op-action:hover {
  border-color: var(--aw-primary);
  color: var(--aw-primary);
}

.par-add {
  border: 1px dashed var(--aw-border);
  border-radius: 6px;
  background: #fff;
  color: var(--aw-fg-3);
  padding: 8px 10px;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
}

.par-add:hover {
  border-color: #10b981;
  color: #10b981;
  background: rgba(219, 243, 230, .5);
}

.cf-add-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 140px;
  flex: none;
  align-self: stretch;
  border: 2px dashed var(--aw-border);
  border-radius: 10px;
  color: var(--aw-fg-3);
  cursor: pointer;
  background: rgba(255, 255, 255, .4);
  font-size: 13px;
  transition: all .15s;
}

.cf-add-stage.drag-over {
  border-color: #10b981;
  color: #10b981;
  background: rgba(219, 243, 230, .48);
}

.cf-add-stage .pl {
  font-size: 22px;
  line-height: 1;
  margin-bottom: 4px;
}

.cf-add-stage.end-only {
  cursor: default;
  color: var(--aw-fg-4);
  background: rgba(255, 255, 255, .32);
}

.cf-props {
  width: 340px;
  flex: none;
  border-left: 1px solid var(--aw-divider);
  background: #fff;
  display: flex;
  flex-direction: column;
}

.cf-props-h {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--aw-divider);
  color: var(--aw-fg-1);
  font-size: 13px;
  font-weight: 600;
}

.cf-props-h .typ {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 500;
  line-height: 1.6;
}

.cf-props-h .typ.in {
  background: var(--aw-tint-sky);
  color: #2e4a85;
}

.cf-props-h .typ.out {
  background: var(--aw-tint-peach);
  color: #b26a24;
}

.cf-props-code {
  color: var(--aw-fg-4);
  font-size: 11px;
  font-weight: 400;
}

.cf-props-close {
  border: 0;
  background: transparent;
  color: var(--aw-fg-4);
  cursor: pointer;
  font-size: 16px;
}

.cf-props-tabs {
  display: flex;
  border-bottom: 1px solid var(--aw-divider);
  padding: 0 8px;
  overflow-x: auto;
}

.cf-props-tabs span {
  padding: 9px 8px;
  font-size: 12px;
  color: var(--aw-fg-3);
  cursor: pointer;
  position: relative;
  white-space: nowrap;
}

.cf-props-tabs span.on {
  color: var(--aw-primary);
  font-weight: 600;
}

.cf-props-tabs span.on::after {
  content: "";
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: -1px;
  height: 2px;
  background: var(--aw-primary);
}

.cf-props-b {
  flex: 1;
  overflow-y: auto;
  padding: 14px 16px;
}

.cf-prop-sec + .cf-prop-sec {
  margin-top: 18px;
}

.cf-prop-sec-h {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  color: var(--aw-fg-1);
  font-size: 12px;
  font-weight: 600;
}

.cf-prop-sec-h::before {
  content: "";
  width: 3px;
  height: 10px;
  background: var(--aw-primary);
  border-radius: 1px;
}

.cf-prop-sec-h .n {
  margin-left: auto;
  color: var(--aw-fg-4);
  font-size: 11px;
  font-weight: 400;
}

.cf-prop-row {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 8px;
  margin-bottom: 10px;
  align-items: center;
  font-size: 12px;
}

.cf-prop-row > label {
  color: var(--aw-fg-3);
  text-align: right;
}

.cf-prop-row > label.req::before {
  content: "*";
  color: var(--aw-danger);
  margin-right: 2px;
}

.cf-prop-row input,
.cf-prop-row select,
.cf-prop-row textarea,
.cf-mini-table input {
  width: 100%;
  background: var(--aw-bg);
  border: 1px solid transparent;
  border-radius: 5px;
  padding: 5px 8px;
  font: inherit;
  font-size: 12px;
  color: var(--aw-fg-1);
}

.cf-prop-row input:focus,
.cf-prop-row select:focus,
.cf-prop-row textarea:focus,
.cf-mini-table input:focus {
  outline: 0;
  background: #fff;
  border-color: var(--aw-primary);
  box-shadow: 0 0 0 2px rgba(86, 119, 252, .12);
}

.cf-prop-row textarea {
  min-height: 60px;
  resize: vertical;
}

.cf-input-suffix {
  position: relative;
}

.cf-input-suffix input {
  padding-right: 34px;
}

.cf-input-suffix .sfx {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  color: var(--aw-fg-4);
  font-family: var(--aw-font-num);
  font-size: 11px;
  pointer-events: none;
}

.cf-seg {
  display: inline-flex;
  background: var(--aw-bg);
  border-radius: 5px;
  padding: 2px;
  width: 100%;
}

.cf-seg span {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: var(--aw-fg-2);
  padding: 4px 0;
  cursor: pointer;
  border-radius: 4px;
}

.cf-seg span.on {
  background: #fff;
  color: var(--aw-primary);
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(16, 24, 40, .06);
}

.cf-seg.tone-out span.on {
  color: #b26a24;
}

.cf-seg.tone-par span.on {
  color: #1f6a40;
}

.cf-props-foot {
  padding: 10px 16px;
  border-top: 1px solid var(--aw-divider);
  display: flex;
  justify-content: space-between;
  background: var(--aw-surface-2);
}

.cf-mini-table {
  min-width: 0;
  font-size: 12px;
}

.cf-mini-table th,
.cf-mini-table td {
  padding: 7px 6px;
  max-width: 160px;
}

.cf-empty-cell,
.cf-add-cell {
  text-align: center;
  color: var(--aw-fg-3);
}

.cf-add-param {
  margin-top: 10px;
}

.danger {
  color: var(--aw-danger);
}

.cf-param-mask {
  z-index: 3200;
}

.cf-param-modal {
  width: 420px;
}

.cf-param-body {
  display: grid;
  gap: 14px;
}

.rd-textarea {
  min-height: 96px;
  resize: vertical;
}

.cf-preview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
  color: var(--aw-fg-2);
  font-size: 13px;
}

.cf-preview-table {
  min-width: 900px;
}

:deep(.aw-rt-area) {
  min-height: 168px;
  line-height: 1.8;
  white-space: pre-wrap;
}

@media (max-width: 1200px) {
  .cf-base-grid,
  .cf-summary,
  .cf-preview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .cf-route-modal {
    width: calc(100vw - 32px);
    height: calc(100vh - 32px);
  }
}
</style>

<style>
.cf-op .cf-op-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px 12px 0;
}

.cf-op .cf-op-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  line-height: 1.6;
  font-weight: 500;
  background: #eef2ff;
  color: #5677fc;
}

.cf-op .cf-op-tag.in-tag {
  background: var(--aw-tint-sky);
  color: #2e4a85;
}

.cf-op .cf-op-tag.out-tag {
  background: var(--aw-tint-peach);
  color: #b26a24;
}

.cf-op .cf-op-tag.qc-tag {
  background: #fbdfdf;
  color: #7a2a2a;
}

.cf-op .cf-op-b {
  padding: 8px 12px 12px;
  font-size: 12px;
  color: var(--aw-fg-2);
}

.cf-op .cf-op-b-row {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-top: 5px;
  line-height: 1.5;
}

.cf-op .cf-op-b-row .k {
  color: var(--aw-fg-3);
  font-size: 11px;
  white-space: nowrap;
}

.cf-op .cf-op-b-row .v {
  max-width: 130px;
  overflow: hidden;
  color: var(--aw-fg-1);
  font-family: var(--aw-font-num);
  font-size: 12px;
  font-weight: 500;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cf-op .cf-op-f {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-top: 1px solid var(--aw-divider);
  background: #fafbfc;
  border-radius: 0 0 8px 8px;
  color: var(--aw-fg-3);
  font-size: 11px;
}

.cf-op .cf-op-f .av {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--aw-primary-soft);
  color: var(--aw-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
}

.cf-op .cf-op-f .ml {
  margin-left: auto;
  font-family: var(--aw-font-num);
}
</style>
