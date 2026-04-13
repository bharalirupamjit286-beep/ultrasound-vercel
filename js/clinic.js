import { supabase } from './supabase.js';
import { requireRole, signOutUser } from './auth.js';

const clinicTitle = document.getElementById('clinicTitle');
const clinicWelcome = document.getElementById('clinicWelcome');
const logoutBtn = document.getElementById('logoutBtn');
const patientList = document.getElementById('patientList');
const examTypeEl = document.getElementById('examType');
const ntModule = document.getElementById('ntModule');
const level2Module = document.getElementById('level2Module');
const findingsJsonEl = document.getElementById('findingsJson');

let sessionData = null;

logoutBtn?.addEventListener('click', async () => {
  await signOutUser();
  window.location.href = './login.html';
});

examTypeEl?.addEventListener('change', handleExamTypeChange);

function handleExamTypeChange() {
  const current = examTypeEl?.value || '';
  const isNt = current === 'NT Scan';
  const isLevel2 = current === 'Level II Scan';

  if (ntModule) ntModule.style.display = isNt ? 'block' : 'none';
  if (level2Module) level2Module.style.display = isLevel2 ? 'block' : 'none';
  if (findingsJsonEl) findingsJsonEl.style.display = isNt || isLevel2 ? 'none' : 'block';
}

async function loadPatients() {
  const { data, error } = await supabase
    .from('patients')
    .select('id, patient_uid, patient_name, age, sex, phone')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    patientList.textContent = error.message;
    return;
  }

  if (!data || !data.length) {
    patientList.innerHTML = '<div class="muted-box">No patients yet.</div>';
    return;
  }

  patientList.innerHTML = data.map(row => `
    <div class="patient-row">
      <strong>${row.patient_name || '-'}</strong>
      <div>${row.patient_uid || '-'}</div>
      <div>${row.age || '-'} · ${row.sex || '-'}</div>
      <div>${row.phone || '-'}</div>
    </div>
  `).join('');
}

async function boot() {
  sessionData = await requireRole(['center_admin', 'doctor', 'staff']);
  if (!sessionData) return;

  clinicTitle.textContent = sessionData.center?.name || 'Clinic Workspace';
  clinicWelcome.textContent = `Welcome, ${sessionData.profile.full_name || 'User'} (${sessionData.profile.role})`;

  await loadPatients();
  handleExamTypeChange();
}

boot();
