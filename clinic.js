import { supabase } from './supabase.js';
import { requireRole, signOutUser } from './auth.js';

const clinicTitle = document.getElementById('clinicTitle');
const clinicWelcome = document.getElementById('clinicWelcome');
const patientForm = document.getElementById('patientForm');
const patientMsg = document.getElementById('patientMsg');
const patientList = document.getElementById('patientList');
const logoutBtn = document.getElementById('logoutBtn');

let sessionData = null;

logoutBtn.addEventListener('click', async () => {
  await signOutUser();
  window.location.href = './login.html';
});

async function loadPatients() {
  const { data, error } = await supabase
    .from('patients')
    .select('id, patient_uid, patient_name, age, sex, phone, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    patientList.textContent = error.message;
    return;
  }

  if (!data.length) {
    patientList.textContent = 'No patients yet.';
    return;
  }

  patientList.innerHTML = data.map(row => `
    <div class="list-row">
      <strong>${row.patient_name}</strong>
      <span>${row.patient_uid || '-'}</span>
      <span>${row.age || '-'}</span>
      <span>${row.sex || '-'}</span>
      <span>${row.phone || '-'}</span>
    </div>
  `).join('');
}

patientForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  patientMsg.textContent = 'Saving...';

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

async function boot() {
  sessionData = await requireRole(['center_admin', 'doctor', 'staff']);
  if (!sessionData) return;

  clinicTitle.textContent = sessionData.center?.name || 'Clinic Dashboard';
  clinicWelcome.textContent = `Welcome, ${sessionData.profile.full_name || 'User'} (${sessionData.profile.role})`;

  await loadPatients();
}

boot();
