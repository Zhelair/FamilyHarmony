import { useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarCheck, Check, CheckCircle2, ChevronRight, CircleX, HeartHandshake, Pencil, Plus, Save, UsersRound, X } from 'lucide-react'

const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.34 } }

const kinds = [
  { id: 'walk', ru: 'Прогулка', en: 'Walk' },
  { id: 'movie', ru: 'Кино / просмотр', en: 'Watch together' },
  { id: 'game', ru: 'Игра', en: 'Game' },
  { id: 'call', ru: 'Звонок', en: 'Call' },
  { id: 'visit', ru: 'Встреча', en: 'Visit' },
  { id: 'together', ru: 'Другое вместе', en: 'Something together' },
]

const copyFor = (language) => language === 'ru' ? {
  eyebrow: 'БЫТЬ ВМЕСТЕ',
  heading: 'Пусть хорошие встречи случаются.',
  lead: 'Договоритесь о простом общем моменте. Каждый сам выбирает, сможет ли прийти — без давления.',
  create: 'Создать общий план',
  edit: 'Изменить план',
  upcoming: 'Ближайшие моменты',
  completed: 'Состоявшиеся моменты',
  cancelled: 'Отменённые планы',
  empty: 'Пока нет общих планов.',
  emptyNote: 'Начните с маленькой встречи: прогулки, звонка или вечера вместе.',
  title: 'Название',
  description: 'Короткая заметка (необязательно)',
  kind: 'Что это будет?',
  date: 'Когда? (необязательно)',
  save: 'Сохранить план',
  saving: 'Сохраняем...',
  cancel: 'Отмена',
  going: 'Иду',
  maybe: 'Возможно',
  notGoing: 'Не смогу',
  goingCount: 'идут',
  answerCount: 'ответов',
  answerHint: 'Ваш ответ виден семье. Его можно поменять в любой момент.',
  complete: 'Отметить, что были вместе',
  reopen: 'Вернуть в планы',
  cancelPlan: 'Отменить план',
  memory: 'Сохранить воспоминание',
  memoryHint: 'После встречи оставьте одну тёплую фразу — её увидит только семья.',
  memoryLabel: 'Что хочется запомнить?',
  saveMemory: 'Сохранить',
  status: { planned: 'Запланировано', completed: 'Состоялось', cancelled: 'Отменено' },
  plannedDate: 'Дата ещё не выбрана',
  error: 'Не удалось сохранить. Попробуйте ещё раз.',
  memories: 'Тёплые воспоминания',
  noMemories: 'Воспоминания появятся после первой состоявшейся встречи.',
} : {
  eyebrow: 'BE TOGETHER',
  heading: 'Make room for good moments.',
  lead: 'Plan a simple shared moment. Everyone can choose whether they can make it — no pressure.',
  create: 'Plan a shared moment',
  edit: 'Edit plan',
  upcoming: 'Upcoming moments',
  completed: 'Moments that happened',
  cancelled: 'Cancelled plans',
  empty: 'No shared plans yet.',
  emptyNote: 'Start small: a walk, a call, or an evening together.',
  title: 'Title',
  description: 'A short note (optional)',
  kind: 'What kind of moment?',
  date: 'When? (optional)',
  save: 'Save plan',
  saving: 'Saving...',
  cancel: 'Cancel',
  going: 'Going',
  maybe: 'Maybe',
  notGoing: 'Can’t make it',
  goingCount: 'going',
  answerCount: 'answers',
  answerHint: 'Your answer is visible to your household and can be changed any time.',
  complete: 'Mark as happened',
  reopen: 'Return to plans',
  cancelPlan: 'Cancel plan',
  memory: 'Save a memory',
  memoryHint: 'Afterwards, leave one warm sentence for your household.',
  memoryLabel: 'What would you like to remember?',
  saveMemory: 'Save',
  status: { planned: 'Planned', completed: 'Happened', cancelled: 'Cancelled' },
  plannedDate: 'Date not chosen yet',
  error: 'Could not save that. Please try again.',
  memories: 'Warm memories',
  noMemories: 'Memories appear after your first completed moment.',
}

function MomentComposer({ language, moment, onSave, onCancel }) {
  const c = copyFor(language)
  const [title, setTitle] = useState(moment?.title ?? '')
  const [description, setDescription] = useState(moment?.description ?? '')
  const [kind, setKind] = useState(moment?.kind ?? 'together')
  const [scheduledFor, setScheduledFor] = useState(moment?.scheduled_for ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave({ title, description, kind, scheduledFor })
    } catch {
      setError(c.error)
    } finally {
      setSaving(false)
    }
  }

  return <section className="moment-composer card">
    <div>
      <p className="eyebrow">{c.eyebrow}</p>
      <h2>{moment ? c.edit : c.create}</h2>
      <p>{c.lead}</p>
    </div>
    <form onSubmit={submit}>
      <label htmlFor={`moment-title-${moment?.id ?? 'new'}`}>{c.title}
        <input id={`moment-title-${moment?.id ?? 'new'}`} value={title} onChange={(event) => setTitle(event.target.value)} minLength="2" maxLength="100" required disabled={saving} autoFocus />
      </label>
      <label htmlFor={`moment-description-${moment?.id ?? 'new'}`}>{c.description}
        <textarea id={`moment-description-${moment?.id ?? 'new'}`} value={description} onChange={(event) => setDescription(event.target.value)} maxLength="280" disabled={saving} />
      </label>
      <div className="moment-form-grid">
        <label htmlFor={`moment-kind-${moment?.id ?? 'new'}`}>{c.kind}
          <select id={`moment-kind-${moment?.id ?? 'new'}`} value={kind} onChange={(event) => setKind(event.target.value)} disabled={saving}>
            {kinds.map((item) => <option key={item.id} value={item.id}>{item[language]}</option>)}
          </select>
        </label>
        <label htmlFor={`moment-date-${moment?.id ?? 'new'}`}>{c.date}
          <input id={`moment-date-${moment?.id ?? 'new'}`} type="date" value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} disabled={saving} />
        </label>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="moment-form-actions">
        <button className="muted-button" type="button" onClick={onCancel} disabled={saving}>{c.cancel}</button>
        <button className="primary-button" type="submit" disabled={saving}><Save size={17} aria-hidden="true" />{saving ? c.saving : c.save}</button>
      </div>
    </form>
  </section>
}

function MemoryComposer({ language, onSave, onCancel }) {
  const c = copyFor(language)
  const [caption, setCaption] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave({ caption })
    } catch {
      setError(c.error)
    } finally {
      setSaving(false)
    }
  }

  return <form className="memory-composer" onSubmit={submit}>
    <label htmlFor="memory-caption">{c.memoryLabel}
      <textarea id="memory-caption" value={caption} onChange={(event) => setCaption(event.target.value)} required minLength="1" maxLength="500" disabled={saving} />
    </label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="memory-actions">
      <button className="muted-button" type="button" onClick={onCancel} disabled={saving}>{c.cancel}</button>
      <button className="primary-button" type="submit" disabled={saving}><Save size={16} aria-hidden="true" />{saving ? c.saving : c.saveMemory}</button>
    </div>
  </form>
}

function MomentCard({ language, moment, userId, onRespond, onUpdate, onSetStatus, onAddMemory }) {
  const c = copyFor(language)
  const [editing, setEditing] = useState(false)
  const [addingMemory, setAddingMemory] = useState(false)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const owner = moment.created_by === userId
  const date = moment.scheduled_for ? new Intl.DateTimeFormat(language === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${moment.scheduled_for}T12:00:00`)) : c.plannedDate

  async function run(action) {
    setWorking(true)
    setError('')
    try {
      await action()
    } catch {
      setError(c.error)
    } finally {
      setWorking(false)
    }
  }

  if (editing) return <MomentComposer language={language} moment={moment} onCancel={() => setEditing(false)} onSave={async (values) => { await onUpdate(moment.id, values); setEditing(false) }} />

  return <article className={`moment-card ${moment.status}`}>
    <div className="moment-card-top">
      <span className={`status-badge ${moment.status}`}>{moment.status === 'completed' ? <CheckCircle2 size={14} aria-hidden="true" /> : moment.status === 'cancelled' ? <CircleX size={14} aria-hidden="true" /> : <CalendarCheck size={14} aria-hidden="true" />}{c.status[moment.status]}</span>
      <span>{date}</span>
    </div>
    <h3>{moment.title}</h3>
    <p>{moment.description || (language === 'ru' ? 'Маленький общий момент для вашей семьи.' : 'A small shared moment for your household.')}</p>
    <div className="moment-meta"><span><UsersRound size={16} aria-hidden="true" />{moment.participantCount} {c.goingCount}</span><span>{moment.responseCount ?? 0} {c.answerCount}</span></div>
    {moment.status === 'planned' && <>
      <div className="moment-response" aria-label={c.answerHint}>
        {[['going', c.going], ['maybe', c.maybe], ['not_going', c.notGoing]].map(([status, label]) => <button key={status} type="button" className={moment.myResponse === status ? 'selected' : ''} aria-pressed={moment.myResponse === status} disabled={working} onClick={() => run(() => onRespond(moment.id, status))}>{label}</button>)}
      </div>
      <small className="moment-helper">{c.answerHint}</small>
    </>}
    {owner && <div className="moment-actions">
      {moment.status === 'planned' && <><button className="muted-button" type="button" onClick={() => setEditing(true)} disabled={working}><Pencil size={15} aria-hidden="true" />{c.edit}</button><button className="muted-button success-action" type="button" onClick={() => run(() => onSetStatus(moment.id, 'completed'))} disabled={working}><Check size={15} aria-hidden="true" />{c.complete}</button><button className="muted-button danger-action" type="button" onClick={() => run(() => onSetStatus(moment.id, 'cancelled'))} disabled={working}><X size={15} aria-hidden="true" />{c.cancelPlan}</button></>}
      {moment.status !== 'planned' && <button className="muted-button" type="button" onClick={() => run(() => onSetStatus(moment.id, 'planned'))} disabled={working}><ChevronRight size={15} aria-hidden="true" />{c.reopen}</button>}
    </div>}
    {moment.status === 'completed' && <>
      {!addingMemory ? <div className="memory-open"><p>{c.memoryHint}</p><button className="muted-button" type="button" onClick={() => setAddingMemory(true)}><HeartHandshake size={16} aria-hidden="true" />{c.memory}</button></div> : <MemoryComposer language={language} onCancel={() => setAddingMemory(false)} onSave={async (values) => { await onAddMemory(moment, values); setAddingMemory(false) }} />}
    </>}
    {error && <p className="form-error" role="alert">{error}</p>}
  </article>
}

export function TogetherPageV2({ language, moments, memories, userId, onCreateMoment, onRespond, onUpdateMoment, onSetMomentStatus, onCreateMemory }) {
  const c = copyFor(language)
  const [creating, setCreating] = useState(false)
  const planned = moments.filter((moment) => moment.status === 'planned')
  const completed = moments.filter((moment) => moment.status === 'completed')
  const cancelled = moments.filter((moment) => moment.status === 'cancelled')

  return <>
    <motion.section className="page-intro" {...fadeUp}>
      <div><p className="eyebrow">{c.eyebrow}</p><h1>{c.heading}</h1><p className="lead">{c.lead}</p></div>
      <button className="primary-button" type="button" onClick={() => setCreating(true)}><Plus size={18} aria-hidden="true" />{c.create}</button>
    </motion.section>
    {creating && <MomentComposer language={language} onCancel={() => setCreating(false)} onSave={async (values) => { await onCreateMoment(values); setCreating(false) }} />}
    <motion.section className="together-section" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }}>
      <div className="section-heading"><div><p className="eyebrow">{c.eyebrow}</p><h2>{c.upcoming}</h2></div><span className="count-pill"><HeartHandshake size={15} aria-hidden="true" />{planned.length}</span></div>
      {planned.length ? <div className="moment-grid">{planned.map((moment) => <MomentCard key={moment.id} language={language} moment={moment} userId={userId} onRespond={onRespond} onUpdate={onUpdateMoment} onSetStatus={onSetMomentStatus} onAddMemory={onCreateMemory} />)}</div> : <div className="together-empty"><HeartHandshake size={27} aria-hidden="true" /><h3>{c.empty}</h3><p>{c.emptyNote}</p></div>}
    </motion.section>
    {completed.length > 0 && <section className="together-section"><div className="section-heading"><div><p className="eyebrow">{c.eyebrow}</p><h2>{c.completed}</h2></div></div><div className="moment-grid">{completed.map((moment) => <MomentCard key={moment.id} language={language} moment={moment} userId={userId} onRespond={onRespond} onUpdate={onUpdateMoment} onSetStatus={onSetMomentStatus} onAddMemory={onCreateMemory} />)}</div></section>}
    {cancelled.length > 0 && <section className="together-section cancelled-section"><div className="section-heading"><div><p className="eyebrow">{c.eyebrow}</p><h2>{c.cancelled}</h2></div></div><div className="moment-grid">{cancelled.map((moment) => <MomentCard key={moment.id} language={language} moment={moment} userId={userId} onRespond={onRespond} onUpdate={onUpdateMoment} onSetStatus={onSetMomentStatus} onAddMemory={onCreateMemory} />)}</div></section>}
    <section className="memory-section"><div className="section-heading"><div><p className="eyebrow">{c.eyebrow}</p><h2>{c.memories}</h2></div><HeartHandshake className="heading-icon" size={22} aria-hidden="true" /></div>{memories.length ? <div className="memory-grid">{memories.map((memory) => <article className="memory-card" key={memory.id}><div className="memory-photo-placeholder"><HeartHandshake size={25} aria-hidden="true" /></div><div><p>{memory.caption}</p><small>{memory.authorName || (language === 'ru' ? 'Член семьи' : 'Household member')}</small></div></article>)}</div> : <div className="memory-empty"><HeartHandshake size={25} aria-hidden="true" /><p>{c.noMemories}</p></div>}</section>
  </>
}
