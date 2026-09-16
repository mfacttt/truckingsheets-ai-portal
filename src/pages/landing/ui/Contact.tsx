import { CONTACT_EMAIL, TELEGRAM_CALL_URL, TELEGRAM_CHAT_URL } from '@/shared/config/constants'
import '@/pages/contact/ui/contact.css'

const CHANNELS = [
  {
    key: 'chat',
    title: 'Chat with us',
    body: 'Questions about connecting your sheet, a week that looks wrong, or billing — message us directly.',
    cta: 'Open chat',
    href: TELEGRAM_CHAT_URL,
    tone: 'chat',
  },
  {
    key: 'community',
    title: 'Email the team',
    body: 'Prefer it in writing? Send the sheet and the week you are looking at, and we will reply with what we find.',
    cta: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    tone: 'community',
  },
  {
    key: 'call',
    title: 'Get on a call',
    body: 'Rolling this out across a fleet, or comparing dispatchers before a decision? Grab a call with the team.',
    cta: 'Request a call',
    href: TELEGRAM_CALL_URL,
    tone: 'call',
  },
] as const

export function Contact() {
  return (
    <section className="section" id="contact">
      <div className="wrap contact-wrap">
        <div className="section-head section-head-center rv">
          <p className="eyebrow">Support</p>
          <h2>Talk to a human, not a ticket queue</h2>
          <p>Pick whatever&apos;s easiest — all three land with the same team, usually within the hour.</p>
        </div>
        <div className="contact-grid rv">
          {CHANNELS.map((c) => (
            <a
              key={c.key}
              href={c.href}
              {...(c.href.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
              className={`contact-card contact-${c.tone}`}
            >
              <span className="contact-ic" aria-hidden="true">
                <ChannelIcon tone={c.tone} />
              </span>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
              <span className="contact-cta">
                {c.cta}
                <ArrowIcon />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true" focusable="false">
      <path d="M4 10h11m0 0-4.5-4.5M15 10l-4.5 4.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChannelIcon({ tone }: { tone: 'chat' | 'community' | 'call' }) {
  if (tone === 'chat') {
    return (
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M21.94 4.6 18.9 19.02c-.23 1.01-.83 1.26-1.68.79l-4.64-3.42-2.24 2.16c-.25.25-.46.46-.94.46l.33-4.73 8.6-7.77c.38-.33-.08-.52-.58-.19L7.12 13.02 2.54 11.6c-1-.31-1.01-1 .21-1.48l17.9-6.9c.83-.3 1.55.2 1.29 1.38Z" />
      </svg>
    )
  }
  if (tone === 'community') {
    return (
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4.24-8 4.5-8-4.5V6l8 4.5L20 6v2.24Z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M6.6 10.8c1.4 2.75 3.85 5.2 6.6 6.6l2.2-2.2c.28-.28.68-.36 1.03-.24 1.13.37 2.35.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.22.2 2.44.57 3.57.11.35.03.75-.25 1.03l-2.22 2.2Z" />
    </svg>
  )
}
