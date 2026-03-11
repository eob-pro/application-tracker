(function () {
  'use strict';

  var STORAGE_APPS = 'application-tracker-applications';
  var STORAGE_COMPANIES = 'application-tracker-companies';

  var STATUS_OPTIONS = [
    { value: 'to_apply', label: 'To apply' },
    { value: 'applied', label: 'Applied' },
    { value: 'screened', label: 'Screened' },
    { value: 'interviewed', label: 'Interviewed' },
    { value: 'not_hired', label: 'Not hired' },
  ];

  var STATUS_OPTIONS_WITH_ALL = [
    { value: 'all', label: 'All' },
  ].concat(STATUS_OPTIONS);

  var SOURCE_OPTIONS = [
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'theladders', label: 'The Ladders' },
    { value: 'indeed', label: 'Indeed' },
    { value: 'teamworks', label: 'Teamworks' },
    { value: 'glassdoor', label: 'Glassdoor' },
    { value: 'lensa', label: 'Lensa' },
  ];

  var ATS_OPTIONS = [
    { value: '', label: '—' },
    { value: 'teamworks', label: 'Teamworks' },
    { value: 'greenhouse', label: 'Greenhouse' },
    { value: 'workday', label: 'Workday' },
    { value: 'lever', label: 'Lever' },
    { value: 'rippling', label: 'Rippling' },
    { value: 'icims', label: 'iCIMS' },
    { value: 'taleo', label: 'Taleo' },
    { value: 'company_site', label: 'Company site' },
    { value: 'other', label: 'Other' },
  ];

  function createStatusHistoryEntry(status) {
    return { status: status, date: new Date().toISOString() };
  }

  function loadJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to load', key, e);
    }
    return fallback;
  }

  function saveJson(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save', key, e);
    }
  }

  function migrateApplication(app) {
    if (app.statusHistory && Array.isArray(app.statusHistory)) return app;
    var status = app.status || 'to_apply';
    var statusMap = { interviewing: 'interviewed', rejected: 'not_hired', offer: 'interviewed' };
    var mappedStatus = statusMap[app.status] || (['to_apply', 'applied', 'screened', 'interviewed', 'not_hired'].indexOf(app.status) >= 0 ? app.status : status);
    var statusHistory = app.appliedDate
      ? [{ status: 'applied', date: new Date(app.appliedDate).toISOString() }]
      : [createStatusHistoryEntry(mappedStatus)];
    return {
      id: app.id,
      company: app.company || '',
      position: app.role || app.position || '',
      scope: app.scope ?? '',
      jobId: app.jobId ?? '',
      status: mappedStatus,
      statusHistory: statusHistory,
      sourceId: app.sourceId ?? 'linkedin',
      originalListingDate: app.originalListingDate ?? '',
      originalPostingUrl: app.originalPostingUrl ?? '',
      atsSystem: app.atsSystem ?? '',
      resumeVersion: app.resumeVersion ?? '',
      coverLetterUsed: app.coverLetterUsed ?? '',
      customCoverLetter: app.customCoverLetter ?? false,
      customResume: app.customResume ?? false,
      endedAt: app.endedAt ?? '',
      createdAt: app.createdAt || new Date().toISOString(),
      updatedAt: app.updatedAt || new Date().toISOString(),
    };
  }

  function loadApplications() {
    var raw = loadJson(STORAGE_APPS, []);
    return raw.map(migrateApplication);
  }

  function companyKey(name) {
    return (name || '').toLowerCase().trim();
  }

  function loadCompanies() {
    var apps = loadApplications();
    var fromApps = [];
    for (var i = 0; i < apps.length; i++) {
      if (apps[i].company) fromApps.push(apps[i].company);
    }
    var stored = loadJson(STORAGE_COMPANIES, []);
    var combined = Array.from(new Set(stored.concat(fromApps)));
    return combined.sort(function (a, b) { return companyKey(a).localeCompare(companyKey(b)); });
  }

  function mergeCompaniesByCase() {
    var byLower = {};
    applications.forEach(function (app) {
      var c = (app.company || '').trim();
      if (!c) return;
      var l = companyKey(c);
      if (!byLower[l]) byLower[l] = {};
      byLower[l][c] = (byLower[l][c] || 0) + 1;
    });
    var canonicalMap = {};
    for (var l in byLower) {
      var spellings = byLower[l];
      var best = null;
      var bestCount = 0;
      for (var s in spellings) {
        if (spellings[s] > bestCount || (spellings[s] === bestCount && (!best || s.localeCompare(best) < 0))) {
          best = s;
          bestCount = spellings[s];
        }
      }
      canonicalMap[l] = best;
    }
    var changed = false;
    applications = applications.map(function (app) {
      var c = (app.company || '').trim();
      if (!c) return app;
      var can = canonicalMap[companyKey(c)];
      if (can && can !== c) {
        changed = true;
        return Object.assign({}, app, { company: can });
      }
      return app;
    });
    companies = Object.keys(canonicalMap).map(function (l) { return canonicalMap[l]; }).sort(function (a, b) { return companyKey(a).localeCompare(companyKey(b)); });
    if (changed) saveApplications();
    saveJson(STORAGE_COMPANIES, companies);
  }

  function formatDate(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleDateString();
  }

  function getSourceLabel(value) {
    for (var i = 0; i < SOURCE_OPTIONS.length; i++) {
      if (SOURCE_OPTIONS[i].value === value) return SOURCE_OPTIONS[i].label;
    }
    return value || '—';
  }

  function getAtsLabel(value) {
    if (!value) return '—';
    for (var i = 0; i < ATS_OPTIONS.length; i++) {
      if (ATS_OPTIONS[i].value === value) return ATS_OPTIONS[i].label;
    }
    return value;
  }

  function getStatusLabel(value) {
    for (var i = 0; i < STATUS_OPTIONS.length; i++) {
      if (STATUS_OPTIONS[i].value === value) return STATUS_OPTIONS[i].label;
    }
    return value;
  }

  // --- State
  var applications = loadApplications();
  var companies = loadCompanies();
  mergeCompaniesByCase();
  var statusFilter = 'all';
  var editingId = null;

  function ensureCompany(name) {
    var trimmed = (name || '').trim();
    if (!trimmed) return trimmed;
    var key = companyKey(trimmed);
    for (var i = 0; i < companies.length; i++) {
      if (companyKey(companies[i]) === key) return companies[i];
    }
    companies.push(trimmed);
    companies.sort(function (a, b) { return companyKey(a).localeCompare(companyKey(b)); });
    saveJson(STORAGE_COMPANIES, companies);
    return trimmed;
  }

  function saveApplications() {
    saveJson(STORAGE_APPS, applications);
  }

  function addApplication(payload) {
    var company = ensureCompany((payload.company || '').trim()) || (payload.company || '').trim();
    var status = payload.status || 'to_apply';
    var statusHistory = payload.statusHistory || [createStatusHistoryEntry(status)];
    applications.unshift({
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2),
      company: company,
      position: (payload.position || '').trim(),
      scope: (payload.scope || '').trim(),
      jobId: (payload.jobId || '').trim(),
      status: status,
      statusHistory: statusHistory,
      sourceId: payload.sourceId || 'linkedin',
      originalListingDate: (payload.originalListingDate || '').trim() || undefined,
      originalPostingUrl: (payload.originalPostingUrl || '').trim() || undefined,
      atsSystem: (payload.atsSystem || '').trim(),
      resumeVersion: (payload.resumeVersion || '').trim(),
      coverLetterUsed: (payload.coverLetterUsed || '').trim(),
      customCoverLetter: !!payload.customCoverLetter,
      customResume: !!payload.customResume,
      endedAt: (payload.endedAt || '').trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    saveApplications();
  }

  function updateApplication(id, updates) {
    for (var i = 0; i < applications.length; i++) {
      if (applications[i].id !== id) continue;
      var app = applications[i];
      if (updates.company != null) {
        updates.company = ensureCompany((updates.company || '').trim()) || (updates.company || '').trim();
      }
      var next = Object.assign({}, app, updates, { updatedAt: new Date().toISOString() });
      if (updates.status != null && updates.status !== app.status) {
        next.statusHistory = (app.statusHistory || []).concat(createStatusHistoryEntry(updates.status));
      }
      applications[i] = next;
      break;
    }
    saveApplications();
  }

  function deleteApplication(id) {
    applications = applications.filter(function (app) { return app.id !== id; });
    saveApplications();
  }

  function getFilteredApplications() {
    var list = statusFilter === 'all' ? applications.slice() : applications.filter(function (app) { return app.status === statusFilter; });
    var getAppliedDate = function (app) {
      var d = (app.statusHistory && app.statusHistory[0] && app.statusHistory[0].date) || app.createdAt;
      return d ? new Date(d).getTime() : 0;
    };
    list.sort(function (a, b) { return getAppliedDate(b) - getAppliedDate(a); });
    return list;
  }

  // --- DOM: populate selects
  function fillSelect(id, options) {
    var el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '';
    options.forEach(function (opt) {
      var option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      el.appendChild(option);
    });
  }

  function fillCompanyDatalist() {
    var list = document.getElementById('company-list');
    if (!list) return;
    list.innerHTML = '';
    companies.forEach(function (c) {
      var option = document.createElement('option');
      option.value = c;
      list.appendChild(option);
    });
  }

  function getResumeVersions() {
    var set = {};
    applications.forEach(function (app) {
      var v = (app.resumeVersion || '').trim();
      if (v) set[v] = true;
    });
    return Object.keys(set).sort();
  }

  function getCoverLetterValues() {
    var set = {};
    applications.forEach(function (app) {
      var v = (app.coverLetterUsed || '').trim();
      if (v) set[v] = true;
    });
    return Object.keys(set).sort();
  }

  function fillResumeVersionDatalist() {
    var list = document.getElementById('resumeVersion-list');
    if (!list) return;
    list.innerHTML = '';
    getResumeVersions().forEach(function (v) {
      var option = document.createElement('option');
      option.value = v;
      list.appendChild(option);
    });
  }

  function fillCoverLetterDatalist() {
    var list = document.getElementById('coverLetterUsed-list');
    if (!list) return;
    list.innerHTML = '';
    getCoverLetterValues().forEach(function (v) {
      var option = document.createElement('option');
      option.value = v;
      list.appendChild(option);
    });
  }

  // --- DOM: filter bar
  function renderFilterBar() {
    var bar = document.getElementById('filter-bar');
    if (!bar) return;
    bar.innerHTML = '';
    STATUS_OPTIONS_WITH_ALL.forEach(function (opt) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = opt.label;
      if (statusFilter === opt.value) btn.className = 'active';
      btn.addEventListener('click', function () {
        statusFilter = opt.value;
        renderFilterBar();
        renderList();
      });
      bar.appendChild(btn);
    });
  }

  // --- DOM: application list
  function renderApplicationItem(app) {
    var li = document.createElement('li');
    li.className = 'application-item';
    li.dataset.id = app.id;

    if (editingId === app.id) {
      li.classList.add('editing');
      li.appendChild(renderEditForm(app));
      return li;
    }

    var meta = document.createElement('div');
    meta.className = 'meta';
    var strong = document.createElement('strong');
    strong.textContent = app.company;
    meta.appendChild(strong);
    if (app.position) {
      var pos = document.createElement('span');
      pos.className = 'position';
      pos.textContent = app.position;
      meta.appendChild(pos);
    }
    if (app.scope) {
      var scope = document.createElement('span');
      scope.className = 'scope';
      scope.textContent = 'Scope: ' + app.scope;
      meta.appendChild(scope);
    }
    if (app.jobId) {
      var jobId = document.createElement('span');
      jobId.className = 'job-id';
      jobId.textContent = 'Job ID: ' + app.jobId;
      meta.appendChild(jobId);
    }
    var history = app.statusHistory || [];
    if (history.length) {
      var histDiv = document.createElement('div');
      histDiv.className = 'status-history';
      history.forEach(function (entry) {
        var span = document.createElement('span');
        span.className = 'status-date';
        span.textContent = (getStatusLabel(entry.status) || entry.status) + ': ' + formatDate(entry.date);
        histDiv.appendChild(span);
      });
      meta.appendChild(histDiv);
    }
    var tags = document.createElement('div');
    tags.className = 'tags';
    tags.appendChild(makeTag(getSourceLabel(app.sourceId), 'source'));
    if (app.atsSystem) tags.appendChild(makeTag(getAtsLabel(app.atsSystem), 'ats'));
    if (app.originalListingDate) tags.appendChild(makeTag('Listed: ' + formatDate(app.originalListingDate)));
    if (app.originalPostingUrl) {
      var link = document.createElement('a');
      link.href = app.originalPostingUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'tag link';
      link.textContent = 'Posting';
      tags.appendChild(link);
    }
    if (app.endedAt) tags.appendChild(makeTag('Ended: ' + formatDate(app.endedAt), 'ended'));
    if (app.resumeVersion) tags.appendChild(makeTag('Resume: ' + app.resumeVersion));
    if (app.coverLetterUsed) tags.appendChild(makeTag('CL: ' + app.coverLetterUsed));
    if (app.customCoverLetter) tags.appendChild(makeTag('Custom CL'));
    if (app.customResume) tags.appendChild(makeTag('Custom resume'));
    meta.appendChild(tags);
    li.appendChild(meta);

    var itemActions = document.createElement('div');
    itemActions.className = 'item-actions';
    var badge = document.createElement('span');
    badge.className = 'status-badge status-' + app.status;
    badge.textContent = getStatusLabel(app.status);
    itemActions.appendChild(badge);
    var actions = document.createElement('div');
    actions.className = 'actions';
    var editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', function () {
      editingId = app.id;
      renderList();
    });
    var delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', function () {
      if (window.confirm('Delete this application?')) {
        deleteApplication(app.id);
        editingId = null;
        renderList();
        fillCompanyDatalist();
        fillResumeVersionDatalist();
        fillCoverLetterDatalist();
      }
    });
    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    itemActions.appendChild(actions);
    li.appendChild(itemActions);

    return li;
  }

  function makeTag(text, className) {
    var span = document.createElement('span');
    span.className = 'tag' + (className ? ' ' + className : '');
    span.textContent = text;
    return span;
  }

  function renderEditForm(app) {
    var wrap = document.createElement('div');
    wrap.className = 'edit-fields';

    var fields = [
      { id: 'edit-company', label: 'Company', value: app.company, type: 'text' },
      { id: 'edit-position', label: 'Position', value: app.position || '', type: 'text' },
      { id: 'edit-scope', label: 'Scope', value: app.scope || '', type: 'text' },
      { id: 'edit-jobId', label: 'Job ID', value: app.jobId || '', type: 'text' },
    ];
    fields.forEach(function (f) {
      var g = document.createElement('div');
      g.className = 'form-group';
      var label = document.createElement('label');
      label.textContent = f.label;
      var input = document.createElement('input');
      input.id = f.id;
      input.type = f.type;
      input.value = f.value;
      g.appendChild(label);
      g.appendChild(input);
      wrap.appendChild(g);
    });

    var row1 = document.createElement('div');
    row1.className = 'form-row';
    var statusGroup = document.createElement('div');
    statusGroup.className = 'form-group';
    statusGroup.innerHTML = '<label>Status</label>';
    var statusSelect = document.createElement('select');
    statusSelect.id = 'edit-status';
    STATUS_OPTIONS.forEach(function (opt) {
      var o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      if (opt.value === app.status) o.selected = true;
      statusSelect.appendChild(o);
    });
    statusGroup.appendChild(statusSelect);
    var sourceGroup = document.createElement('div');
    sourceGroup.className = 'form-group';
    sourceGroup.innerHTML = '<label>Source</label>';
    var sourceSelect = document.createElement('select');
    sourceSelect.id = 'edit-sourceId';
    SOURCE_OPTIONS.forEach(function (opt) {
      var o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      if (opt.value === (app.sourceId || 'linkedin')) o.selected = true;
      sourceSelect.appendChild(o);
    });
    sourceGroup.appendChild(sourceSelect);
    row1.appendChild(statusGroup);
    row1.appendChild(sourceGroup);
    wrap.appendChild(row1);

    var row2 = document.createElement('div');
    row2.className = 'form-row';
    var dateGroup = document.createElement('div');
    dateGroup.className = 'form-group';
    dateGroup.innerHTML = '<label>Original listing date</label>';
    var dateInput = document.createElement('input');
    dateInput.id = 'edit-originalListingDate';
    dateInput.type = 'date';
    dateInput.value = app.originalListingDate || '';
    dateGroup.appendChild(dateInput);
    var endedGroup = document.createElement('div');
    endedGroup.className = 'form-group';
    endedGroup.innerHTML = '<label>End date</label>';
    var endedInput = document.createElement('input');
    endedInput.id = 'edit-endedAt';
    endedInput.type = 'date';
    endedInput.placeholder = 'e.g. when you were notified (not hired, etc.)';
    endedInput.value = app.endedAt ? app.endedAt.slice(0, 10) : '';
    endedGroup.appendChild(endedInput);
    row2.appendChild(dateGroup);
    row2.appendChild(endedGroup);
    wrap.appendChild(row2);
    var urlGroup = document.createElement('div');
    urlGroup.className = 'form-group';
    urlGroup.innerHTML = '<label>Original posting URL</label>';
    var urlInput = document.createElement('input');
    urlInput.id = 'edit-originalPostingUrl';
    urlInput.type = 'url';
    urlInput.placeholder = 'https://...';
    urlInput.value = app.originalPostingUrl || '';
    urlGroup.appendChild(urlInput);
    wrap.appendChild(urlGroup);
    var atsGroup = document.createElement('div');
    atsGroup.className = 'form-group';
    atsGroup.innerHTML = '<label>ATS</label>';
    var atsSelect = document.createElement('select');
    atsSelect.id = 'edit-atsSystem';
    ATS_OPTIONS.forEach(function (opt) {
      var o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      if (opt.value === (app.atsSystem || '')) o.selected = true;
      atsSelect.appendChild(o);
    });
    atsGroup.appendChild(atsSelect);
    wrap.appendChild(atsGroup);

    var resumeGroup = document.createElement('div');
    resumeGroup.className = 'form-group';
    resumeGroup.innerHTML = '<label>Resume version</label>';
    var resumeInput = document.createElement('input');
    resumeInput.id = 'edit-resumeVersion';
    resumeInput.setAttribute('list', 'edit-resumeVersion-list');
    resumeInput.value = app.resumeVersion || '';
    var resumeDatalist = document.createElement('datalist');
    resumeDatalist.id = 'edit-resumeVersion-list';
    getResumeVersions().forEach(function (v) {
      var o = document.createElement('option');
      o.value = v;
      resumeDatalist.appendChild(o);
    });
    resumeGroup.appendChild(resumeInput);
    resumeGroup.appendChild(resumeDatalist);
    wrap.appendChild(resumeGroup);

    var clGroup = document.createElement('div');
    clGroup.className = 'form-group';
    clGroup.innerHTML = '<label>Cover letter used</label>';
    var clInput = document.createElement('input');
    clInput.id = 'edit-coverLetterUsed';
    clInput.setAttribute('list', 'edit-coverLetterUsed-list');
    clInput.value = app.coverLetterUsed || '';
    var clDatalist = document.createElement('datalist');
    clDatalist.id = 'edit-coverLetterUsed-list';
    getCoverLetterValues().forEach(function (v) {
      var o = document.createElement('option');
      o.value = v;
      clDatalist.appendChild(o);
    });
    clGroup.appendChild(clInput);
    clGroup.appendChild(clDatalist);
    wrap.appendChild(clGroup);

    var checkGroup = document.createElement('div');
    checkGroup.className = 'form-group checkboxes';
    var customCL = document.createElement('label');
    customCL.className = 'checkbox-label';
    var clCheck = document.createElement('input');
    clCheck.type = 'checkbox';
    clCheck.id = 'edit-customCoverLetter';
    clCheck.checked = !!app.customCoverLetter;
    customCL.appendChild(clCheck);
    customCL.appendChild(document.createTextNode(' Custom cover letter'));
    var customRes = document.createElement('label');
    customRes.className = 'checkbox-label';
    var resCheck = document.createElement('input');
    resCheck.type = 'checkbox';
    resCheck.id = 'edit-customResume';
    resCheck.checked = !!app.customResume;
    customRes.appendChild(resCheck);
    customRes.appendChild(document.createTextNode(' Custom resume'));
    checkGroup.appendChild(customCL);
    checkGroup.appendChild(customRes);
    wrap.appendChild(checkGroup);

    var actions = document.createElement('div');
    actions.className = 'actions';
    var saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'primary';
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', function () {
      updateApplication(app.id, {
        company: document.getElementById('edit-company').value.trim(),
        position: document.getElementById('edit-position').value.trim(),
        scope: document.getElementById('edit-scope').value.trim(),
        jobId: document.getElementById('edit-jobId').value.trim(),
        status: document.getElementById('edit-status').value,
        sourceId: document.getElementById('edit-sourceId').value,
        originalListingDate: document.getElementById('edit-originalListingDate').value.trim() || undefined,
        originalPostingUrl: document.getElementById('edit-originalPostingUrl').value.trim() || undefined,
        endedAt: document.getElementById('edit-endedAt').value.trim() || undefined,
        atsSystem: document.getElementById('edit-atsSystem').value.trim(),
        resumeVersion: document.getElementById('edit-resumeVersion').value.trim(),
        coverLetterUsed: document.getElementById('edit-coverLetterUsed').value.trim(),
        customCoverLetter: document.getElementById('edit-customCoverLetter').checked,
        customResume: document.getElementById('edit-customResume').checked,
      });
      editingId = null;
      renderList();
      fillCompanyDatalist();
      fillResumeVersionDatalist();
      fillCoverLetterDatalist();
    });
    var cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', function () {
      editingId = null;
      renderList();
    });
    actions.appendChild(saveBtn);
    actions.appendChild(cancelBtn);
    wrap.appendChild(actions);

    return wrap;
  }

  function renderList() {
    var listEl = document.getElementById('applications-list');
    if (!listEl) return;
    var filtered = getFilteredApplications();
    listEl.innerHTML = '';
    if (filtered.length === 0) {
      var empty = document.createElement('li');
      empty.className = 'empty-state';
      empty.textContent = 'No applications yet. Add one above to get started.';
      listEl.appendChild(empty);
      return;
    }
    filtered.forEach(function (app) {
      listEl.appendChild(renderApplicationItem(app));
    });
  }

  // --- Form submit
  function initForm() {
    fillSelect('status', STATUS_OPTIONS);
    fillSelect('sourceId', SOURCE_OPTIONS);
    fillSelect('atsSystem', ATS_OPTIONS);
    fillCompanyDatalist();
    fillResumeVersionDatalist();
    fillCoverLetterDatalist();

    var form = document.getElementById('add-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var company = (form.company && form.company.value || '').trim();
      if (!company) return;
      addApplication({
        company: company,
        position: (form.position && form.position.value || '').trim(),
        scope: (form.scope && form.scope.value || '').trim(),
        jobId: (form.jobId && form.jobId.value || '').trim(),
        status: (form.status && form.status.value) || 'to_apply',
        sourceId: (form.sourceId && form.sourceId.value) || 'linkedin',
        originalListingDate: (form.originalListingDate && form.originalListingDate.value || '').trim() || undefined,
        originalPostingUrl: (form.originalPostingUrl && form.originalPostingUrl.value || '').trim() || undefined,
        endedAt: (form.endedAt && form.endedAt.value || '').trim() || undefined,
        atsSystem: (form.atsSystem && form.atsSystem.value || '').trim(),
        resumeVersion: (form.resumeVersion && form.resumeVersion.value || '').trim(),
        coverLetterUsed: (form.coverLetterUsed && form.coverLetterUsed.value || '').trim(),
        customCoverLetter: !!(form.customCoverLetter && form.customCoverLetter.checked),
        customResume: !!(form.customResume && form.customResume.checked),
      });
      form.reset();
      form.status.value = 'to_apply';
      form.sourceId.value = 'linkedin';
      form.atsSystem.value = '';
      fillCompanyDatalist();
      fillResumeVersionDatalist();
      fillCoverLetterDatalist();
      renderList();
      renderCompaniesList();
      switchToTab('list');
    });
  }

  function importBackfillJson(rows) {
    if (!Array.isArray(rows)) return 0;
    var existingKeys = {};
    applications.forEach(function (app) {
      var date = (app.statusHistory && app.statusHistory[0] && app.statusHistory[0].date) ? app.statusHistory[0].date.slice(0, 10) : (app.createdAt || '').slice(0, 10);
      var k = (app.company || '') + '|' + (app.position || '') + '|' + date;
      existingKeys[k] = true;
    });
    var added = 0;
    rows.forEach(function (row) {
      var company = (row.company || '').trim();
      var position = (row.position || row.role || '').trim();
      var appliedDate = row.appliedDate || row.createdAt || '';
      if (!company && !position) return;
      var key = company + '|' + position + '|' + appliedDate;
      if (existingKeys[key]) return;
      existingKeys[key] = true;
      var status = row.status === 'not_hired' ? 'not_hired' : 'applied';
      var statusHistory = Array.isArray(row.statusHistory) && row.statusHistory.length
        ? row.statusHistory
        : [{ status: status, date: (appliedDate ? appliedDate + (appliedDate.length === 10 ? 'T12:00:00.000Z' : '') : new Date().toISOString()) }];
      if (statusHistory[0].date && statusHistory[0].date.length === 10) statusHistory[0].date += 'T12:00:00.000Z';
      applications.unshift({
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        company: company,
        position: position,
        scope: (row.scope || '').trim(),
        jobId: (row.jobId || '').trim(),
        status: status,
        statusHistory: statusHistory,
        sourceId: row.sourceId || 'linkedin',
        originalListingDate: (row.originalListingDate || '').trim() || undefined,
        originalPostingUrl: (row.originalPostingUrl || '').trim() || undefined,
        atsSystem: (row.atsSystem || '').trim(),
        resumeVersion: (row.resumeVersion || '').trim(),
        coverLetterUsed: (row.coverLetterUsed || '').trim(),
        customCoverLetter: !!row.customCoverLetter,
        customResume: !!row.customResume,
        createdAt: row.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      ensureCompany(company);
      added++;
    });
    saveApplications();
    saveJson(STORAGE_COMPANIES, companies);
    return added;
  }

  function initImport() {
    var input = document.getElementById('import-file');
    if (!input) return;
    input.addEventListener('change', function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          var count = importBackfillJson(data);
          alert('Imported ' + count + ' application(s).');
          fillCompanyDatalist();
          fillResumeVersionDatalist();
          fillCoverLetterDatalist();
          renderList();
          renderCompaniesList();
        } catch (err) {
          alert('Invalid JSON: ' + err.message);
        }
        input.value = '';
      };
      reader.readAsText(file);
    });
  }

  function renderCompaniesList() {
    var listEl = document.getElementById('companies-list');
    if (!listEl) return;
    var sorted = companies.slice().sort(function (a, b) { return a.localeCompare(b, undefined, { sensitivity: 'base' }); });
    listEl.innerHTML = '';
    if (sorted.length === 0) {
      var empty = document.createElement('li');
      empty.className = 'empty-state';
      empty.textContent = 'No companies yet. Add an application to build the list.';
      listEl.appendChild(empty);
      return;
    }
    sorted.forEach(function (name) {
      var li = document.createElement('li');
      li.className = 'company-item';
      li.textContent = name;
      listEl.appendChild(li);
    });
  }

  function switchToTab(tabId) {
    var listTab = document.querySelector('.tabs [data-tab="list"]');
    var addTab = document.querySelector('.tabs [data-tab="add"]');
    var companiesTab = document.querySelector('.tabs [data-tab="companies"]');
    var listPanel = document.getElementById('tab-list');
    var addPanel = document.getElementById('tab-add');
    var companiesPanel = document.getElementById('tab-companies');
    var tabs = [listTab, addTab, companiesTab];
    var panels = [listPanel, addPanel, companiesPanel];
    tabs.forEach(function (t) { if (t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); } });
    panels.forEach(function (p) { if (p) p.classList.remove('active'); });
    if (tabId === 'list' && listTab && listPanel) {
      listTab.classList.add('active'); listTab.setAttribute('aria-selected', 'true');
      listPanel.classList.add('active');
    } else if (tabId === 'add' && addTab && addPanel) {
      addTab.classList.add('active'); addTab.setAttribute('aria-selected', 'true');
      addPanel.classList.add('active');
    } else if (tabId === 'companies' && companiesTab && companiesPanel) {
      companiesTab.classList.add('active'); companiesTab.setAttribute('aria-selected', 'true');
      companiesPanel.classList.add('active');
      renderCompaniesList();
    }
  }

  function initTabs() {
    var listBtn = document.getElementById('tab-btn-list');
    var addBtn = document.getElementById('tab-btn-add');
    var companiesBtn = document.getElementById('tab-btn-companies');
    if (listBtn) listBtn.addEventListener('click', function () { switchToTab('list'); });
    if (addBtn) addBtn.addEventListener('click', function () { switchToTab('add'); });
    if (companiesBtn) companiesBtn.addEventListener('click', function () { switchToTab('companies'); });
  }

  // --- Init
  initForm();
  initImport();
  initTabs();
  renderFilterBar();
  renderList();
})();
