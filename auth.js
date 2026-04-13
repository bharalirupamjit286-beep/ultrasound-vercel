import { supabase } from './supabase.js';

export async function signInWithPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentAppUser() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { user: null, profile: null, center: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, role, center_id, is_active')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { user, profile: null, center: null, error: profileError };
  }

  let center = null;

  if (profile.center_id) {
    const { data: centerRow } = await supabase
      .from('centers')
      .select('id, name, code, is_active')
      .eq('id', profile.center_id)
      .single();

    center = centerRow || null;
  }

  return { user, profile, center };
}

export async function requireRole(allowedRoles = []) {
  const result = await getCurrentAppUser();

  if (!result.user) {
    window.location.href = './login.html';
    return null;
  }

  if (!result.profile) {
    alert('Profile mapping missing. Contact administrator.');
    window.location.href = './login.html';
    return null;
  }

  if (!allowedRoles.includes(result.profile.role)) {
    alert('Access denied.');
    window.location.href = './login.html';
    return null;
  }

  return result;
}
