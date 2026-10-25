/**
 * YouTube Course Study Room - Distillation Renderer
 * Created by Xiao Ang
 */

(function () {
  function escapeHTML(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  window.renderDistillView = function renderDistillView(targetElementId) {
    const root = document.getElementById(targetElementId);
    if (!root) return;

    const data = window.DISTILL_DATA || {};
    const principles = data.principles || [];
    const models = data.models || [];
    const glossary = data.glossary || [];

    let html = `<div class="distill-container">`;

    // 1. Principles & Axioms Banner
    if (principles.length > 0) {
      html += `
        <div class="distill-hero-quote">
          <blockquote>“${escapeHTML(principles[0].text)}”</blockquote>
          <div class="quote-author">
            <span>⚡ ${escapeHTML(principles[0].title)}</span>
            <small style="opacity:0.7">· ${escapeHTML(data.author || 'Course Mentor')}</small>
          </div>
        </div>
      `;
    }

    // 2. Actionable Decision Models
    html += `
      <div class="model-section">
        <div class="model-section-title">
          <span>🎯 主模型与决策规则 (Actionable Models & Playbooks)</span>
        </div>
        <div class="distill-models-grid">
    `;

    models.forEach(model => {
      html += `
        <article class="distill-model-card" id="${escapeHTML(model.id)}">
          <div class="model-header">
            <div class="model-title-group">
              <h4>${escapeHTML(model.name)}</h4>
              <div class="model-category">${escapeHTML(model.category || '')}</div>
            </div>
            <span class="model-badge">${escapeHTML(model.badge || '核心模型')}</span>
          </div>

          <p class="model-desc">${escapeHTML(model.description)}</p>

          ${model.coreQuote ? `
            <div style="background:rgba(226,183,85,0.06);border-left:3px solid #e2b755;padding:8px 12px;border-radius:4px;font-style:italic;font-size:0.85rem;color:#f1f5f9;">
              ${escapeHTML(model.coreQuote)}
            </div>
          ` : ''}

          <div class="model-section">
            <span class="model-section-title">🚦 触发前提条件</span>
            <ul style="margin:0;padding-left:18px;font-size:0.85rem;color:#cbd5e1;line-height:1.6;">
              ${(model.prerequisites || []).map(p => `<li>${escapeHTML(p)}</li>`).join('')}
            </ul>
          </div>

          <div class="model-section">
            <span class="model-section-title">⚙️ 执行逻辑与步骤</span>
            <div class="model-steps-list">
              ${(model.steps || []).map(s => `
                <div class="model-step-item">
                  <div class="step-num">${s.step}</div>
                  <div class="step-content">
                    <strong>${escapeHTML(s.title)}</strong>
                    <p>${escapeHTML(s.detail)}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          ${model.invalidation && model.invalidation.length ? `
            <div class="model-invalidation">
              <strong>⛔ 模型失效与止损标准 (Invalidation Boundary)</strong>
              ${model.invalidation.map(inv => `<div>• ${escapeHTML(inv)}</div>`).join('')}
            </div>
          ` : ''}

          ${model.checklist && model.checklist.length ? `
            <div class="model-section">
              <span class="model-section-title">📋 挂单前执行打勾单</span>
              <div class="model-checklist">
                ${model.checklist.map((item, idx) => `
                  <label class="checklist-item">
                    <input type="checkbox" id="chk-${model.id}-${idx}">
                    <span>${escapeHTML(item)}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </article>
      `;
    });

    html += `
        </div>
      </div>
    `;

    // 3. Glossary Section
    if (glossary.length > 0) {
      html += `
        <div class="model-section" style="margin-top:20px;">
          <div class="model-section-title">
            <span>📖 核心概念与词典 (Vocabulary & Glossary)</span>
          </div>
          <div class="glossary-grid">
            ${glossary.map(g => `
              <div class="glossary-card">
                <h5>
                  <span>${escapeHTML(g.term)}</span>
                  <span class="glossary-abbr">${escapeHTML(g.abbr || '')}</span>
                </h5>
                <strong style="font-size:0.82rem;color:#e2b755;">${escapeHTML(g.translation || '')}</strong>
                <p>${escapeHTML(g.definition)}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    html += `</div>`;
    root.innerHTML = html;
  };
})();
