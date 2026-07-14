import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, CircleCheck, HandHeart, Heart, Plus, Save, UsersRound, X } from 'lucide-react'

const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.34 } }

const copyFor = (language) => language === 'ru' ? {
  eyebrow: 'МАЛЕНЬКИЕ ПРОСЬБЫ',
  heading: 'Легче, когда можно попросить.',
  lead: 'Оставьте небольшую просьбу. Кто-то из семьи может взять её на себя — без обязательств и списков долгов.',
  create: 'Попросить о помощи',
  compose: 'О чём попросить?',
  title: 'Коротко',
  titlePlaceholder: 'Например: забрать посылку в четверг',
  description: 'Немного деталей (необязательно)',
  descriptionPlaceholder: 'Что поможет человеку понять просьбу?',
  save: 'Опубликовать просьбу',
  saving: 'Сохраняем...',
  cancel: 'Отмена',
  open: 'Нужна поддержка',
  claimed: 'Уже помогают',
  completed: 'Сделано с заботой',
  cancelled: 'Закрытые просьбы',
  empty: 'Пока всё спокойно.',
  emptyNote: 'Когда понадобится поддержка, оставьте здесь одну маленькую просьбу.',
  askedBy: 'Просит',
  helping: 'Помогает',
  claim: 'Я возьму это',
  claimedByYou: 'Вы помогаете с этим',
  done: 'Я сделал(а) это',
  thank: 'Сказать спасибо',
  thanked: 'Спасибо уже сказано',
  cancelAsk: 'Закрыть просьбу',
  waiting: 'Ждёт того, кому это по силам.',
  error: 'Не удалось сохранить. Попробуйте ещё раз.',
  status: { open: 'Открыто', claimed: 'В работе', completed: 'Готово', cancelled: 'Закрыто' },
} : {
  eyebrow: 'SMALL ASKS',
  heading: 'It is easier when you can ask.',
  lead: 'Leave a small request. Someone in your household can take it on — no pressure, no scorekeeping.',
  create: 'Ask for help',
  compose: 'What would help?',
  title: 'In a few words',
  titlePlaceholder: 'For example: pick up a parcel on Thursday',
  description: 'A little context (optional)',
  descriptionPlaceholder: 'What would help someone understand the ask?',
  save: 'Share this ask',
  saving: 'Saving...',
  cancel: 'Cancel',
  open: 'Needs support',
  claimed: 'Someone is helping',
  completed: 'Done with care',
  cancelled: 'Closed asks',
  empty: 'Everything is calm for now.',
  emptyNote: 'When you need a hand, leave one small request here.',
  askedBy: 'Asked by',
  helping: 'Helping',
  claim: 'I’ll take this',
  claimedByYou: 'You are helping with this',
  done: 'I did this',
  thank: 'Say thank you',
  thanked: 'Thank you sent',
  cancelAsk: 'Close ask',
  waiting: 'Waiting for someone who has the space to help.',
  error: 'Could not save that. Please try again.',
  status: { open: 'Open', claimed: 'In progress', completed: 'Done', cancelled: 'Closed' },
}

function AskComposer({ language, onSave, onCancel }) {
  const c = copyFor(language)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave({ title, description })
    } catch {
      setError(c.error)
    } finally {
      setSaving(false)
    }
  }

  return <section className="ask-composer card">
    <div><p className="eyebrow">{c.eyebrow}</p><h2>{c.compose}</h2><p>{c.lead}</p></div>
    <form onSubmit={submit}>
      <label htmlFor="ask-title">{c.title}<input id="ask-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder={c.titlePlaceholder} required minLength="2" maxLength="140" disabled={saving} autoFocus /></label>
      <label htmlFor="ask-description">{c.description}<textarea id="ask-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder={c.descriptionPlaceholder} maxLength="280" disabled={saving} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="ask-form-actions"><button className="muted-button" type="button" onClick={onCancel} disabled={saving}>{c.cancel}</button><button className="primary-button" type="submit" disabled={saving}><Save size={17} aria-hidden="true" />{saving ? c.saving : c.save}</button></div>
    </form>
  </section>
}

function AskCard({ language, ask, userId, onClaim, onComplete, onThank, onCancel }) {
  const c = copyFor(language)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const isRequester = ask.created_by === userId
  const isClaimer = ask.claimed_by === userId

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

  return <article className={`ask-card ${ask.status}`}>
    <div className="ask-card-top"><span className={`ask-status ${ask.status}`}>{ask.status === 'completed' ? <CircleCheck size={14} aria-hidden="true" /> : <HandHeart size={14} aria-hidden="true" />}{c.status[ask.status]}</span></div>
    <h3>{ask.title}</h3>
    {ask.description && <p>{ask.description}</p>}
    <div className="ask-people"><span><UsersRound size={15} aria-hidden="true" />{c.askedBy} {ask.requesterName || (language === 'ru' ? 'член семьи' : 'a household member')}</span>{ask.claimed_by && <span><HandHeart size={15} aria-hidden="true" />{c.helping} {ask.claimantName || (language === 'ru' ? 'член семьи' : 'a household member')}</span>}</div>
    {ask.status === 'open' && <div className="ask-action-area">{isRequester ? <small>{c.waiting}</small> : <button className="primary-button" type="button" onClick={() => run(() => onClaim(ask.id))} disabled={working}><HandHeart size={17} aria-hidden="true" />{c.claim}</button>}{isRequester && <button className="muted-button danger-action" type="button" onClick={() => run(() => onCancel(ask.id))} disabled={working}><X size={15} aria-hidden="true" />{c.cancelAsk}</button>}</div>}
    {ask.status === 'claimed' && <div className="ask-action-area">{isClaimer ? <button className="primary-button" type="button" onClick={() => run(() => onComplete(ask.id))} disabled={working}><Check size={17} aria-hidden="true" />{c.done}</button> : <small>{ask.claimantName || (language === 'ru' ? 'Член семьи' : 'A household member')} {language === 'ru' ? 'уже помогает с этим.' : 'is already helping with this.'}</small>}{isRequester && <button className="muted-button danger-action" type="button" onClick={() => run(() => onCancel(ask.id))} disabled={working}><X size={15} aria-hidden="true" />{c.cancelAsk}</button>}</div>}
    {ask.status === 'completed' && <div className="ask-action-area">{ask.thanked_at ? <span className="thank-you-note"><Heart size={16} aria-hidden="true" />{c.thanked}</span> : isRequester ? <button className="muted-button thank-action" type="button" onClick={() => run(() => onThank(ask.id))} disabled={working}><Heart size={16} aria-hidden="true" />{c.thank}</button> : <small>{c.thanked}</small>}</div>}
    {error && <p className="form-error" role="alert">{error}</p>}
  </article>
}

export function AsksPage({ language, asks, userId, onCreateAsk, onClaimAsk, onCompleteAsk, onThankAsk, onCancelAsk }) {
  const c = copyFor(language)
  const [creating, setCreating] = useState(false)
  const byStatus = (status) => asks.filter((ask) => ask.status === status)
  const sections = [[c.open, 'open'], [c.claimed, 'claimed'], [c.completed, 'completed'], [c.cancelled, 'cancelled']]

  return <>
    <motion.section className="page-intro" {...fadeUp}><div><p className="eyebrow">{c.eyebrow}</p><h1>{c.heading}</h1><p className="lead">{c.lead}</p></div><button className="primary-button" type="button" onClick={() => setCreating(true)}><Plus size={18} aria-hidden="true" />{c.create}</button></motion.section>
    {creating && <AskComposer language={language} onCancel={() => setCreating(false)} onSave={async (values) => { await onCreateAsk(values); setCreating(false) }} />}
    {sections.map(([title, status], index) => { const items = byStatus(status); if (status !== 'open' && items.length === 0) return null; return <motion.section className={`asks-section ${status}`} key={status} {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 + index * 0.05 }}><div className="section-heading"><div><p className="eyebrow">{c.eyebrow}</p><h2>{title}</h2></div><span className="count-pill"><HandHeart size={15} aria-hidden="true" />{items.length}</span></div>{items.length ? <div className="ask-grid">{items.map((ask) => <AskCard key={ask.id} language={language} ask={ask} userId={userId} onClaim={onClaimAsk} onComplete={onCompleteAsk} onThank={onThankAsk} onCancel={onCancelAsk} />)}</div> : <div className="asks-empty"><HandHeart size={27} aria-hidden="true" /><h3>{c.empty}</h3><p>{c.emptyNote}</p></div>}</motion.section> })}
  </>
}
