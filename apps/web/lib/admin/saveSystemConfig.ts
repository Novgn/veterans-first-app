import 'server-only';

/**
 * System config upsert helper — shared by Stories 5.13 / 5.14 / 5.15.
 *
 * Admin-only. Writes/updates a `system_config` row and an audit log
 * entry capturing the old + new value.
 */

import { getCurrentUserWithRole } from '@/lib/auth/current-user';
import { getServiceRoleSupabase } from '@/lib/supabase';

export interface SaveConfigResult {
  ok: boolean;
  reason?: string;
}

export async function upsertSystemConfig(
  configKey: string,
  configValue: unknown,
  description?: string,
): Promise<SaveConfigResult> {
  const user = await getCurrentUserWithRole();
  if (!user || user.role !== 'admin') return { ok: false, reason: 'forbidden' };
  const supabase = getServiceRoleSupabase();
  const { data: actorRow } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', user.clerkUserId)
    .maybeSingle();
  const actorId = (actorRow as { id: string } | null)?.id ?? null;

  const existing = await supabase
    .from('system_config')
    .select('id, config_value')
    .eq('config_key', configKey)
    .maybeSingle();
  const prevValue =
    (existing.data as { id: string; config_value: unknown } | null)?.config_value ?? null;

  const payload = {
    config_key: configKey,
    config_value: configValue,
    description: description ?? null,
    updated_by: actorId,
    updated_at: new Date().toISOString(),
  };

  if (existing.data) {
    await supabase.from('system_config').update(payload).eq('config_key', configKey);
  } else {
    await supabase.from('system_config').insert(payload);
  }

  await supabase.from('audit_logs').insert({
    user_id: actorId,
    action: 'system_config_updated',
    resource_type: 'system_config',
    resource_id: null,
    old_values: { configKey, previous: prevValue },
    new_values: { configKey, next: configValue },
  });

  return { ok: true };
}

export async function readSystemConfig<T>(configKey: string, fallback: T): Promise<T> {
  const supabase = getServiceRoleSupabase();
  const { data } = await supabase
    .from('system_config')
    .select('config_value')
    .eq('config_key', configKey)
    .maybeSingle();
  const row = data as { config_value: T } | null;
  return row?.config_value ?? fallback;
}
