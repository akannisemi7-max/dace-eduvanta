// EduVanta Edge Function: admin-users  (v2)
// Creates student/teacher accounts, resets passwords and removes accounts.
//
// SECURITY MODEL
//  * Deploy with "Verify JWT" OFF. That is safe ONLY because this function validates every caller itself:
//      1. It reads the caller's access token and asks Supabase Auth to validate it (auth.getUser).
//         A missing, expired, forged or revoked token, or the public/publishable key, is rejected (401).
//      2. It loads the caller's profile with the service key and requires status = 'active' and active = true.
//      3. It checks the caller's ROLE against what the requested action needs, and checks the TARGET person
//         (same school, allowed role, teachers limited to classes they teach).
//  * The service-role key comes from the function's own environment (SUPABASE_SERVICE_ROLE_KEY). It is
//    never sent to the browser and never appears in the app.
//  * Only whitelisted profile fields are accepted from the browser, and role/status/active are set here.
//
// Optional: set a secret ALLOWED_ORIGIN (for example https://your-site.netlify.app) to accept calls
// from that site only.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || '*';
const cors = {
  'Access-Control-Allow-Origin': ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v: unknown, max = 120) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// Only these profile fields are copied from the browser. Everything else is ignored.
function cleanProfile(p: Record<string, unknown>, role: string) {
  const out: Record<string, unknown> = {
    name: str(p.name), staffId: str(p.staffId, 40), phone: str(p.phone, 40),
  };
  if (role === 'student') out.classId = str(p.classId, 80);
  if (role === 'teacher') {
    out.assign = Array.isArray(p.assign)
      ? p.assign.slice(0, 60).map((a: any) => ({ classId: str(a?.classId, 80), subjectId: str(a?.subjectId, 80) }))
        .filter((a: any) => a.classId && a.subjectId)
      : [];
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Not allowed.' }, 405);
  try {
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1. Who is calling? Ask Supabase Auth to validate the token.
    const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim();
    if (!jwt) return json({ error: 'Please sign in again.' }, 401);
    const { data: au, error: ae } = await admin.auth.getUser(jwt);
    if (ae || !au?.user) return json({ error: 'Please sign in again.' }, 401);

    // 2. Is the caller an active member of the school?
    const { data: me } = await admin.from('profiles').select('id, role, status, active, school_id, data').eq('id', au.user.id).maybeSingle();
    if (!me || me.status !== 'active' || me.active !== true) return json({ error: 'Your account is not active.' }, 403);
    const isOwner = me.role === 'proprietor';
    const isMgmt = isOwner || me.role === 'admin';
    const myClasses: string[] = Array.isArray(me.data?.assign) ? me.data.assign.map((a: any) => String(a?.classId)) : [];

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') return json({ error: 'Bad request.' }, 400);

    // ---------- create accounts ----------
    if (body.action === 'createUsers') {
      const allowedRoles = isMgmt ? ['teacher', 'student'] : me.role === 'teacher' ? ['student'] : [];
      const list = Array.isArray(body.users) ? body.users.slice(0, 100) : [];
      const results: Array<Record<string, unknown>> = [];
      for (const u of list) {
        const email = str(u?.email, 200).toLowerCase();
        const password = typeof u?.password === 'string' ? u.password : '';
        const role = str(u?.role, 20);
        if (!allowedRoles.includes(role)) { results.push({ email, error: 'You are not allowed to create this kind of account.' }); continue; }
        if (!EMAIL.test(email) || password.length < 6 || password.length > 72) { results.push({ email, error: 'A valid email and a password of 6 to 72 characters are needed.' }); continue; }
        const p = cleanProfile(u.profile || {}, role);
        if (!p.name) { results.push({ email, error: 'A name is needed.' }); continue; }
        if (role === 'student') {
          if (!p.classId) { results.push({ email, error: 'A class is needed.' }); continue; }
          if (!isMgmt && !myClasses.includes(String(p.classId))) { results.push({ email, error: 'You can only add students to classes you teach.' }); continue; }
        }
        const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
        if (created.error || !created.data.user) { results.push({ email, error: created.error?.message || 'Could not create the account.' }); continue; }
        const id = created.data.user.id;
        const row = {
          id, school_id: me.school_id, role, status: 'active', active: true,
          class_id: role === 'student' ? String(p.classId) : null, email, name: String(p.name),
          data: { ...p, id, school: me.school_id, role, email, status: 'active', active: true },
        };
        const ins = await admin.from('profiles').insert(row);
        if (ins.error) {
          await admin.auth.admin.deleteUser(id);   // do not leave a half-created account behind
          results.push({ email, error: ins.error.message });
          continue;
        }
        results.push({ email, id });
      }
      return json({ results });
    }

    // ---------- reset a password or PIN ----------
    if (body.action === 'resetPassword') {
      if (!UUID.test(String(body.userId))) return json({ error: 'Person not found.' }, 404);
      const { data: t } = await admin.from('profiles').select('id, role, school_id, class_id').eq('id', body.userId).maybeSingle();
      if (!t || t.school_id !== me.school_id) return json({ error: 'Person not found.' }, 404);
      const ok =
        t.id === me.id ||                                                           // your own password
        (isOwner && t.role !== 'proprietor') ||                                      // the owner can reset anyone else
        (me.role === 'admin' && (t.role === 'teacher' || t.role === 'student')) ||   // an admin cannot touch other admins or the owner
        (me.role === 'teacher' && t.role === 'student' && myClasses.includes(String(t.class_id)));
      if (!ok) return json({ error: 'You are not allowed to do that.' }, 403);
      const password = typeof body.password === 'string' ? body.password : '';
      if (password.length < 6 || password.length > 72) return json({ error: 'The new password must be 6 to 72 characters.' }, 400);
      const r = await admin.auth.admin.updateUserById(t.id, { password });
      if (r.error) return json({ error: r.error.message }, 400);
      return json({ ok: true });
    }

    // ---------- remove an account (declining a sign-up) ----------
    if (body.action === 'deleteUser') {
      if (!isMgmt) return json({ error: 'You are not allowed to do that.' }, 403);
      if (!UUID.test(String(body.userId))) return json({ error: 'Person not found.' }, 404);
      const { data: t } = await admin.from('profiles').select('id, role, school_id').eq('id', body.userId).maybeSingle();
      if (!t || t.school_id !== me.school_id) return json({ error: 'Person not found.' }, 404);
      if (t.id === me.id) return json({ error: 'You cannot remove your own account.' }, 403);
      if (t.role === 'proprietor') return json({ error: 'The owner account cannot be removed.' }, 403);
      if (!isOwner && t.role === 'admin') return json({ error: 'Only the owner can remove an administrator.' }, 403);
      const r = await admin.auth.admin.deleteUser(t.id);   // the profile row is removed with it
      if (r.error) return json({ error: r.error.message }, 400);
      return json({ ok: true });
    }

    return json({ error: 'Unknown request.' }, 400);
  } catch (e) {
    return json({ error: String((e as Error).message || e) }, 500);
  }
});
