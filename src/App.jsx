import { useCallback, useEffect, useState } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, BookOpen, CalendarDays, Check, ChevronRight, CircleUserRound, Eye, EyeOff, Flame, Footprints, Heart, House, LockKeyhole, LogOut, Plus, Settings, ShieldCheck, Sparkles, Sun, UserPlus, Utensils } from 'lucide-react'
import { addExistingMember, createHousehold, loadWorkspace, toggleCheckIn } from './lib/hearthlight-api'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import './App.css'

const navItems = [
  { to: '/dashboard', label: 'Home', icon: House },
  { to: '/me', label: 'My day', icon: CircleUserRound },
  { to: '/challenges', label: 'Goals', icon: Sparkles },
  { to: '/meals', label: 'Meals', icon: Utensils },
]

const checkInItems = [
  { id: 'move', label: 'Move my body', note: 'A 20-minute walk counts', icon: Footprints, tint: 'mint' },
  { id: 'pause', label: 'Take a calm moment', note: 'Breathe, read, or simply pause', icon: Sun, tint: 'sun' },
  { id: 'connect', label: 'Connect at home', note: 'A little quality time together', icon: Heart, tint: 'rose' },
]

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } }

function BrandMark() {
  return <div className="brand"><span className="brand-mark"><Sparkles size={18} aria-hidden="true" /></span><span>hearthlight</span></div>
}

function getErrorMessage(error, fallback) {
  const message = error?.message || ''
  if (/invalid login credentials/i.test(message)) return 'That email and password do not match an approved account.'
  if (/email not confirmed/i.test(message)) return 'This account needs to be confirmed by the household owner.'
  return message || fallback
}

function ConnectionRequired() {
  return <div className="auth-screen"><section className="auth-card centered-card"><BrandMark /><span className="auth-icon"><LockKeyhole size={25} /></span><p className="eyebrow">Private access</p><h1>Hearthlight is waiting for its secure connection.</h1><p>Add the Supabase URL and anon key to this environment, then redeploy. This app never shows a public sign-up route.</p></section></div>
}

function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setSubmitting(false)
    if (signInError) setError(getErrorMessage(signInError, 'We could not sign you in.'))
  }

  return <div className="auth-screen auth-split">
    <section className="auth-story"><BrandMark /><div><p className="eyebrow">A home, held together</p><h1>Good things grow when we notice them.</h1><p>A private, calm place for your household’s everyday care and tiny wins.</p></div><div className="auth-house" aria-hidden="true"><span /><i /><i /><i /></div></section>
    <section className="auth-panel"><div className="auth-card"><span className="auth-icon"><LockKeyhole size={25} /></span><p className="eyebrow">Private household access</p><h1>Welcome back.</h1><p className="form-intro">Use the email and password your household owner set up for you.</p><form onSubmit={handleSubmit}><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={submitting} /><label htmlFor="password">Password</label><div className="password-control"><input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={submitting} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((current) => !current)}><span aria-hidden="true">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</span></button></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button form-button" type="submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'} <ChevronRight size={18} aria-hidden="true" /></button></form><p className="form-note">No public sign-up. Need access? Ask your household owner to create an account for you.</p></div></section>
  </div>
}

function HouseholdSetup({ user, onWorkspaceChanged }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleCreate(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await createHousehold(name, user.id)
      await onWorkspaceChanged()
    } catch (createError) {
      setError(getErrorMessage(createError, 'We could not create this household.'))
    } finally {
      setSubmitting(false)
    }
  }

  return <div className="auth-screen"><section className="auth-card setup-card"><BrandMark /><span className="auth-icon"><ShieldCheck size={25} /></span><p className="eyebrow">Private by design</p><h1>You’re signed in, but this account has no household access yet.</h1><p className="form-intro">If you’re starting the family space, create it below. Otherwise, ask the owner to add this exact email in Settings.</p><form onSubmit={handleCreate}><label htmlFor="household-name">Household name</label><input id="household-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="For example, The Linden home" required minLength="2" disabled={submitting} />{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button form-button" type="submit" disabled={submitting}>{submitting ? 'Creating…' : 'Create my household'} <ChevronRight size={18} aria-hidden="true" /></button></form><button className="muted-button" onClick={onWorkspaceChanged} disabled={submitting}>Check my access again</button><button className="text-button sign-out-text" onClick={() => supabase.auth.signOut()}>Sign out <LogOut size={16} aria-hidden="true" /></button></section></div>
}

function AppShell({ children, household, profile, user }) {
  const location = useLocation()
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())
  const displayName = profile?.display_name || user.email?.split('@')[0] || 'there'
  const firstName = displayName.split(' ')[0]
  const initial = displayName.charAt(0).toUpperCase()
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <aside className="sidebar"><BrandMark /><nav className="side-nav" aria-label="Primary navigation">{navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={19} aria-hidden="true" /><span>{label}</span></NavLink>)}</nav><div className="sidebar-footer"><NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Settings size={19} aria-hidden="true" /><span>Settings</span></NavLink><p><span className="presence-dot" />{household.name}</p></div></aside>
    <div className="app-frame"><header className="topbar"><div><p className="eyebrow">{today}</p><p className="welcome-line">Good morning, {firstName}</p></div><div className="topbar-actions"><span className="connection-status connected"><span />Private space</span><button className="icon-button" aria-label="Notifications"><Bell size={20} /></button><NavLink className="avatar" to="/settings" aria-label="Open settings">{initial}</NavLink></div></header><main id="main-content" key={location.pathname} className="main-content">{children}</main></div>
    <nav className="mobile-nav" aria-label="Primary navigation">{navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}><Icon size={20} aria-hidden="true" /><span>{label}</span></NavLink>)}</nav>
  </div>
}

function DashboardPage({ checkIns, household, onToggleCheckIn, actionError }) {
  const navigate = useNavigate()
  const completed = Object.values(checkIns).filter(Boolean).length
  const progress = Math.round((completed / checkInItems.length) * 100)
  return <>
    <motion.section className="page-intro" {...fadeUp}><div><p className="eyebrow">{household.name}</p><h1>A little care goes a long way.</h1><p className="lead">Your home is already in motion. Pick one small thing and keep the warmth going.</p></div><button className="primary-button" onClick={() => navigate('/me')}><Plus size={18} aria-hidden="true" />Check in</button></motion.section>
    {actionError && <p className="form-error page-message" role="alert">{actionError}</p>}
    <section className="dashboard-grid" aria-label="Household dashboard">
      <motion.article className="card house-card" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.06 }}><div className="card-heading"><div><p className="eyebrow">This week at home</p><h2>Your hearth is glowing</h2></div><span className="glow-icon"><House size={21} aria-hidden="true" /></span></div><div className="house-illustration" aria-label="Illustration of a warm home with a glowing window"><span className="moon" /><span className="house-roof" /><span className="house-body"><i /><i /><i /></span><span className="tree tree-one" /><span className="tree tree-two" /></div><div className="house-progress"><div><span>Family glow</span><strong>{62 + completed * 8}%</strong></div><div className="progress-track"><span style={{ width: `${62 + completed * 8}%` }} /></div><p>One more shared moment unlocks the garden lights.</p></div></motion.article>
      <motion.article className="card focus-card" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.12 }}><div className="card-heading"><div><p className="eyebrow">Family focus</p><h2>Move together</h2></div><Footprints className="heading-icon" size={22} aria-hidden="true" /></div><p>Make space for three small movement moments this week.</p><div className="member-row"><div className="stacked-avatars"><span>J</span><span>M</span><span>{household.name.charAt(0)}</span></div><span>Small wins, shared gently</span></div><button className="quiet-button" onClick={() => navigate('/challenges')}>See family goal <ChevronRight size={16} aria-hidden="true" /></button></motion.article>
      <motion.article className="card meal-card" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.18 }}><p className="eyebrow">Next up</p><div className="meal-title"><span className="meal-icon"><Utensils size={20} aria-hidden="true" /></span><div><h2>Sunday dinner</h2><p>Pick a family favorite</p></div></div><div className="meal-options"><span>Roast veggie pasta</span><span>Taco night</span></div><button className="text-button" onClick={() => navigate('/meals')}>Cast your vote <ChevronRight size={16} aria-hidden="true" /></button></motion.article>
    </section>
    <motion.section className="section-block" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.22 }}><div className="section-heading"><div><p className="eyebrow">Today, together</p><h2>Small check-ins, real momentum</h2></div><span className="count-pill">{completed} / {checkInItems.length} complete</span></div><div className="checkin-grid">{checkInItems.map(({ id, label, note, icon: Icon, tint }) => { const done = checkIns[id]; return <button key={id} className={`checkin-card ${tint} ${done ? 'done' : ''}`} onClick={() => onToggleCheckIn(id)} aria-pressed={done}><span className="checkin-icon">{done ? <Check size={20} aria-hidden="true" /> : <Icon size={20} aria-hidden="true" />}</span><span className="checkin-copy"><strong>{label}</strong><small>{done ? 'Lovely — you did it.' : note}</small></span><span className="check-state">{done ? 'Done' : 'Mark done'}</span></button> })}</div><div className="daily-progress" aria-label={`${progress}% of daily check-ins complete`}><span style={{ width: `${progress}%` }} /></div></motion.section>
    <motion.section className="activity-section" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.28 }}><div className="section-heading"><div><p className="eyebrow">Around the hearth</p><h2>Little wins from your people</h2></div><button className="text-button">View all <ChevronRight size={16} aria-hidden="true" /></button></div><div className="activity-list"><Activity initials="J" accent="lavender" text="Jade added a calm moment to her day" time="12 min ago" /><Activity initials="M" accent="peach" text="Mila voted for taco night" time="38 min ago" /><Activity initials="N" accent="mint" text="You kept a 5-day reading streak" time="Yesterday" /></div></motion.section>
  </>
}

function Activity({ initials, accent, text, time }) { return <article className="activity-item"><span className={`activity-avatar ${accent}`}>{initials}</span><p>{text}<small>{time}</small></p></article> }

function MyDayPage({ checkIns, onToggleCheckIn }) {
  const completed = Object.values(checkIns).filter(Boolean).length
  return <motion.section {...fadeUp}><div className="page-intro compact"><div><p className="eyebrow">My space</p><h1>Make today feel lighter.</h1><p className="lead">No big performance—just a few small promises to yourself.</p></div><span className="streak-chip"><Flame size={18} aria-hidden="true" />5-day streak</span></div><div className="personal-layout"><section className="card routine-card"><p className="eyebrow">Your gentle routine</p><h2>{completed === 3 ? 'A beautifully cared-for day.' : 'Choose what serves you today.'}</h2>{checkInItems.map(({ id, label, note, icon: Icon, tint }) => <button key={id} className={`routine-item ${checkIns[id] ? 'done' : ''}`} onClick={() => onToggleCheckIn(id)}><span className={`routine-dot ${tint}`}>{checkIns[id] ? <Check size={16} /> : <Icon size={16} />}</span><span><strong>{label}</strong><small>{checkIns[id] ? 'Complete' : note}</small></span><span className="circle-control" aria-hidden="true">{checkIns[id] && <Check size={14} />}</span></button>)}</section><aside className="card milestone-card"><span className="milestone-star"><BookOpen size={24} /></span><p className="eyebrow">Next milestone</p><h2>One more day of reading</h2><p>Keep your quiet ritual alive and add a new book to the family shelf.</p><div className="progress-track"><span style={{ width: '80%' }} /></div><strong>4 of 5 days</strong></aside></div></motion.section>
}

function PlaceholderPage({ icon: Icon, eyebrow, title, description, action }) { return <motion.section className="empty-page" {...fadeUp}><span className="empty-icon"><Icon size={30} aria-hidden="true" /></span><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="lead">{description}</p><button className="primary-button">{action}<ChevronRight size={18} aria-hidden="true" /></button></motion.section> }

function SettingsPage({ user, household, membership, onSignOut }) {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const isOwner = membership.role === 'owner'

  async function handleAddMember(event) {
    event.preventDefault()
    setError(''); setNotice(''); setSaving(true)
    try {
      await addExistingMember(household.id, email)
      setNotice(`${email.trim()} can now access ${household.name}.`)
      setEmail('')
    } catch (memberError) {
      setError(getErrorMessage(memberError, 'We could not add that account. Create it in Supabase first, then try again.'))
    } finally { setSaving(false) }
  }

  async function handlePassword(event) {
    event.preventDefault()
    setError(''); setNotice(''); setSaving(true)
    const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword })
    setSaving(false)
    if (passwordError) setError(getErrorMessage(passwordError, 'We could not update your password.'))
    else { setNewPassword(''); setNotice('Your password has been updated.') }
  }

  return <motion.section {...fadeUp}><div className="page-intro compact"><div><p className="eyebrow">Settings</p><h1>Keep this space close.</h1><p className="lead">Accounts and household access stay intentionally simple.</p></div></div><div className="settings-grid"><section className="card settings-card"><span className="settings-icon"><ShieldCheck size={23} /></span><p className="eyebrow">Household access</p><h2>{household.name}</h2><p>Only accounts added to this household can read or change its data.</p>{isOwner ? <form className="inline-form" onSubmit={handleAddMember}><label htmlFor="member-email">Add an existing account</label><div><input id="member-email" type="email" autoComplete="email" placeholder="family@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={saving} /><button className="primary-button" type="submit" disabled={saving}><UserPlus size={17} aria-hidden="true" />Add</button></div><small>Create the person’s account manually in Supabase first. There is no public sign-up.</small></form> : <p className="access-note">Your household owner manages who can join this private space.</p>}</section><section className="card settings-card"><span className="settings-icon"><LockKeyhole size={23} /></span><p className="eyebrow">Your account</p><h2>{user.email}</h2><p>Use a password known only to you. Hearthlight does not send login links.</p><form className="inline-form" onSubmit={handlePassword}><label htmlFor="new-password">New password</label><div><input id="new-password" type="password" autoComplete="new-password" minLength="8" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required disabled={saving} /><button className="primary-button" type="submit" disabled={saving}>Save</button></div></form><button className="muted-button signout-button" onClick={onSignOut}><LogOut size={17} aria-hidden="true" />Sign out</button></section></div>{error && <p className="form-error page-message" role="alert">{error}</p>}{notice && <p className="form-success page-message" role="status">{notice}</p>}</motion.section>
}

function PrivateApplication({ user, workspace }) {
  const [checkIns, setCheckIns] = useState(workspace.checkIns)
  const [actionError, setActionError] = useState('')
  useEffect(() => setCheckIns(workspace.checkIns), [workspace.checkIns])
  async function handleToggleCheckIn(id) {
    setActionError('')
    try {
      const completed = await toggleCheckIn({ householdId: workspace.household.id, userId: user.id, kind: id, completed: Boolean(checkIns[id]) })
      setCheckIns((current) => ({ ...current, [id]: completed }))
    } catch (checkInError) {
      setActionError(getErrorMessage(checkInError, 'We could not save that check-in.'))
    }
  }
  return <AppShell household={workspace.household} profile={workspace.profile} user={user}><Routes><Route path="/dashboard" element={<DashboardPage checkIns={checkIns} household={workspace.household} onToggleCheckIn={handleToggleCheckIn} actionError={actionError} />} /><Route path="/me" element={<MyDayPage checkIns={checkIns} onToggleCheckIn={handleToggleCheckIn} />} /><Route path="/challenges" element={<PlaceholderPage icon={Sparkles} eyebrow="Weekly goals" title="Build your first family goal." description="Personal challenges and shared wins will live here—beautifully simple, never competitive." action="Create a goal" />} /><Route path="/meals" element={<PlaceholderPage icon={CalendarDays} eyebrow="Family table" title="Plan one good meal together." description="Your shared meal plan and gentle voting flow are ready for their next layer." action="Plan a meal" />} /><Route path="/settings" element={<SettingsPage user={user} household={workspace.household} membership={workspace.membership} onSignOut={() => supabase.auth.signOut()} />} /><Route path="/welcome" element={<Navigate to="/dashboard" replace />} /><Route path="/" element={<Navigate to="/dashboard" replace />} /><Route path="*" element={<Navigate to="/dashboard" replace />} /></Routes></AppShell>
}

function HearthlightApp() {
  const [session, setSession] = useState(null)
  const [workspace, setWorkspace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [workspaceError, setWorkspaceError] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return undefined }
    let active = true
    async function restoreSession() {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (active) { setSession(currentSession); setLoading(false) }
    }
    restoreSession()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => { if (active) { setSession(nextSession); setWorkspace(null); setWorkspaceError('') } })
    return () => { active = false; subscription.unsubscribe() }
  }, [])

  const refreshWorkspace = useCallback(async () => {
    if (!session?.user) return
    setWorkspaceError('')
    try { setWorkspace(await loadWorkspace(session.user)) } catch (error) { setWorkspaceError(getErrorMessage(error, 'We could not load your private space.')) }
  }, [session?.user])

  useEffect(() => { if (session?.user) refreshWorkspace() }, [session?.user, refreshWorkspace])

  if (!isSupabaseConfigured) return <ConnectionRequired />
  if (loading) return <div className="auth-screen"><p className="loading-copy">Opening your private space…</p></div>
  if (!session) return <SignInPage />
  if (workspaceError) return <div className="auth-screen"><section className="auth-card centered-card"><BrandMark /><p className="form-error" role="alert">{workspaceError}</p><button className="primary-button form-button" onClick={refreshWorkspace}>Try again</button><button className="text-button sign-out-text" onClick={() => supabase.auth.signOut()}>Sign out <LogOut size={16} /></button></section></div>
  if (!workspace) return <div className="auth-screen"><p className="loading-copy">Checking your household access…</p></div>
  if (!workspace.membership) return <HouseholdSetup user={session.user} onWorkspaceChanged={refreshWorkspace} />
  return <PrivateApplication user={session.user} workspace={workspace} />
}

export default HearthlightApp
