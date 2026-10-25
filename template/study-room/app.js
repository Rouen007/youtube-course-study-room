/**
 * YouTube Course Study Room - Main Application Engine
 * Created by Xiao Ang
 */

(function () {
  'use strict';

  // State
  let currentLessonId = 'ep01';
  let activeView = 'classroom';
  let notebook = {
    summaryNote: '',
    completedLessons: [],
    lessonNotes: {}
  };
  let isSimulatedBehind = false;

  // Helpers
  function $(selector) {
    return document.querySelector(selector);
  }

  function $$(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function escapeHTML(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function parseMarkdown(md) {
    if (!md) return '';
    return md
      .replace(/### (.*)/g, '<h3>$1</h3>')
      .replace(/## (.*)/g, '<h2>$1</h2>')
      .replace(/# (.*)/g, '<h1>$1</h1>')
      .replace(/> "(.*)"/g, '<blockquote>“$1”</blockquote>')
      .replace(/> (.*)/g, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/- \[ \] (.*)/g, '<div class="checklist-item"><input type="checkbox"> <span>$1</span></div>')
      .replace(/- (.*)/g, '<li>$1</li>')
      .replace(/\n\n/g, '<br/>');
  }

  // Notebook Storage (Native macOS bridge or LocalStorage)
  function initNotebook() {
    if (window.nativeNotebook) {
      notebook = window.nativeNotebook;
    } else {
      try {
        const stored = localStorage.getItem('study_room_notebook');
        if (stored) notebook = JSON.parse(stored);
      } catch (e) {
        console.warn('LocalStorage load failed:', e);
      }
    }
    const summaryInput = $('#summaryNote');
    if (summaryInput) summaryInput.value = notebook.summaryNote || '';
  }

  function saveNotebook() {
    const summaryInput = $('#summaryNote');
    if (summaryInput) notebook.summaryNote = summaryInput.value;

    const json = JSON.stringify(notebook, null, 2);
    try {
      localStorage.setItem('study_room_notebook', json);
    } catch (e) {}

    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.saveNotebook) {
      window.webkit.messageHandlers.saveNotebook.postMessage(json);
    }

    const statusEl = $('#saveStatus');
    if (statusEl) {
      statusEl.textContent = '已自动保存 ' + new Date().toLocaleTimeString();
    }
  }

  // Views Switching
  function switchView(viewName) {
    activeView = viewName;
    $$('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });
    $$('.view').forEach(v => {
      v.classList.toggle('active', v.id === `view-${viewName}`);
    });

    if (viewName === 'distill' && window.renderDistillView) {
      window.renderDistillView('distillMountPoint');
    }
  }

  // Lesson Rendering
  function renderLessonList(filterText = '') {
    const container = $('#lessonList');
    if (!container) return;

    const lib = window.COURSE_LIBRARY || { lessons: [] };
    const query = filterText.toLowerCase().trim();

    const filtered = lib.lessons.filter(l => {
      if (!query) return true;
      return l.title.toLowerCase().includes(query) ||
             (l.titleEn && l.titleEn.toLowerCase().includes(query)) ||
             (l.topics && l.topics.some(t => t.toLowerCase().includes(query)));
    });

    container.innerHTML = filtered.map(l => {
      const isDone = (notebook.completedLessons || []).includes(l.id);
      const isActive = l.id === currentLessonId;
      return `
        <div class="lesson-card ${isActive ? 'active' : ''}" data-lesson-id="${l.id}">
          <div class="lesson-card-head">
            <span>${l.date || `Ep.${l.ep}`} · ${l.duration || ''}</span>
            <span>${isDone ? '✅ 已学' : '⏳ 待学'}</span>
          </div>
          <h4>${escapeHTML(l.title)}</h4>
          <div class="topics-strip">
            ${(l.topics || []).map(t => `<span class="topic-tag">${escapeHTML(t)}</span>`).join('')}
          </div>
        </div>
      `;
    }).join('');

    // Attach click handlers
    $$('.lesson-card').forEach(card => {
      card.addEventListener('click', () => {
        selectLesson(card.dataset.lessonId);
      });
    });

    updateProgressMeta();
  }

  function selectLesson(lessonId) {
    currentLessonId = lessonId;
    const lib = window.COURSE_LIBRARY || { lessons: [] };
    const lesson = lib.lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    renderLessonList($('#lessonSearch')?.value || '');
    renderLessonDetail(lesson);
  }

  function renderLessonDetail(lesson) {
    const container = $('#lessonDetail');
    if (!container) return;

    const isDone = (notebook.completedLessons || []).includes(lesson.id);

    container.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
        <div>
          <p class="eyebrow">${escapeHTML(lesson.module || 'Course Module')}</p>
          <h3 style="margin:4px 0 8px;font-size:1.3rem;color:#fff;">${escapeHTML(lesson.title)}</h3>
          <small style="color:#9cb2c9;">${escapeHTML(lesson.titleEn || '')}</small>
        </div>
        <button class="ghost small" id="toggleCompleteBtn" type="button">
          ${isDone ? '✅ 标记为未完成' : '⭕ 标记为已完成'}
        </button>
      </div>

      <!-- YouTube Embed Player -->
      <div class="player-box">
        <iframe
          id="ytPlayerFrame"
          src="https://www.youtube.com/embed/${lesson.videoId}?enablejsapi=1"
          title="${escapeHTML(lesson.title)}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
      </div>

      <!-- Keyframes Panel -->
      ${lesson.keyframes && lesson.keyframes.length ? `
        <div class="keyframes-panel">
          <div class="eyebrow">1080p 原片板书与关键帧 (点击查看高清放大图)</div>
          <div class="keyframes-grid">
            ${lesson.keyframes.map((kf, idx) => `
              <div class="keyframe-card" data-idx="${idx}">
                <img src="${escapeHTML(kf.src)}" alt="${escapeHTML(kf.title || '')}" loading="lazy" />
                <div class="keyframe-meta">
                  <div class="keyframe-time-row">
                    <span>⏱ ${escapeHTML(kf.time)}</span>
                    <span style="font-size:0.72rem;color:#8da4be;">点击放大 ↗</span>
                  </div>
                  <strong style="display:block;font-size:0.88rem;color:#fff;margin-bottom:3px;">${escapeHTML(kf.title || '')}</strong>
                  <p>${escapeHTML(kf.caption || '')}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Handbook Content -->
      <div class="handbook-content">
        <div class="eyebrow">三层提炼与讲义</div>
        ${parseMarkdown(lesson.handbook || '')}
      </div>

      <!-- Personal Lesson Note -->
      <div class="note-box" style="margin-top:16px;">
        <div class="eyebrow">本课个人学习笔记</div>
        <textarea
          class="note-textarea"
          id="lessonNoteInput"
          placeholder="记录关于本讲你的理解、疑问或复盘心得...">${escapeHTML(notebook.lessonNotes[lesson.id] || '')}</textarea>
        <button class="primary small" id="saveLessonNoteBtn" style="align-self:flex-start;">保存本课笔记</button>
      </div>
    `;

    // Toggle complete
    $('#toggleCompleteBtn')?.addEventListener('click', () => {
      const idx = notebook.completedLessons.indexOf(lesson.id);
      if (idx >= 0) {
        notebook.completedLessons.splice(idx, 1);
      } else {
        notebook.completedLessons.push(lesson.id);
      }
      saveNotebook();
      selectLesson(lesson.id);
    });

    // Save lesson note
    $('#saveLessonNoteBtn')?.addEventListener('click', () => {
      const val = $('#lessonNoteInput')?.value || '';
      notebook.lessonNotes[lesson.id] = val;
      saveNotebook();
      alert('本课笔记已保存！');
    });

    // Attach keyframe lightbox handlers
    $$('.keyframe-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.idx, 10);
        const kf = lesson.keyframes[idx];
        openLightbox(kf, lesson.videoId);
      });
    });
  }

  function openLightbox(kf, videoId) {
    const dialog = $('#imageViewer');
    if (!dialog) return;

    $('#viewerTitle').textContent = kf.title || '关键帧放大图';
    $('#viewerImg').src = kf.src;
    $('#viewerCaption').textContent = kf.caption || '';

    const jumpYT = $('#viewerJumpYT');
    if (jumpYT && kf.time) {
      const parts = kf.time.split(':');
      let sec = 0;
      if (parts.length === 2) sec = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      else if (parts.length === 3) sec = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);

      jumpYT.href = `https://www.youtube.com/watch?v=${videoId}&t=${sec}s`;
      jumpYT.style.display = 'inline-flex';
    }

    dialog.showModal();
  }

  function updateProgressMeta() {
    const lib = window.COURSE_LIBRARY || { lessons: [] };
    const total = lib.lessons.length || 1;
    const completed = (notebook.completedLessons || []).length;
    const pct = Math.round((completed / total) * 100);

    const fill = $('#progressFill');
    if (fill) fill.style.width = `${pct}%`;

    const meta = $('#progressMeta');
    if (meta) meta.textContent = `已学完 ${completed} / ${total} 讲 (${pct}%)`;
  }

  // GitHub Red-Dot Sync Engine
  async function checkGitHubSync() {
    const chipDot = $('#syncChipDot');
    const chipLabel = $('#syncChipLabel');
    const banner = $('#syncBehindBanner');
    const topDot = $('#syncTopDot');
    const topLabel = $('#syncTopLabel');

    if (chipLabel) chipLabel.textContent = '检测中…';

    const lib = window.COURSE_LIBRARY || {};
    const repo = lib.repo || 'Rouen007/youtube-course-study-room';
    const localVer = window.APP_VERSION || { updatedAt: new Date().toISOString(), commitSha: 'local' };

    try {
      const res = await fetch(`https://api.github.com/repos/${repo}/commits/main`);
      if (!res.ok) throw new Error('GitHub API response not ok');
      const data = await res.json();

      const remoteDate = new Date(data.commit.committer.date).getTime();
      const localDate = new Date(localVer.updatedAt).getTime();
      const isBehind = isSimulatedBehind || (remoteDate > localDate + 5000);

      renderSyncUI(isBehind, data.sha.substring(0, 7), data.commit.committer.date, data.commit.message);
    } catch (err) {
      console.warn('GitHub check error (falling back to simulation or cached):', err);
      renderSyncUI(isSimulatedBehind, 'remote', new Date().toISOString(), 'GitHub API 请求受限或离线');
    }
  }

  function renderSyncUI(isBehind, remoteSha, remoteDateStr, remoteMsg) {
    const chipDot = $('#syncChipDot');
    const chipLabel = $('#syncChipLabel');
    const banner = $('#syncBehindBanner');
    const topDot = $('#syncTopDot');
    const topLabel = $('#syncTopLabel');

    if (isBehind) {
      if (chipDot) {
        chipDot.className = 'sync-dot behind';
      }
      if (chipLabel) chipLabel.textContent = '🔴 有新更新';
      if (topDot) topDot.className = 'sync-dot behind';
      if (topLabel) topLabel.textContent = '🔴 发现 GitHub 有新内容';
      if (banner) banner.style.display = 'flex';
    } else {
      if (chipDot) {
        chipDot.className = 'sync-dot synced';
      }
      if (chipLabel) chipLabel.textContent = '已是最新';
      if (topDot) topDot.className = 'sync-dot synced';
      if (topLabel) topLabel.textContent = '已与 GitHub 同步';
      if (banner) banner.style.display = 'none';
    }

    // Update Modal Fields
    const localVer = window.APP_VERSION || { commitSha: 'local', updatedAt: new Date().toISOString() };
    if ($('#localShaDisplay')) $('#localShaDisplay').textContent = (localVer.commitSha || 'local').substring(0, 7);
    if ($('#localDateDisplay')) $('#localDateDisplay').textContent = new Date(localVer.updatedAt).toLocaleString();

    if ($('#remoteShaDisplay')) $('#remoteShaDisplay').textContent = remoteSha;
    if ($('#remoteDateDisplay')) $('#remoteDateDisplay').textContent = new Date(remoteDateStr).toLocaleString();
    if ($('#remoteMsgDisplay')) $('#remoteMsgDisplay').textContent = remoteMsg || 'GitHub 最新提交';

    const remoteCard = $('#remoteCard');
    if (remoteCard) remoteCard.classList.toggle('behind', isBehind);

    const desc = $('#syncNoticeDesc');
    const cmdCard = $('#syncCmdCard');
    if (isBehind) {
      if (desc) desc.innerHTML = '⚠️ <strong>检测到本地版本慢于 GitHub 远程主分支！</strong>建议拉取最新图解与讲义。';
      if (cmdCard) cmdCard.style.display = 'block';
    } else {
      if (desc) desc.innerHTML = '✅ 本地版本已是最新，所有 1080p 图解与讲义与远程仓库一致。';
      if (cmdCard) cmdCard.style.display = 'none';
    }
  }

  // Initialization
  document.addEventListener('DOMContentLoaded', () => {
    initNotebook();

    // Nav buttons
    $$('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    // Search input
    $('#lessonSearch')?.addEventListener('input', (e) => {
      renderLessonList(e.target.value);
    });

    // Lightbox close
    $('#closeViewer')?.addEventListener('click', () => {
      $('#imageViewer')?.close();
    });

    // GitHub Sync Modal
    const syncModal = $('#syncModal');
    $('#gitSyncChip')?.addEventListener('click', () => syncModal?.showModal());
    $('#gitTopPill')?.addEventListener('click', () => syncModal?.showModal());
    $('#syncBehindBanner')?.addEventListener('click', () => syncModal?.showModal());
    $('#closeSyncModal')?.addEventListener('click', () => syncModal?.close());

    // Simulation toggle button
    $('#btnSimulateBehind')?.addEventListener('click', () => {
      isSimulatedBehind = !isSimulatedBehind;
      alert(`已切换模拟状态：${isSimulatedBehind ? '🔴 模拟落后 (显示红点)' : '🟢 模拟同步 (清除红点)'}`);
      checkGitHubSync();
    });

    $('#btnCheckSyncNow')?.addEventListener('click', () => {
      checkGitHubSync();
    });

    // Copy pull command
    $('#btnCopyPullCmd')?.addEventListener('click', () => {
      const cmd = $('#pullCmdText')?.textContent || '';
      if (navigator.clipboard) {
        navigator.clipboard.writeText(cmd).then(() => alert('已复制更新命令到剪贴板！'));
      }
    });

    // Initial render
    const lib = window.COURSE_LIBRARY || { lessons: [] };
    if (lib.lessons.length > 0) {
      selectLesson(lib.lessons[0].id);
    }

    // Run initial sync check
    checkGitHubSync();
  });
})();
