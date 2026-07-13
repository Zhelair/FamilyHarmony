import { supabase } from './supabase'

const today = () => new Date().toISOString().slice(0, 10)

export function weekStart() {
  const date = new Date()
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7))
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function sumBy(items, key, amountKey = 'amount') {
  return items.reduce((totals, item) => ({ ...totals, [item[key]]: (totals[item[key]] || 0) + item[amountKey] }), {})
}

function enrichGoals(goals, logs, userId) {
  const totals = sumBy(logs, 'goal_id')
  const mine = sumBy(logs.filter((log) => log.user_id === userId), 'goal_id')
  return goals.map((goal) => ({ ...goal, progress: totals[goal.id] || 0, myProgress: mine[goal.id] || 0 }))
}

function enrichChallenges(challenges, participants, logs, userId) {
  const mine = sumBy(logs.filter((log) => log.user_id === userId), 'challenge_id')
  const counts = participants.filter((participant) => participant.status === 'accepted').reduce((totals, participant) => ({ ...totals, [participant.challenge_id]: (totals[participant.challenge_id] || 0) + 1 }), {})
  const joined = new Set(participants.filter((participant) => participant.user_id === userId && participant.status === 'accepted').map((participant) => participant.challenge_id))
  return challenges.map((challenge) => ({ ...challenge, progress: mine[challenge.id] || 0, participantCount: counts[challenge.id] || 0, joined: joined.has(challenge.id) }))
}

export function calculateHarmonyScore(goals, challenges) {
  const goalScore = goals.reduce((score, goal) => score + (goal.myProgress * 5) + (goal.progress >= goal.target ? (goal.visibility === 'personal' ? 20 : 10) : 0), 0)
  const challengeScore = challenges.reduce((score, challenge) => score + (challenge.progress * 5) + (challenge.progress >= challenge.target ? 30 : 0), 0)
  return goalScore + challengeScore
}

export function unlockAchievements(goals, challenges, score) {
  const completed = goals.filter((goal) => goal.progress >= goal.target).length
  const shared = goals.filter((goal) => goal.visibility === 'shared' && goal.progress >= goal.target).length
  return [
    completed > 0 && { id: 'first-spark', title: 'First Spark', note: 'Complete your first weekly goal.' },
    completed >= 3 && { id: 'steady-hands', title: 'Steady Hands', note: 'Complete three goals in one week.' },
    shared > 0 && { id: 'family-fire', title: 'Family Fire', note: 'Help a shared goal reach its target.' },
    challenges.some((challenge) => challenge.progress >= challenge.target) && { id: 'friendly-rival', title: 'Friendly Rival', note: 'Finish an opt-in family challenge.' },
    score >= 100 && { id: 'bright-week', title: 'Bright Week', note: 'Earn 100 Harmony points.' },
  ].filter(Boolean)
}

export async function loadWorkspace(user) {
  const [{ data: profile, error: profileError }, { data: membership, error: membershipError }] = await Promise.all([
    supabase.from('profiles').select('id, display_name, locale').eq('id', user.id).maybeSingle(),
    supabase.from('household_members').select('household_id, role').eq('user_id', user.id).limit(1).maybeSingle(),
  ])
  if (profileError) throw profileError
  if (membershipError) throw membershipError
  if (!membership) return { profile, membership: null, household: null, checkIns: {}, goals: [], challenges: [], reflection: null, score: 0, achievements: [] }

  const currentWeek = weekStart()
  const [{ data: household, error: householdError }, { data: checkIns, error: checkInError }, { data: goals, error: goalsError }, { data: reflection, error: reflectionError }, { data: challenges, error: challengesError }] = await Promise.all([
    supabase.from('households').select('id, name').eq('id', membership.household_id).single(),
    supabase.from('check_ins').select('kind').eq('user_id', user.id).eq('completed_on', today()),
    supabase.from('weekly_goals').select('id, household_id, created_by, visibility, title, description, target, week_start, created_at, category, preset_key').eq('household_id', membership.household_id).eq('week_start', currentWeek).order('created_at'),
    supabase.from('weekly_reflections').select('id, win, obstacle, next_focus, small_reward').eq('user_id', user.id).eq('week_start', currentWeek).maybeSingle(),
    supabase.from('family_challenges').select('id, household_id, created_by, title, description, category, target, starts_on, ends_on, created_at').eq('household_id', membership.household_id).gte('ends_on', today()).order('created_at'),
  ])
  if (householdError || checkInError || goalsError || reflectionError || challengesError) throw householdError || checkInError || goalsError || reflectionError || challengesError

  const goalIds = goals.map(({ id }) => id)
  const challengeIds = challenges.map(({ id }) => id)
  const [{ data: goalLogs, error: goalLogError }, { data: participants, error: participantError }, { data: challengeLogs, error: challengeLogError }] = await Promise.all([
    goalIds.length ? supabase.from('goal_progress_logs').select('goal_id, user_id, amount').in('goal_id', goalIds) : Promise.resolve({ data: [], error: null }),
    challengeIds.length ? supabase.from('family_challenge_participants').select('challenge_id, user_id, status').in('challenge_id', challengeIds) : Promise.resolve({ data: [], error: null }),
    challengeIds.length ? supabase.from('family_challenge_logs').select('challenge_id, user_id, amount').in('challenge_id', challengeIds) : Promise.resolve({ data: [], error: null }),
  ])
  if (goalLogError || participantError || challengeLogError) throw goalLogError || participantError || challengeLogError
  const enrichedGoals = enrichGoals(goals, goalLogs, user.id)
  const enrichedChallenges = enrichChallenges(challenges, participants, challengeLogs, user.id)
  const score = calculateHarmonyScore(enrichedGoals, enrichedChallenges)
  return { profile, membership, household, checkIns: Object.fromEntries(checkIns.map(({ kind }) => [kind, true])), goals: enrichedGoals, challenges: enrichedChallenges, reflection, score, achievements: unlockAchievements(enrichedGoals, enrichedChallenges, score) }
}

export async function createHousehold(name, userId) { const { error } = await supabase.from('households').insert({ name: name.trim(), created_by: userId }); if (error) throw error }
export async function toggleCheckIn({ householdId, userId, kind, completed }) { const query = completed ? supabase.from('check_ins').delete().eq('household_id', householdId).eq('user_id', userId).eq('kind', kind).eq('completed_on', today()) : supabase.from('check_ins').insert({ household_id: householdId, user_id: userId, kind, completed_on: today() }); const { error } = await query; if (error) throw error; return !completed }
export async function addExistingMember(householdId, email) { const { error } = await supabase.rpc('add_existing_household_member', { target_household_id: householdId, target_email: email.trim() }); if (error) throw error }
export async function updateProfileLocale(locale) { const { error } = await supabase.from('profiles').update({ locale }).eq('id', (await supabase.auth.getUser()).data.user.id); if (error) throw error }

export async function createWeeklyGoal({ householdId, userId, title, description, visibility, target, category = 'growth', presetKey = null }) {
  const { data, error } = await supabase.from('weekly_goals').insert({ household_id: householdId, created_by: userId, title: title.trim(), description: description.trim() || null, visibility, target: Number(target), category, preset_key: presetKey, week_start: weekStart() }).select('id, household_id, created_by, visibility, title, description, target, week_start, created_at, category, preset_key').single()
  if (error) throw error
  return { ...data, progress: 0, myProgress: 0 }
}

export async function logGoalProgress({ goalId, userId, amount }) { const { error } = await supabase.from('goal_progress_logs').insert({ goal_id: goalId, user_id: userId, amount: Number(amount) }); if (error) throw error }

export async function saveWeeklyReflection({ householdId, userId, values }) {
  const { data, error } = await supabase.from('weekly_reflections').upsert({ household_id: householdId, user_id: userId, week_start: weekStart(), win: values.win.trim() || null, obstacle: values.obstacle.trim() || null, next_focus: values.nextFocus.trim() || null, small_reward: values.smallReward.trim() || null, updated_at: new Date().toISOString() }, { onConflict: 'user_id,week_start' }).select('id, win, obstacle, next_focus, small_reward').single()
  if (error) throw error
  return data
}

export async function createFamilyChallenge({ householdId, userId, title, description, category, target, duration }) {
  const endsOn = new Date(); endsOn.setDate(endsOn.getDate() + Number(duration))
  const endDate = `${endsOn.getFullYear()}-${String(endsOn.getMonth() + 1).padStart(2, '0')}-${String(endsOn.getDate()).padStart(2, '0')}`
  const { data, error } = await supabase.from('family_challenges').insert({ household_id: householdId, created_by: userId, title: title.trim(), description: description.trim() || null, category, target: Number(target), ends_on: endDate }).select('id, household_id, created_by, title, description, category, target, starts_on, ends_on, created_at').single()
  if (error) throw error
  return { ...data, progress: 0, participantCount: 1, joined: true }
}

export async function joinFamilyChallenge(challengeId, userId) { const { error } = await supabase.from('family_challenge_participants').upsert({ challenge_id: challengeId, user_id: userId, status: 'accepted' }); if (error) throw error }
export async function logChallengeProgress({ challengeId, userId, amount }) { const { error } = await supabase.from('family_challenge_logs').insert({ challenge_id: challengeId, user_id: userId, amount: Number(amount) }); if (error) throw error }
