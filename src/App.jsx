import { useState } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, BookOpen, CalendarDays, Check, ChevronRight, CircleUserRound, Flame, Footprints, Heart, House, Plus, Settings, Sparkles, Sun, Utensils } from 'lucide-react'
import { isSupabaseConfigured } from './lib/supabase'
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

function AppShell({ children }) {
  const location = useLocation()
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <aside className="sidebar"><BrandMark /><nav className="side-nav" aria-label="Primary navigation">{navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={19} aria-hidden="true" /><span>{label}</span></NavLink>)}</nav><div className="sidebar-footer"><NavLink to="/settings" className="nav-link"><Settings size={19} aria-hidden="true" /><span>Settings</span></NavLink><p><span className="presence-dot" />The Linden home</p></div></aside>
    <div className="app-frame"><header className="topbar"><div><p className="eyebrow">{today}</p><p className="welcome-line">Good morning, Niko</p></div><div className="topbar-actions"><span className={`connection-status ${isSupabaseConfigured ? 'connected' : ''}`}><span />{isSupabaseConfigured ? 'Synced' : 'Demo mode'}</span><button className="icon-button" aria-label="Notifications"><Bell size={20} /></button><div className="avatar" aria-label="Niko's profile">N</div></div></header><main id="main-content" key={location.pathname} className="main-content">{children}</main></div>
    <nav className="mobile-nav" aria-label="Primary navigation">{navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}><Icon size={20} aria-hidden="true" /><span>{label}</span></NavLink>)}</nav>
  </div>
}

function DashboardPage({ checkIns, onToggleCheckIn }) {
  const navigate = useNavigate()
  const completed = Object.values(checkIns).filter(Boolean).length
  const progress = Math.round((completed / checkInItems.length) * 100)
  return <>
    <motion.section className="page-intro" {...fadeUp}><div><p className="eyebrow">The Linden home</p><h1>A little care goes a long way.</h1><p className="lead">Your home is already in motion. Pick one small thing and keep the warmth going.</p></div><button className="primary-button" onClick={() => navigate('/me')}><Plus size={18} aria-hidden="true" />Check in</button></motion.section>
    <section className="dashboard-grid" aria-label="Household dashboard">
      <motion.article className="card house-card" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.06 }}><div className="card-heading"><div><p className="eyebrow">This week at home</p><h2>Your hearth is glowing</h2></div><span className="glow-icon"><House size={21} aria-hidden="true" /></span></div><div className="house-illustration" aria-label="Illustration of a warm home with a glowing window"><span className="moon" /><span className="house-roof" /><span className="house-body"><i /><i /><i /></span><span className="tree tree-one" /><span className="tree tree-two" /></div><div className="house-progress"><div><span>Family glow</span><strong>{62 + completed * 8}%</strong></div><div className="progress-track"><span style={{ width: `${62 + completed * 8}%` }} /></div><p>One more shared moment unlocks the garden lights.</p></div></motion.article>
      <motion.article className="card focus-card" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.12 }}><div className="card-heading"><div><p className="eyebrow">Family focus</p><h2>Move together</h2></div><Footprints className="heading-icon" size={22} aria-hidden="true" /></div><p>Make space for three small movement moments this week.</p><div className="member-row"><div className="stacked-avatars"><span>J</span><span>M</span><span>N</span></div><span>3 of 4 joined in</span></div><button className="quiet-button" onClick={() => navigate('/challenges')}>See family goal <ChevronRight size={16} aria-hidden="true" /></button></motion.article>
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

function OnboardingPage() {
  const navigate = useNavigate(); const [email, setEmail] = useState('')
  return <div className="onboarding"><div className="onboarding-art"><BrandMark /><div className="orb orb-one" /><div className="orb orb-two" /><div className="welcome-house" aria-hidden="true"><span className="welcome-roof" /><span className="welcome-body"><i /><i /><i /></span></div><div className="onboarding-copy"><p className="eyebrow">A home, held together</p><h1>Good things grow when we notice them.</h1><p>Hearthlight gives your family a calm place for everyday care, shared goals, and tiny moments worth keeping.</p></div></div><div className="onboarding-form-wrap"><div className="form-card"><p className="eyebrow">Welcome to Hearthlight</p><h2>Let’s make home feel a little brighter.</h2><p className="form-intro">Start with your email. You’ll be able to create or join your household next.</p><form onSubmit={(event) => { event.preventDefault(); navigate('/dashboard') }}><label htmlFor="email">Email address</label><input id="email" type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /><button className="primary-button form-button" type="submit">Continue <ChevronRight size={18} aria-hidden="true" /></button></form><p className="form-note">{isSupabaseConfigured ? 'Your secure sign-in is ready to connect.' : 'Demo mode for now — connect Supabase when you’re ready for real accounts.'}</p><button className="text-button" onClick={() => navigate('/dashboard')}>Explore the demo dashboard <ChevronRight size={16} aria-hidden="true" /></button></div></div></div>
}

function HearthlightApp() {
  const [checkIns, setCheckIns] = useState({ move: false, pause: false, connect: false })
  const toggleCheckIn = (id) => setCheckIns((current) => ({ ...current, [id]: !current[id] }))
  return <Routes><Route path="/welcome" element={<OnboardingPage />} /><Route path="/*" element={<AppShell><Routes><Route path="/dashboard" element={<DashboardPage checkIns={checkIns} onToggleCheckIn={toggleCheckIn} />} /><Route path="/me" element={<MyDayPage checkIns={checkIns} onToggleCheckIn={toggleCheckIn} />} /><Route path="/challenges" element={<PlaceholderPage icon={Sparkles} eyebrow="Weekly goals" title="Build your first family goal." description="Personal challenges and shared wins will live here—beautifully simple, never competitive." action="Create a goal" />} /><Route path="/meals" element={<PlaceholderPage icon={CalendarDays} eyebrow="Family table" title="Plan one good meal together." description="Your shared meal plan and gentle voting flow are ready for their next layer." action="Plan a meal" />} /><Route path="/settings" element={<PlaceholderPage icon={Settings} eyebrow="Settings" title="Make Hearthlight yours." description="Household details, notifications, and account preferences will be here." action="View preferences" />} /><Route path="/" element={<Navigate to="/dashboard" replace />} /><Route path="*" element={<Navigate to="/dashboard" replace />} /></Routes></AppShell>} /></Routes>
}

export default HearthlightApp
