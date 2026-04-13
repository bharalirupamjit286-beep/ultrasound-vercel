import { supabase } from './supabase.js';
import { requireRole, signOutUser } from './auth.js';

const adminWelcome = document.getElementById('adminWelcome');
const onboardingList = document.getElementById('onboardingList');
const centerList = document.getElementById('centerList');
const logoutBtn = document.getElementById('logoutBtn');

logoutBtn.addEventListener('click', async () => {
  await signOutUser();
  window.location.href = './login.html';
});

async function loadCenters() {
  const { data, error } = await supabase
    .from('centers')
    .select('id, name, code, is_active, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    centerList.textContent = error.message;
    return;
  }

  if (!data.length) {
    centerList.textContent = 'No centers found.';
    return;
  }

  centerList.innerHTML = data.map(row => `
    <div class="list-row">
      <strong>${row.name}</strong>
      <span>${row.code}</span>
      <span>${row.is_active ? 'Active' : 'Inactive'}</span>
    </div>
  `).join('');
}

async function loadOnboardingRequests() {
  const { data, error } = await supabase
    .from('center_onboarding_requests')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    onboardingList.textContent = error.message;
    return;
  }

  if (!data.length) {
    onboardingList.textContent = 'No pending onboarding requests.';
    return;
  }

  onboardingList.innerHTML = data.map(row => `
    <div class="list-card">
      <p><strong>${row.center_name}</strong></p>
      <p>${row.admin_name} · ${row.admin_email}</p>
      <p>${row.admin_phone || '-'}</p>
      <div class="row-actions">
        <button data-approve="${row.id}">Approve</button>
        <button data-reject="${row.id}">Reject</button>
      </div>
    </div>
  `).join('');

  onboardingList.querySelectorAll('[data-approve]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const requestId = btn.getAttribute('data-approve');
      const { data, error } = await supabase.rpc('approve_center_onboarding_request', {
        request_id: requestId,
      });

      if (error) {
        alert(error.message);
        return;
      }

      alert(`Approved: ${data[0].new_center_name}`);
      await loadOnboardingRequests();
      await loadCenters();
    });
  });

  onboardingList.querySelectorAll('[data-reject]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const requestId = btn.getAttribute('data-reject');
      const note = prompt('Reason for rejection?') || null;
      const { error } = await supabase.rpc('reject_center_onboarding_request', {
        request_id: requestId,
        reject_note: note,
      });

      if (error) {
        alert(error.message);
        return;
      }

      alert('Rejected.');
      await loadOnboardingRequests();
    });
  });
}

async function boot() {
  const session = await requireRole(['super_admin']);
  if (!session) return;

  adminWelcome.textContent = `Welcome, ${session.profile.full_name || 'Super Admin'}`;

  await loadOnboardingRequests();
  await loadCenters();
}

boot();
