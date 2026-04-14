import { supabase } from './supabase.js';
import { requireRole, signOutUser } from './auth.js';

const clinicTitle = document.getElementById('clinicTitle');
const clinicWelcome = document.getElementById('clinicWelcome');
const logoutBtn = document.getElementById('logoutBtn');
const printReportBtn = document.getElementById('printReportBtn');

const patientForm = document.getElementById('patientForm');
const patientMsg = document.getElementById('patientMsg');
const patientSearch = document.getElementById('patientSearch');
const refreshPatientsBtn = document.getElementById('refreshPatientsBtn');
const patientList = document.getElementById('patientList');
const selectedPatientSummary = document.getElementById('selectedPatientSummary');

const examForm = document.getElementById('examForm');
const examMsg = document.getElementById('examMsg');
const examList = document.getElementById('examList');
const reportPreview = document.getElementById('reportPreview');

const examTypeEl = document.getElementById('examType');
const examDateEl = document.getElementById('examDate');
const gaTextEl = document.getElementById('gaText');
const fhrEl = document.getElementById('fhr');
const findingsJsonEl = document.getElementById('findingsJson');
const impressionEl = document.getElementById('impression');
const reportHtmlEl = document.getElementById('reportHtml');

const ntModule = document.getElementById('ntModule');
const level2Module = document.getElementById('level2Module');

let sessionData = null;
let selectedPatient = null;
let patientsCache = [];
let examsCache = [];

logoutBtn?.addEventListener('click', async () => {
  await signOutUser();
  window.location.href = './login.html';
});

printReportBtn?.addEventListener('click', () => {
  if (!reportPreview || reportPreview.textContent.includes('No preview yet')) {
    alert('No report available to print.');
    return;
  }
  window.print();
});

refreshPatientsBtn?.addEventListener('click', loadPatients);
patientSearch?.addEventListener('input', renderPatients);
examTypeEl?.addEventListener('change', handleExamTypeChange);

patientForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!sessionData?.profile?.center_id) {
    patientMsg.textContent = 'Center mapping missing.';
    return;
  }

  const payload = {
    center_id: sessionData.profile.center_id,
    patient_uid: document.getElementById('patientUid')?.value.trim() || null,
    patient_name: document.getElementById('patientName')?.value.trim() || null,
    age: document.getElementById('patientAge')?.value.trim() || null,
    sex: document.getElementById('patientSex')?.value.trim() || null,
    phone: document.getElementById('patientPhone')?.value.trim() || null,
    referred_by: document.getElementById('referredBy')?.value.trim() || null,
    created_by: sessionData.user.id,
  };

  if (!payload.patient_name) {
    patientMsg.textContent = 'Patient name is required.';
    return;
  }

  patientMsg.textContent = 'Saving patient...';
  const { error } = await supabase.from('patients').insert([payload]);

  if (error) {
    patientMsg.textContent = error.message;
    return;
  }

  patientMsg.textContent = 'Patient added successfully.';
  patientForm.reset();
  await loadPatients();
});

examForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!selectedPatient) {
    examMsg.textContent = 'Select a patient first.';
    return;
  }

  const examType = examTypeEl?.value || '';
  if (!examType) {
    examMsg.textContent = 'Select an exam type.';
    return;
  }

  const findings = buildFindings(examType);
 function buildImpression(examType, findings) {
  if (examType === 'NT Scan') {
    const out = [];
    if (findings.crl_mm !== '-') out.push(`CRL measures ${findings.crl_mm} mm.`);
    if (findings.nt_mm !== '-') out.push(`NT measures ${findings.nt_mm} mm.`);
    if (findings.nasal_bone !== '-') out.push(`Nasal bone is ${findings.nasal_bone}.`);
    if (findings.ductus_venosus !== '-') out.push(`Ductus venosus flow is ${findings.ductus_venosus}.`);
    if (findings.tricuspid_flow !== '-') out.push(`Tricuspid flow is ${findings.tricuspid_flow}.`);
    if (findings.soft_markers !== 'none' && findings.soft_markers !== '-') out.push('Soft markers are present.');
    if (findings.nt_notes !== '-') out.push(findings.nt_notes);
    return out.join(' ') || 'NT scan findings recorded.';
  }

  if (examType === 'Level II Scan') {
    const normalOrgans = [];
    const abnormalOrgans = [];

    const organMap = [
      ['brain', 'brain'],
      ['face', 'face'],
      ['spine', 'spine'],
      ['heart', 'heart'],
      ['abdomen', 'abdomen'],
      ['limbs', 'limbs'],
    ];

    organMap.forEach(([key, label]) => {
      if (findings[key] === 'normal') normalOrgans.push(label);
      if (findings[key] === 'abnormal') abnormalOrgans.push(label);
    });

    const intro = [];
    const structural = [];
    const conclusion = [];

    if (findings.fetal_lie !== '-') intro.push(`Single live intrauterine fetus in ${findings.fetal_lie} presentation.`);
    if (findings.ga && findings.ga !== '-') intro.push(`Gestational age by entered data is ${findings.ga}.`);

    const biometry = [
      findings.bpd !== '-' ? `BPD ${findings.bpd}` : null,
      findings.hc !== '-' ? `HC ${findings.hc}` : null,
      findings.ac !== '-' ? `AC ${findings.ac}` : null,
      findings.fl !== '-' ? `FL ${findings.fl}` : null,
    ].filter(Boolean);

    if (biometry.length) {
      intro.push(`Recorded biometric parameters are ${biometry.join(', ')}.`);
    }

    if (findings.placenta !== '-') {
      structural.push(`Placenta is ${findings.placenta}.`);
    }

    if (findings.liquor !== '-') {
      structural.push(`Liquor appears ${findings.liquor}.`);
    }

    if (findings.cervix !== '-') {
      structural.push(`Cervix is ${findings.cervix}.`);
    }

    if (findings.fhr !== '-' && findings.fhr) {
      structural.push(`Fetal heart rate is ${findings.fhr} bpm.`);
    }

    if (abnormalOrgans.length === 0 && normalOrgans.length > 0) {
      structural.push(`Detailed anomaly survey of the ${normalOrgans.join(', ')} appears unremarkable on the entered parameters.`);
    }

    if (abnormalOrgans.length > 0) {
      structural.push(`Abnormality / suspicious finding is noted in the ${abnormalOrgans.join(', ')} on the entered parameters.`);
    }

    if (findings.soft_markers === 'present') {
      conclusion.push('Soft marker(s) are present.');
    }

    if (findings.major_anomaly === 'present') {
      conclusion.push('Major structural anomaly is suspected / present.');
    }

    if (abnormalOrgans.length === 0 && findings.major_anomaly !== 'present') {
      conclusion.push('No major structural abnormality is detected on the entered Level II scan parameters.');
    } else {
      conclusion.push('Further fetal medicine correlation and targeted evaluation are advised.');
    }

    if (findings.notes !== '-') {
      conclusion.push(findings.notes);
    }

    return [...intro, ...structural, ...conclusion].join(' ');
  }

  return impressionEl?.value.trim() || '';
}

  const payload = {
    center_id: sessionData.profile.center_id,
    patient_id: selectedPatient.id,
    exam_type: examType,
    exam_date: examDateEl?.value || null,
    status: 'draft',
    findings,
    impression,
    report_html: previewHtml,
    created_by: sessionData.user.id,
    updated_by: sessionData.user.id,
  };

  examMsg.textContent = 'Saving examination...';
  const { error } = await supabase.from('examinations').insert([payload]);

  if (error) {
    examMsg.textContent = error.message;
    return;
  }

  examMsg.textContent = 'Examination saved successfully.';
  reportPreview.innerHTML = previewHtml;
  await loadExaminations();
});

function handleExamTypeChange() {
  const current = examTypeEl?.value || '';
  const isNt = current === 'NT Scan';
  const isLevel2 = current === 'Level II Scan';

  if (ntModule) ntModule.style.display = isNt ? 'block' : 'none';
  if (level2Module) level2Module.style.display = isLevel2 ? 'block' : 'none';
  if (findingsJsonEl) findingsJsonEl.style.display = isNt || isLevel2 ? 'none' : 'block';

  livePreview();
}

[
  'gaText','fhr','ntCrl','ntValue','nasalBone','dvFlow','trFlow','softMarkers','ntNotes',
  'l2FetalLie','l2Placenta','l2Liquor','l2Cervix','l2Bpd','l2Hc','l2Ac','l2Fl',
  'l2Brain','l2Face','l2Spine','l2Heart','l2Abdomen','l2Limbs','l2SoftMarkers','l2MajorAnomaly','l2Notes'
].forEach((id) => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', livePreview);
    el.addEventListener('change', livePreview);
  }
});

function buildFindings(examType) {
  if (examType === 'NT Scan') {
    return {
      crl_mm: valueOf('ntCrl'),
      nt_mm: valueOf('ntValue'),
      nasal_bone: valueOf('nasalBone'),
      ductus_venosus: valueOf('dvFlow'),
      tricuspid_flow: valueOf('trFlow'),
      soft_markers: valueOf('softMarkers', 'none'),
      nt_notes: valueOf('ntNotes'),
      ga: valueOf('gaText'),
      fhr: valueOf('fhr'),
    };
  }

  if (examType === 'Level II Scan') {
    return {
      fetal_lie: valueOf('l2FetalLie'),
      placenta: valueOf('l2Placenta'),
      liquor: valueOf('l2Liquor'),
      cervix: valueOf('l2Cervix'),
      bpd: valueOf('l2Bpd'),
      hc: valueOf('l2Hc'),
      ac: valueOf('l2Ac'),
      fl: valueOf('l2Fl'),
      brain: valueOf('l2Brain'),
      face: valueOf('l2Face'),
      spine: valueOf('l2Spine'),
      heart: valueOf('l2Heart'),
      abdomen: valueOf('l2Abdomen'),
      limbs: valueOf('l2Limbs'),
      soft_markers: valueOf('l2SoftMarkers', 'none'),
      major_anomaly: valueOf('l2MajorAnomaly', 'none'),
      notes: valueOf('l2Notes'),
      ga: valueOf('gaText'),
      fhr: valueOf('fhr'),
    };
  }

  const raw = findingsJsonEl?.value.trim() || '';
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return { raw_text: raw };
  }
}

function buildImpression(examType, findings) {
  if (examType === 'NT Scan') {
    const out = [];
    if (findings.crl_mm !== '-') out.push(`CRL measures ${findings.crl_mm} mm.`);
    if (findings.nt_mm !== '-') out.push(`NT measures ${findings.nt_mm} mm.`);
    if (findings.nasal_bone !== '-') out.push(`Nasal bone is ${findings.nasal_bone}.`);
    if (findings.ductus_venosus !== '-') out.push(`Ductus venosus flow is ${findings.ductus_venosus}.`);
    if (findings.tricuspid_flow !== '-') out.push(`Tricuspid flow is ${findings.tricuspid_flow}.`);
    if (findings.soft_markers !== 'none' && findings.soft_markers !== '-') out.push('Soft markers are present.');
    if (findings.nt_notes !== '-') out.push(findings.nt_notes);
    return out.join(' ') || 'NT scan findings recorded.';
  }

  if (examType === 'Level II Scan') {
    const out = [];
    if (findings.fetal_lie !== '-') out.push(`Fetal lie is ${findings.fetal_lie}.`);
    if (findings.placenta !== '-') out.push(`Placenta is ${findings.placenta}.`);
    if (findings.liquor !== '-') out.push(`Liquor appears ${findings.liquor}.`);
    if (findings.cervix !== '-') out.push(`Cervix is ${findings.cervix}.`);

    const bio = [
      findings.bpd !== '-' ? `BPD ${findings.bpd}` : null,
      findings.hc !== '-' ? `HC ${findings.hc}` : null,
      findings.ac !== '-' ? `AC ${findings.ac}` : null,
      findings.fl !== '-' ? `FL ${findings.fl}` : null,
    ].filter(Boolean);

    if (bio.length) out.push(`Biometry: ${bio.join(', ')}.`);

    ['brain','face','spine','heart','abdomen','limbs'].forEach((k) => {
      if (findings[k] !== '-') out.push(`${labelize(k)} appears ${findings[k]}.`);
    });

    if (findings.soft_markers === 'present') out.push('Soft marker(s) are present.');
    if (findings.major_anomaly === 'present') out.push('Major anomaly is present / suspected.');
    if (findings.notes !== '-') out.push(findings.notes);

    if (!out.length) out.push('No major structural abnormality detected on the entered fields.');
    return out.join(' ');
  }

  return impressionEl?.value.trim() || '';
}

function valueOf(id, fallback='-') {
  const el = document.getElementById(id);
  const val = el?.value?.trim?.() ?? el?.value ?? '';
  return val || fallback;
}

function livePreview() {
  if (!selectedPatient) return;
  const examType = examTypeEl?.value || '';
  if (!examType) {
    reportPreview.textContent = 'No preview yet.';
    return;
  }

  const findings = buildFindings(examType);
  const impression = buildImpression(examType, findings);
  if (impressionEl) impressionEl.value = impression;

  reportPreview.innerHTML = buildPreview({
    patient: selectedPatient,
    examType,
    examDate: examDateEl?.value || null,
    findings,
    impression,
  });
}

function renderPatients() {
  const q = patientSearch?.value.trim().toLowerCase() || '';
  const rows = q
    ? patientsCache.filter((row) => [row.patient_name, row.patient_uid, row.phone, row.age, row.sex].filter(Boolean).join(' ').toLowerCase().includes(q))
    : patientsCache;

  if (!rows.length) {
    patientList.innerHTML = '<div class="muted-box">No patients found.</div>';
    return;
  }

  patientList.innerHTML = rows.map((row) => `
    <button class="patient-row ${selectedPatient?.id === row.id ? 'patient-row-active' : ''}" data-id="${row.id}" type="button">
      <strong>${escapeHtml(row.patient_name || '-')}</strong>
      <span>${escapeHtml(row.patient_uid || '-')}</span>
      <span>${escapeHtml(row.age || '-')} · ${escapeHtml(row.sex || '-')}</span>
      <span>${escapeHtml(row.phone || '-')}</span>
    </button>
  `).join('');

  patientList.querySelectorAll('[data-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const found = patientsCache.find((x) => x.id === btn.getAttribute('data-id'));
      if (!found) return;
      selectedPatient = found;
      renderSelectedPatient();
      renderPatients();
      livePreview();
      loadExaminations();
    });
  });
}

function renderSelectedPatient() {
  if (!selectedPatient) {
    selectedPatientSummary.textContent = 'Select a patient from the registry.';
    return;
  }

  selectedPatientSummary.innerHTML = `
    <div><strong>${escapeHtml(selectedPatient.patient_name || '-')}</strong></div>
    <div>Patient ID: ${escapeHtml(selectedPatient.patient_uid || '-')}</div>
    <div>Age / Sex: ${escapeHtml(selectedPatient.age || '-')} / ${escapeHtml(selectedPatient.sex || '-')}</div>
    <div>Phone: ${escapeHtml(selectedPatient.phone || '-')}</div>
    <div>Referred by: ${escapeHtml(selectedPatient.referred_by || '-')}</div>
  `;
}

async function loadPatients() {
  const { data, error } = await supabase
    .from('patients')
    .select('id, patient_uid, patient_name, age, sex, phone, referred_by, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    patientList.textContent = error.message;
    return;
  }

  patientsCache = data || [];
  renderPatients();
}

async function loadExaminations() {
  if (!selectedPatient) {
    examList.innerHTML = '<div class="muted-box">Select a patient to view examinations.</div>';
    return;
  }

  const { data, error } = await supabase
    .from('examinations')
    .select('id, exam_type, exam_date, status, impression, report_html, created_at')
    .eq('patient_id', selectedPatient.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    examList.textContent = error.message;
    return;
  }

  examsCache = data || [];
  if (!examsCache.length) {
    examList.innerHTML = '<div class="muted-box">No examinations yet for this patient.</div>';
    return;
  }

  examList.innerHTML = examsCache.map((row) => `
    <button class="exam-row" data-exam-id="${row.id}" type="button">
      <strong>${escapeHtml(row.exam_type || '-')}</strong>
      <span>${escapeHtml(row.exam_date || '-')}</span>
      <span>${escapeHtml(row.status || '-')}</span>
    </button>
  `).join('');

  examList.querySelectorAll('[data-exam-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const found = examsCache.find((x) => x.id === btn.getAttribute('data-exam-id'));
      if (!found) return;
      reportPreview.innerHTML = found.report_html || 'No preview yet.';
    });
  });
}

function buildPreview({ patient, examType, examDate, findings, impression }) {
  const centerName = sessionData?.center?.name || 'Clinic';
  const centerCode = sessionData?.center?.code || '-';
  const consultantName = sessionData?.profile?.full_name || 'Consultant';

  let rows = [];
  if (examType === 'Level II Scan') {
    rows = [
      ['Fetal Lie', findings.fetal_lie],
      ['Placenta', findings.placenta],
      ['Liquor', findings.liquor],
      ['Cervix', findings.cervix],
      ['BPD', findings.bpd],
      ['HC', findings.hc],
      ['AC', findings.ac],
      ['FL', findings.fl],
      ['Brain', findings.brain],
      ['Face', findings.face],
      ['Spine', findings.spine],
      ['Heart', findings.heart],
      ['Abdomen', findings.abdomen],
      ['Limbs', findings.limbs],
      ['Soft Markers', findings.soft_markers],
      ['Major Anomaly', findings.major_anomaly],
      ['Notes', findings.notes],
      ['GA', findings.ga],
      ['FHR', findings.fhr],
    ];
  } else if (examType === 'NT Scan') {
    rows = [
      ['CRL (mm)', findings.crl_mm],
      ['NT (mm)', findings.nt_mm],
      ['Nasal Bone', findings.nasal_bone],
      ['Ductus Venosus', findings.ductus_venosus],
      ['Tricuspid Flow', findings.tricuspid_flow],
      ['Soft Markers', findings.soft_markers],
      ['Notes', findings.nt_notes],
      ['GA', findings.ga],
      ['FHR', findings.fhr],
    ];
  } else {
    rows = Object.entries(findings || {}).map(([k, v]) => [labelize(k), v]);
  }

  const rowHtml = rows.map(([label, value]) => `<tr><td>${escapeHtml(String(label))}</td><td>${escapeHtml(String(value || '-'))}</td></tr>`).join('');

  return `
    <div class="report-sheet branded-report-sheet">
      <div class="report-brand-header">
        <div>
          <h2 class="report-center-name">${escapeHtml(centerName)}</h2>
          <div class="report-center-sub">Fetal Imaging · Obstetric Ultrasound · Structured Report</div>
        </div>
        <div class="report-center-meta">
          <div><strong>Center Code:</strong> ${escapeHtml(centerCode)}</div>
          <div><strong>Report Type:</strong> ${escapeHtml(examType || '-')}</div>
          <div><strong>Date:</strong> ${escapeHtml(examDate || '-')}</div>
        </div>
      </div>

      <div class="report-patient-block">
        <div><strong>Patient Name:</strong> ${escapeHtml(patient.patient_name || '-')}</div>
        <div><strong>Patient ID:</strong> ${escapeHtml(patient.patient_uid || '-')}</div>
        <div><strong>Age / Sex:</strong> ${escapeHtml(patient.age || '-')} / ${escapeHtml(patient.sex || '-')}</div>
        <div><strong>Phone:</strong> ${escapeHtml(patient.phone || '-')}</div>
        <div><strong>Referred By:</strong> ${escapeHtml(patient.referred_by || '-')}</div>
      </div>

      <div class="report-section-title">${escapeHtml(examType || 'Examination')} Findings</div>
      <table class="report-table-lite branded-table">
        <thead><tr><th>Parameter</th><th>Value</th></tr></thead>
        <tbody>${rowHtml}</tbody>
      </table>

      <div class="report-section-title">Impression</div>
      <div class="report-impression branded-impression">
        <p>${escapeHtml(impression || '-')}</p>
      </div>

      <div class="report-sign-row">
        <div class="report-note-box">
          <strong>Note:</strong> This is a structured report generated from the entered fields and should be correlated clinically.
        </div>
        <div class="report-sign-box">
          <div class="sign-line"></div>
          <div class="sign-name">${escapeHtml(consultantName)}</div>
          <div class="sign-role">Reporting Consultant</div>
        </div>
      </div>
    </div>
  `;
}

function labelize(key) {
  return String(key).replaceAll('_', ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function boot() {
  sessionData = await requireRole(['center_admin', 'doctor', 'staff']);
  if (!sessionData) return;

  clinicTitle.textContent = sessionData.center?.name || 'Clinic Workspace';
  clinicWelcome.textContent = `Welcome, ${sessionData.profile.full_name || 'User'} (${sessionData.profile.role})`;

  if (examDateEl) examDateEl.value = new Date().toISOString().slice(0, 10);

  await loadPatients();
  renderSelectedPatient();
  await loadExaminations();
  handleExamTypeChange();
}

boot();
