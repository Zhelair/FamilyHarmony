import { supabase } from './supabase'

const today = () => new Date().toISOString().slice(0, 10)

function weekStart() {
  const date = new Date()
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7))
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function withProgress(goals, logs) {
  const progressByGoal = logs.reduce((totals, log) => ({ ...totals, [log.goal_id]: (totals[log.goal_id] || 0) + log.amount }), {})
  return goals.map((goal) => ({ ...goal, progress: progressByGoal[goal.id] || 0 }))
}

export async function loadWorkspace(user) {
  const [{ data: profile, error: profileError }, { data: membership, error: membershipError }] = await Promise.all([
    supabase.from('profiles').select('id, display_name').eq('id', user.id).maybeSingle(),
    supabase.from('household_members').select('household_id, role').eq('user_id', user.id).limit(1).maybeSingle(),
  ])

  if (profileError) throw profileError
  if (membershipError) throw membershipError
  if (!membership) return { profile, membership: null, household: null, checkIns: {}, goals: [] }

  const [{ data: household, error: householdError }, { data: checkIns, error: checkInError }, { data: goals, error: goalsError }] = await Promise.all([
    supabase.from('households').select('id, name').eq('id', membership.household_id).single(),
    supabase.from('check_ins').select('kind').eq('user_id', user.id).eq('completed_on', today()),
    supabase.from('weekly_goals').select('id, household_id, created_by, visibility, title, description, target, week_start, created_at').eq('household_id', membership.household_id).eq('week_start', weekStart()).order('created_at'),
  ])

  if (householdError) throw householdError
  if (checkInError) throw checkInError
  if (goalsError) throw goalsError
  let logs = []
  if (goals.length > 0) {
    const { data, error: logsError } = await supabase.from('goal_progress_logs').select('goal_id, amount').in('goal_id', goals.map(({ id }) => id))
    if (logsError) throw logsError
    logs = data
  }
  return { profile, membership, household, checkIns: Object.fromEntries(checkIns.map(({ kind }) => [kind, true])), goals: withProgress(goals, logs) }
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

export async function createWeeklyGoal({ householdId, userId, title, description, visibility, target }) {
  const { data, error } = await supabase.from('weekly_goals').insert({ household_id: householdId, created_by: userId, title: title.trim(), description: description.trim() || null, visibility, target: Number(target), week_start: weekStart() }).select('id, household_id, created_by, visibility, title, description, target, week_start, created_at').single()
  if (error) throw error
  return { ...data, progress: 0 }
}

export async function logGoalProgress({ goalId, userId, amount }) {
  const { error } = await supabase.from('goal_progress_logs').insert({ goal_id: goalId, user_id: userId, amount: Number(amount) })
  if (error) throw error
}
