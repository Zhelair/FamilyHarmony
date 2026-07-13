import { supabase } from './supabase'

const today = () => new Date().toISOString().slice(0, 10)

export async function loadWorkspace(user) {
  const [{ data: profile, error: profileError }, { data: membership, error: membershipError }] = await Promise.all([
    supabase.from('profiles').select('id, display_name').eq('id', user.id).maybeSingle(),
    supabase.from('household_members').select('household_id, role').eq('user_id', user.id).limit(1).maybeSingle(),
  ])

  if (profileError) throw profileError
  if (membershipError) throw membershipError
  if (!membership) return { profile, membership: null, household: null, checkIns: {} }

  const [{ data: household, error: householdError }, { data: checkIns, error: checkInError }] = await Promise.all([
    supabase.from('households').select('id, name').eq('id', membership.household_id).single(),
    supabase.from('check_ins').select('kind').eq('user_id', user.id).eq('completed_on', today()),
  ])

  if (householdError) throw householdError
  if (checkInError) throw checkInError
  return { profile, membership, household, checkIns: Object.fromEntries(checkIns.map(({ kind }) => [kind, true])) }
}

export async function createHousehold(name, userId) {
  const { error } = await supabase.from('households').insert({ name: name.trim(), created_by: userId })
  if (error) throw error
}

export async function toggleCheckIn({ householdId, userId, kind, completed }) {
  if (completed) {
    const { error } = await supabase.from('check_ins').delete().eq('household_id', householdId).eq('user_id', userId).eq('kind', kind).eq('completed_on', today())
    if (error) throw error
    return false
  }
  const { error } = await supabase.from('check_ins').insert({ household_id: householdId, user_id: userId, kind, completed_on: today() })
  if (error) throw error
  return true
}

export async function addExistingMember(householdId, email) {
  const { error } = await supabase.rpc('add_existing_household_member', { target_household_id: householdId, target_email: email.trim() })
  if (error) throw error
}
