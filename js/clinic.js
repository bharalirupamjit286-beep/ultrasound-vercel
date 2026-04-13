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
const ntRiskSummary = document.getElementById('ntRiskSummary');
const ntRecommendation = document.getElementById('ntRecommendation');

const level2Module = document.getElementById('level2Module');
const l2Summary = document.getElementById('l2Summary');
const l2Recommendation = document.getElementById('l2Recommendation');

let sessionData = null;
let selectedPatient = null;
let patientsCache = [];

logoutBtn?.addEventListener('click', async () => {
  await signOutUser();
  window.location.href = './login.html';
});

printReportBtn?.addEventListener('click', () => {
  if (!reportPreview || !reportPreview.innerHTML || reportPreview.textContent.includes('No preview yet')) {
    alert('No report available to print.');
    return;
  }
  window.print();
});

refreshPatientsBtn?.addEventListener('click', async () => {
  await loadPatients();
});

patientSearch?.addEventListener('input', renderPatients);
examTypeEl?.addEventListener('change', handleExamTypeChange);

[
  'ntCrl',
  'ntValue',
  'nasalBone',
  'dvFlow',
  'trFlow',
  'softMarkers',
  'ntNotes',
  'gaText',
  'fhr',
  'l2FetalLie',
  'l2Placenta',
  'l2Liquor',
  'l2Cervix',
  'l2Bpd',
  'l2Hc',
  'l2Ac',
  'l2Fl',
  'l2Brain',
  'l2Face',
  'l2Spine',
  'l2Heart',
  'l2Abdomen',
  'l2Limbs',
  'l2SoftMarkers',
  'l2MajorAnomaly',
  'l2Notes',
].forEach((id) => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', liveExamPreview);
    el.addEventListener('change', liveExamPreview);
  }
});

patientForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!sessionData?.profile?.center_id) {
    patientMsg.textContent = 'Center mapping missing.';
    return;
  }

  patientMsg.textContent = 'Saving patient...';

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

  const currentExamType = examTypeEl?.value || '';
  if (!currentExamType) {
    examMsg.textContent = 'Select an exam type.';
    return;
  }

  examMsg.textContent = 'Saving examination...';

  const examDate = examDateEl?.value || null;
  const gaText = gaTextEl?.value.trim() || '';
  const fhr = fhrEl?.value.trim() || '';
  const customReportHtml = reportHtmlEl?.value.trim() || '';

  let parsedFindings = {};
  let impression = '';

  if (currentExamType === 'NT Scan') {
    parsedFindings = buildNtFindings();
    if (gaText) parsedFindings.ga = gaText;
    if (fhr) parsedFindings.fhr = fhr;
    impression = generateNtImpression(parsedFindings);
  } else if (currentExamType === 'Level II Scan') {
    parsedFindings = getLevel2Data();
    if (gaText) parsedFindings.ga = gaText;
    if (fhr) parsedFindings.fhr = fhr;
    impression = generateLevel2Impression(parsedFindings);
  } else {
    const findingsRaw = findingsJsonEl?.value.trim() || '';
    if (findingsRaw) {
      try {
        parsedFindings = JSON.parse(findingsRaw);
      } catch {
        examMsg.textContent = 'Findings JSON is invalid.';
        return;
      }
    }
    if (gaText) parsedFindings.ga = gaText;
    if (fhr) parsedFindings.fhr = fhr;
    impression = impressionEl?.value.trim() || '';
  }

  if (impressionEl && (currentExamType === 'NT Scan' || currentExamType === 'Level II Scan')) {
    impressionEl.value = impression;
  }

  const previewHtml =
    customReportHtml ||
    buildReportPreviewHtml({
      patient: selectedPatient,
      examType: currentExamType,
      examDate,
      findings: parsedFindings,
      impression,
    });

  const payload = {
    center_id: sessionData.profile.center_id,
    patient_id: selectedPatient.id,
    exam_type: currentExamType,
    exam_date: examDate,
    status: 'draft',
    findings: parsedFindings,
    impression,
    report_html: previewHtml,
    created_by: sessionData.user.id,
    updated_by: sessionData.user.id,
  };

  const { error } = await supabase.from('examinations').insert([payload]);

  if (error) {
    examMsg.textContent = error.message;
    return;
  }

  examMsg.textContent = 'Examination saved successfully.';
  reportPreview.innerHTML = previewHtml;
  examForm.reset();
  resetModuleSummaries();

  if (examDateEl) {
    examDateEl.value = new Date().toISOString().slice(0, 10);
  }

  handleExamTypeChange();
  await loadExaminations();
});

function handleExamTypeChange() {
  const current = examTypeEl?.value || '';
  const isNt = current === 'NT Scan';
  const isLevel2 = current === 'Level II Scan';

  if (ntModule) ntModule.style.display = isNt ? 'block' : 'none';
  if (level2Module) level2Module.style.display = isLevel2 ? 'block' : 'none';

  if (findingsJsonEl) {
    findingsJsonEl.style.display = isNt || isLevel2 ? 'none' : 'block';
  }

  if (!isNt) {
    if (ntRiskSummary) ntRiskSummary.textContent = 'Not calculated';
    if (ntRecommendation) ntRecommendation.textContent = 'Not calculated';
  }

  if (!isLevel2) {
    if (l2Summary) l2Summary.textContent = 'Not calculated';
    if (l2Recommendation) l2Recommendation.textContent = 'Not calculated';
  }

  if (isNt || isLevel2) {
    liveExamPreview();
  }
}

function resetModuleSummaries() {
  if (ntRiskSummary) ntRiskSummary.textContent = 'Not calculated';
  if (ntRecommendation) ntRecommendation.textContent = 'Not calculated';
  if (l2Summary) l2Summary.textContent = 'Not calculated';
  if (l2Recommendation) l2Recommendation.textContent = 'Not calculated';
}

function buildNtFindings() {
  return {
    crl_mm: document.getElementById('ntCrl')?.value.trim() || '-',
    nt_mm: document.getElementById('ntValue')?.value.trim() || '-',
    nasal_bone: document.getElementById('nasalBone')?.value || '-',
    ductus_venosus: document.getElementById('dvFlow')?.value || '-',
    tricuspid_flow: document.getElementById('trFlow')?.value || '-',
    soft_markers: document.getElementById('softMarkers')?.value || 'none',
    nt_notes: document.getElementById('ntNotes')?.value.trim() || '-',
  };
}

function getLevel2Data() {
  return {
    fetalLie: document.getElementById('l2FetalLie')?.value || '-',
    placenta: document.getElementById('l2Placenta')?.value || '-',
    liquor: document.getElementById('l2Liquor')?.value || '-',
    cervix: document.getElementById('l2Cervix')?.value || '-',

    bpd: document.getElementById('l2Bpd')?.value || '-',
    hc: document.getElementById('l2Hc')?.value || '-',
    ac: document.getElementById('l2Ac')?.value || '-',
    fl: document.getElementById('l2Fl')?.value || '-',

    brain: document.getElementById('l2Brain')?.value || '-',
    face: document.getElementById('l2Face')?.value || '-',
    spine: document.getElementById('l2Spine')?.value || '-',
    heart: document.getElementById('l2Heart')?.value || '-',
    abdomen: document.getElementById('l2Abdomen')?.value || '-',
    limbs: document.getElementById('l2Limbs')?.value || '-',

    softMarkers: document.getElementById('l2SoftMarkers')?.value || 'none',
    majorAnomaly: document.getElementById('l2MajorAnomaly')?.value || 'none',

    notes: document.getElementById('l2Notes')?.value || '-',
  };
}

function generateNtRisk(findings) {
  const nt = parseFloat(findings.nt_mm || '0');
  const nasalBone = findings.nasal_bone;
  const dv = findings.ductus_venosus;
  const tr = findings.tricuspid_flow;
  const soft = findings.soft_markers;

  let risk = 'Low risk';
  let recommendation = 'Routine first trimester follow-up advised.';

  if (nt >= 3.5 || nasalBone === 'absent' || dv === 'abnormal' || tr === 'regurgitation' || soft === 'present') {
    risk = 'High risk';
    recommendation = 'Further evaluation and correlation with combined screening / fetal medicine opinion advised.';
  } else if (nt >= 2.5 || nasalBone === 'hypoplastic') {
    risk = 'Intermediate risk';
    recommendation = 'Clinical correlation and follow-up screening advised.';
  }

  return { risk, recommendation };
}

function generateNtImpression(findings) {
  const bits = [];

  if (findings.crl_mm && findings.crl_mm !== '-') bits.push(`CRL measures ${findings.crl_mm} mm.`);
  if (findings.nt_mm && findings.nt_mm !== '-') bits.push(`NT measures ${findings.nt_mm} mm.`);
  if (findings.nasal_bone && findings.nasal_bone !== '-') bits.push(`Nasal bone is ${findings.nasal_bone}.`);
  if (findings.ductus_venosus && findings.ductus_venosus !== '-') bits.push(`Ductus venosus flow is ${findings.ductus_venosus}.`);
  if (findings.tricuspid_flow && findings.tricuspid_flow !== '-') bits.push(`Tricuspid flow is ${findings.tricuspid_flow}.`);
  if (findings.soft_markers && findings.soft_markers !== 'none' && findings.soft_markers !== '-') bits.push('Soft markers are present.');
  if (findings.nt_notes && findings.nt_notes !== '-') bits.push(findings.nt_notes);

  const riskInfo = generateNtRisk(findings);
  bits.push(`Overall first trimester screening impression: ${riskInfo.risk}.`);
  bits.push(riskInfo.recommendation);

  return bits.join(' ');
}

function generateLevel2Summary(data) {
  const abnormalOrgans = ['brain', 'face', 'spine', 'heart', 'abdomen', 'limbs'].filter(
    (key) => data[key] === 'abnormal'
  );

  let summary = 'No major structural abnormality detected on the entered fields.';
  let recommendation = 'Routine obstetric follow-up advised.';

  if (data.majorAnomaly === 'present' || abnormalOrgans.length > 0) {
    summary = 'Structural abnormality / suspicious finding detected on Level II screening.';
    recommendation = 'Detailed fetal medicine correlation and targeted evaluation advised.';
  } else if (data.softMarkers === 'present') {
    summary = 'Soft marker(s) noted without major structural anomaly in the entered fields.';
    recommendation = 'Clinical correlation and screening correlation advised.';
  }

  return { summary, recommendation };
}

function generateLevel2Impression(data) {
  const bits = [];

  if (data.fetalLie !== '-') bits.push(`Fetal lie is ${data.fetalLie}.`);
  if (data.placenta !== '-') bits.push(`Placenta is ${data.placenta}.`);
  if (data.liquor !== '-') bits.push(`Liquor appears ${data.liquor}.`);
  if (data.cervix !== '-') bits.push(`Cervix measures / appears ${data.cervix}.`);

  const biometry = [
    data.bpd !== '-' ? `BPD ${data.bpd}` : null,
    data.hc !== '-' ? `HC ${data.hc}` : null,
    data.ac !== '-' ? `AC ${data.ac}` : null,
    data.fl !== '-' ? `FL ${data.fl}` : null,
  ].filter(Boolean);

  if (biometry.length) bits.push(`Biometry: ${biometry.join(', ')}.`);

  [
    ['brain', 'Brain'],
    ['face', 'Face'],
    ['spine', 'Spine'],
    ['heart', 'Heart'],
    ['abdomen', 'Abdomen'],
    ['limbs', 'Limbs'],
  ].forEach(([key, label]) => {
    if (data[key] && data[key] !== '-') bits.push(`${label} appears ${data[key]}.`);
  });

  if (data.softMarkers === 'present') bits.push('Soft marker(s) are present.');
  if (data.majorAnomaly === 'present') bits.push('Major anomaly is present / suspected.');
  if (data.notes && data.notes !== '-') bits.push(data.notes);

  const info = generateLevel2Summary(data);
  bits.push(info.summary);
  bits.push(info.recommendation);

  return bits.join(' ');
}

function liveExamPreview() {
  if (!selectedPatient) return;

  const current = examTypeEl?.value || '';

  if (current === 'NT Scan') {
    const findings = buildNtFindings();
    const impression = generateNtImpression(findings);
    const riskInfo = generateNtRisk(findings);

    if (ntRiskSummary) ntRiskSummary.textContent = riskInfo.risk;
    if (ntRecommendation) ntRecommendation.textContent = riskInfo.recommendation;
    if (impressionEl) impressionEl.value = impression;

    reportPreview.innerHTML = buildReportPreviewHtml({
      patient: selectedPatient,
      examType: 'NT Scan',
      examDate: examDateEl?.value || null,
      findings,
      impression,
    });
  } else if (current === 'Level II Scan') {
    const level2 = getLevel2Data();
    const summaryInfo = generateLevel2Summary(level2);
    const impression = generateLevel2Impression(level2);

    if (l2Summary) l2Summary.textContent = summaryInfo.summary;
    if (l2Recommendation) l2Recommendation.textContent = summaryInfo.recommendation;
    if (impressionEl) impressionEl.value = impression;

    reportPreview.innerHTML = buildReportPreviewHtml({
      patient: selectedPatient,
      examType: 'Level II Scan',
      examDate: examDateEl?.value || null,
      findings: level2,
      impression,
    });
  }
}

function renderPatients() {
  const q = patientSearch?.value.trim().toLowerCase() || '';

  const rows = q
    ? patientsCache.filter((row) => {
        const hay = [row.patient_name, row.patient_uid, row.phone, row.age, row.sex]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      })
    : patientsCache;

  if (!rows.length) {
    patientList.innerHTML = '<div class="muted-box">No patients found.</div>';
    return;
  }

  patientList.innerHTML = rows
    .map(
      (row) => `
    <button class="patient-row ${selectedPatient?.id === row.id ? 'patient-row-active' : ''}" data-id="${row.id}" type="button">
      <strong>${escapeHtml(row.patient_name)}</strong>
      <span>${escapeHtml(row.patient_uid || '-')}</span>
      <span>${escapeHtml(row.age || '-')} · ${escapeHtml(row.sex || '-')}</span>
      <span>${escapeHtml(row.phone || '-')}</span>
    </button>
  `
    )
    .join('');

  patientList.querySelectorAll('[data-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const found = patientsCache.find((x) => x.id === id);
      if (!found) return;

      selectedPatient = found;
      renderSelectedPatient();
      renderPatients();
      handleExamTypeChange();
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
    <div><strong>${escapeHtml(selectedPatient.patient_name)}</strong></div>
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

  if (selectedPatient) {
    selectedPatient = patientsCache.find((x) => x.id === selectedPatient.id) || null;
  }

  renderSelectedPatient();
  renderPatients();
}

async function loadExaminations() {
  if (!selectedPatient) {
    examList.innerHTML = '<div class="muted-box">Select a patient to view examinations.</div>';
    if (examTypeEl?.value !== 'NT Scan' && examTypeEl?.value !== 'Level II Scan') {
      reportPreview.innerHTML = 'No preview yet.';
    }
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

  if (!data || !data.length) {
    examList.innerHTML = '<div class="muted-box">No examinations yet for this patient.</div>';
    if (examTypeEl?.value !== 'NT Scan' && examTypeEl?.value !== 'Level II Scan') {
      reportPreview.innerHTML = 'No preview yet.';
    }
    return;
  }

  examList.innerHTML = data
    .map(
      (row) => `
    <button class="exam-row" data-exam-id="${row.id}" type="button">
      <strong>${escapeHtml(row.exam_type)}</strong>
      <span>${escapeHtml(row.exam_date || '-')}</span>
      <span>${escapeHtml(row.status)}</span>
      <span>${escapeHtml(row.impression || '-')}</span>
    </button>
  `
    )
    .join('');

  examList.querySelectorAll('[data-exam-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const examId = btn.getAttribute('data-exam-id');
      const found = data.find((x) => x.id === examId);
      if (!found) return;

      reportPreview.innerHTML =
        found.report_html || `<div class="muted-box">${escapeHtml(found.impression || 'No preview available.')}</div>`;
    });
  });

  if (examTypeEl?.value !== 'NT Scan' && examTypeEl?.value !== 'Level II Scan') {
    reportPreview.innerHTML =
      data[0].report_html || `<div class="muted-box">${escapeHtml(data[0].impression || 'No preview available.')}</div>`;
  }
}

function buildReportPreviewHtml({ patient, examType, examDate, findings, impression }) {
  const centerName = sessionData.center?.name || 'Clinic';
  const centerCode = sessionData.center?.code || '-';
  const consultantName = sessionData.profile.full_name || 'Consultant';
  const reportDate = examDate || '-';

  const rows = [];

  if (examType === 'Level II Scan') {
    rows.push(['Fetal Lie', findings.fetalLie]);
    rows.push(['Placenta', findings.placenta]);
    rows.push(['Liquor', findings.liquor]);
    rows.push(['Cervix', findings.cervix]);
    rows.push(['BPD', findings.bpd]);
    rows.push(['HC', findings.hc]);
    rows.push(['AC', findings.ac]);
    rows.push(['FL', findings.fl]);
    rows.push(['Brain', findings.brain]);
    rows.push(['Face', findings.face]);
    rows.push(['Spine', findings.spine]);
    rows.push(['Heart', findings.heart]);
    rows.push(['Abdomen', findings.abdomen]);
    rows.push(['Limbs', findings.limbs]);
    rows.push(['Soft Markers', findings.softMarkers]);
    rows.push(['Major Anomaly', findings.majorAnomaly]);
    rows.push(['Notes', findings.notes]);
    if (findings.ga) rows.push(['GA', findings.ga]);
    if (findings.fhr) rows.push(['FHR', findings.fhr]);
  } else if (examType === 'NT Scan') {
    rows.push(['CRL (mm)', findings.crl_mm]);
    rows.push(['NT (mm)', findings.nt_mm]);
    rows.push(['Nasal Bone', findings.nasal_bone]);
    rows.push(['Ductus Venosus', findings.ductus_venosus]);
    rows.push(['Tricuspid Flow', findings.tricuspid_flow]);
    rows.push(['Soft Markers', findings.soft_markers]);
    rows.push(['Notes', findings.nt_notes]);
    if (findings.ga) rows.push(['GA', findings.ga]);
    if (findings.fhr) rows.push(['FHR', findings.fhr]);
  } else {
    Object.entries(findings || {}).forEach(([key, value]) => {
      rows.push([formatFieldLabel(key), value]);
    });
  }

  const findingsRows = rows
    .map(
      ([label, value]) => `
      <tr>
        <td>${escapeHtml(String(label))}</td>
        <td>${escapeHtml(String(value ?? '-'))}</td>
      </tr>
    `
    )
    .join('');

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
          <div><strong>Date:</strong> ${escapeHtml(reportDate)}</div>
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
        <thead>
          <tr><th>Parameter</th><th>Value</th></tr>
        </thead>
        <tbody>
          ${findingsRows || '<tr><td colspan="2">No findings entered</td></tr>'}
        </tbody>
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

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatFieldLabel(key) {
  return String(key)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

async function boot() {
  sessionData = await requireRole(['center_admin', 'doctor', 'staff']);
  if (!sessionData) return;

  clinicTitle.textContent = sessionData.center?.name || 'Clinic Workspace';
  clinicWelcome.textContent = `Welcome, ${sessionData.profile.full_name || 'User'} (${sessionData.profile.role})`;

  if (examDateEl) {
    examDateEl.value = new Date().toISOString().slice(0, 10);
  }

  await loadPatients();
  await loadExaminations();
  handleExamTypeChange();
}

boot();
