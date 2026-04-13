import { supabase } from './supabase.js';
import { requireRole, signOutUser } from './auth.js';
const printReportBtn = document.getElementById('printReportBtn');
const clinicTitle = document.getElementById('clinicTitle');
const clinicWelcome = document.getElementById('clinicWelcome');
const logoutBtn = document.getElementById('logoutBtn');
printReportBtn.addEventListener('click', () => {
  if (!reportPreview.innerHTML || reportPreview.textContent.includes('No preview yet')) {
    alert('No report available to print.');
    return;
  }
  window.print();
});
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

const examType = document.getElementById('examType');
const ntModule = document.getElementById('ntModule');
const ntRiskSummary = document.getElementById('ntRiskSummary');
const ntRecommendation = document.getElementById('ntRecommendation');
let sessionData = null;
let selectedPatient = null;
let patientsCache = [];

logoutBtn.addEventListener('click', async () => {
  await signOutUser();
  window.location.href = './login.html';
});

refreshPatientsBtn.addEventListener('click', async () => {
  await loadPatients();
});

patientSearch.addEventListener('input', renderPatients);
examType.addEventListener('change', handleExamTypeChange);

['ntCrl', 'ntValue', 'nasalBone', 'dvFlow', 'trFlow', 'softMarkers', 'ntNotes', 'gaText', 'fhr'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', liveNtPreview);
    el.addEventListener('change', liveNtPreview);
  }
});
patientForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  patientMsg.textContent = 'Saving patient...';

  const payload = {
    center_id: sessionData.profile.center_id,
    patient_uid: document.getElementById('patientUid').value.trim() || null,
    patient_name: document.getElementById('patientName').value.trim(),
    age: document.getElementById('patientAge').value.trim() || null,
    sex: document.getElementById('patientSex').value.trim() || null,
    phone: document.getElementById('patientPhone').value.trim() || null,
    referred_by: document.getElementById('referredBy').value.trim() || null,
    created_by: sessionData.user.id,
  };

  const { error } = await supabase.from('patients').insert([payload]);

  if (error) {
    patientMsg.textContent = error.message;
    return;
  }

  patientMsg.textContent = 'Patient added successfully.';
  patientForm.reset();
  await loadPatients();
});
examForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!selectedPatient) {
    examMsg.textContent = 'Select a patient first.';
    return;
  }

  examMsg.textContent = 'Saving examination...';

  const currentExamType = examType.value;
  const examDate = document.getElementById('examDate').value || null;
  const gaText = document.getElementById('gaText').value.trim();
  const fhr = document.getElementById('fhr').value.trim();
  const customReportHtml = document.getElementById('reportHtml').value.trim();

  let parsedFindings = {};

  if (currentExamType === 'NT Scan') {
    parsedFindings = buildNtFindings();
  } else {
    const findingsRaw = document.getElementById('findingsJson').value.trim();
    if (findingsRaw) {
      try {
        parsedFindings = JSON.parse(findingsRaw);
      } catch (error) {
        examMsg.textContent = 'Findings JSON is invalid.';
        return;
      }
    }
    }

  if (gaText) parsedFindings.ga = gaText;
  if (fhr) parsedFindings.fhr = fhr;

  const impression = currentExamType === 'NT Scan'
    ? generateNtImpression(parsedFindings)
    : document.getElementById('impression').value.trim();

  if (currentExamType === 'NT Scan') {
    document.getElementById('impression').value = impression;
  }

  const previewHtml = customReportHtml || buildReportPreviewHtml({
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
  ntRiskSummary.textContent = 'Not calculated';
  ntRecommendation.textContent = 'Not calculated';
  handleExamTypeChange();
  await loadExaminations();
});
function handleExamTypeChange() {
  const isNt = examType.value === 'NT Scan';
  ntModule.style.display = isNt ? 'block' : 'none';
  if (!isNt) {
    ntRiskSummary.textContent = 'Not calculated';
    ntRecommendation.textContent = 'Not calculated';
  } else {
    liveNtPreview();
  }
}

function buildNtFindings() {
  return {
    crl_mm: document.getElementById('ntCrl').value.trim() || null,
    nt_mm: document.getElementById('ntValue').value.trim() || null,
    nasal_bone: document.getElementById('nasalBone').value || null,
    ductus_venosus: document.getElementById('dvFlow').value || null,
    tricuspid_flow: document.getElementById('trFlow').value || null,
    soft_markers: document.getElementById('softMarkers').value || null,
    nt_notes: document.getElementById('ntNotes').value.trim() || null,
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

  if (
    nt >= 3.5 ||
    nasalBone === 'absent' ||
    dv === 'abnormal' ||
    tr === 'regurgitation' ||
    soft === 'present'
  ) {
    risk = 'High risk';
    recommendation = 'Further evaluation and correlation with combined screening / fetal medicine opinion advised.';
  } else if (
    nt >= 2.5 ||
    nasalBone === 'hypoplastic'
  ) {
    risk = 'Intermediate risk';
    recommendation = 'Clinical correlation and follow-up screening advised.';
  }

  return { risk, recommendation };
}
function generateNtImpression(findings) {
  const bits = [];

  if (findings.crl_mm) bits.push(`CRL measures ${findings.crl_mm} mm.`);
  if (findings.nt_mm) bits.push(`NT measures ${findings.nt_mm} mm.`);
  if (findings.nasal_bone) bits.push(`Nasal bone is ${findings.nasal_bone}.`);
  if (findings.ductus_venosus) bits.push(`Ductus venosus flow is ${findings.ductus_venosus}.`);
  if (findings.tricuspid_flow) bits.push(`Tricuspid flow is ${findings.tricuspid_flow}.`);
  if (findings.soft_markers && findings.soft_markers !== 'none') bits.push(`Soft markers are present.`);
  if (findings.nt_notes) bits.push(findings.nt_notes);

  const riskInfo = generateNtRisk(findings);
  bits.push(`Overall first trimester screening impression: ${riskInfo.risk}.`);
  bits.push(riskInfo.recommendation);

  return bits.join(' ');
}

function liveNtPreview() {
  if (examType.value !== 'NT Scan' || !selectedPatient) return;

  const findings = buildNtFindings();
  const impression = generateNtImpression(findings);
  const riskInfo = generateNtRisk(findings);

  ntRiskSummary.textContent = riskInfo.risk;
  ntRecommendation.textContent = riskInfo.recommendation;
  document.getElementById('impression').value = impression;
 const previewHtml = buildReportPreviewHtml({
    patient: selectedPatient,
    examType: 'NT Scan',
    examDate: document.getElementById('examDate').value || null,
    findings,
    impression,
  });

  reportPreview.innerHTML = previewHtml;
}

function renderPatients() {
  const q = patientSearch.value.trim().toLowerCase();
  const rows = q
    ? patientsCache.filter(row => {
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
 patientList.innerHTML = rows.map(row => `
    <button class="patient-row ${selectedPatient?.id === row.id ? 'patient-row-active' : ''}" data-id="${row.id}" type="button">
      <strong>${escapeHtml(row.patient_name)}</strong>
      <span>${escapeHtml(row.patient_uid || '-')}</span>
      <span>${escapeHtml(row.age || '-')} · ${escapeHtml(row.sex || '-')}</span>
      <span>${escapeHtml(row.phone || '-')}</span>
    </button>
  `).join('');

  patientList.querySelectorAll('[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const found = patientsCache.find(x => x.id === id);
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
    selectedPatient = patientsCache.find(x => x.id === selectedPatient.id) || null;
  }

  renderSelectedPatient();
  renderPatients();
}
async function loadExaminations() {
  if (!selectedPatient) {
    examList.innerHTML = '<div class="muted-box">Select a patient to view examinations.</div>';
    reportPreview.innerHTML = 'No preview yet.';
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
    if (examType.value !== 'NT Scan') reportPreview.innerHTML = 'No preview yet.';
    return;
  }
 examList.innerHTML = data.map(row => `
    <button class="exam-row" data-exam-id="${row.id}" type="button">
      <strong>${escapeHtml(row.exam_type)}</strong>
      <span>${escapeHtml(row.exam_date || '-')}</span>
      <span>${escapeHtml(row.status)}</span>
      <span>${escapeHtml(row.impression || '-')}</span>
    </button>
  `).join('');

  examList.querySelectorAll('[data-exam-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const examId = btn.getAttribute('data-exam-id');
      const found = data.find(x => x.id === examId);
      if (!found) return;
      reportPreview.innerHTML = found.report_html || `<div class="muted-box">${escapeHtml(found.impression || 'No preview available.')}</div>`;
    });
  });

  if (examType.value !== 'NT Scan') {
    reportPreview.innerHTML = data[0].report_html || `<div class="muted-box">${escapeHtml(data[0].impression || 'No preview available.')}</div>`;
  }
}

function buildReportPreviewHtml({ patient, examType, examDate, findings, impression }) {
  const findingsRows = Object.entries(findings || {}).map(([key, value]) => `
    <tr>
      <td>${escapeHtml(key)}</td>
      <td>${escapeHtml(String(value))}</td>
    </tr>
  `).join('');
 return `
    <div class="report-sheet">
      <h3>${escapeHtml(sessionData.center?.name || 'Clinic')}</h3>
      <p><strong>Patient:</strong> ${escapeHtml(patient.patient_name)}</p>
      <p><strong>Patient ID:</strong> ${escapeHtml(patient.patient_uid || '-')}</p>
      <p><strong>Exam Type:</strong> ${escapeHtml(examType || '-')}</p>
      <p><strong>Exam Date:</strong> ${escapeHtml(examDate || '-')}</p>
      <table class="report-table-lite">
        <thead><tr><th>Field</th><th>Value</th></tr></thead>
        <tbody>${findingsRows || '<tr><td colspan="2">No findings entered</td></tr>'}</tbody>
      </table>
      <div class="report-impression">
        <strong>Impression:</strong>
        <p>${escapeHtml(impression || '-')}</p>
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

async function boot() {
  sessionData = await requireRole(['center_admin', 'doctor', 'staff']);
  if (!sessionData) return;

  clinicTitle.textContent = sessionData.center?.name || 'Clinic Workspace';
  clinicWelcome.textContent = `Welcome, ${sessionData.profile.full_name || 'User'} (${sessionData.profile.role})`;

  document.getElementById('examDate').value = new Date().toISOString().slice(0, 10);

  await loadPatients();
  await loadExaminations();
}

boot();
