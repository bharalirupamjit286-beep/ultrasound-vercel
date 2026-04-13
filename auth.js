import { supabase } from './supabase.js';

export async function signInWithPassword(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOutUser() {
  await supabase.auth.signOut();
}

export async function getCurrentAppUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user:null, profile:null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return { user, profile };
}

export async function requireRole(roles) {
  const res = await getCurrentAppUser();
  if (!res.user || !roles.includes(res.profile.role)) {
    location.href = './login.html';
    return null;
  }
  return res;
}
