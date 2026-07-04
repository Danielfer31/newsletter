import Link from 'next/link'

export interface MapHeroProps {
  title: string
  subtitle: string
  eyebrow?: string
  compact?: boolean
  ctaLabel?: string
  ctaHref?: string
}

export default function MapHero({
  title,
  subtitle,
  eyebrow,
  compact = false,
  ctaLabel,
  ctaHref,
}: MapHeroProps) {
  return (
    <section className="paper-map-bg overflow-hidden border-b border-line">
      <div
        className={[
          'editorial-shell relative grid items-center gap-10',
          compact ? 'min-h-80 py-14' : 'min-h-[34rem] py-20 md:grid-cols-[1fr_0.8fr] md:py-24',
        ].join(' ')}
      >
        <div className="relative z-10 max-w-3xl">
          {eyebrow ? <p className="ui-label mb-5">{eyebrow}</p> : null}
          <h1 className="serif-title text-5xl leading-[0.98] text-ink md:text-7xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-soft md:text-xl">{subtitle}</p>
          {ctaLabel && ctaHref ? (
            <Link
              href={ctaHref}
              className="mt-8 inline-flex border border-ink px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-gold hover:text-sepia"
            >
              {ctaLabel}
            </Link>
          ) : null}
        </div>

        <div
          className={[
            'pointer-events-none relative hidden text-sepia md:block',
            compact ? 'h-44' : 'h-80',
          ].join(' ')}
          aria-hidden="true"
        >
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 520 360" fill="none">
            <path
              d="M48 240C116 184 165 301 238 224C306 152 346 221 456 96"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="6 9"
              opacity="0.42"
            />
            <path
              d="M78 70C143 119 178 64 239 108C303 154 342 78 435 134"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.24"
            />
            <path
              d="M132 296C177 250 211 276 244 246C291 204 330 237 378 184"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.24"
            />
            <circle cx="238" cy="224" r="9" stroke="currentColor" strokeWidth="1" opacity="0.42" />
            <circle cx="456" cy="96" r="13" stroke="currentColor" strokeWidth="1" opacity="0.34" />
            <path d="M410 260l19-54 19 54-19-12-19 12Z" stroke="currentColor" strokeWidth="1" opacity="0.38" />
            <path d="M429 218v30M414 248h30" stroke="currentColor" strokeWidth="1" opacity="0.32" />
            {Array.from({ length: 7 }).map((_, index) => (
              <path
                key={`v-${index}`}
                d={`M${70 + index * 62} 36v286`}
                stroke="currentColor"
                strokeWidth="0.6"
                opacity="0.12"
              />
            ))}
            {Array.from({ length: 5 }).map((_, index) => (
              <path
                key={`h-${index}`}
                d={`M42 ${62 + index * 58}h430`}
                stroke="currentColor"
                strokeWidth="0.6"
                opacity="0.12"
              />
            ))}
          </svg>
        </div>
      </div>
    </section>
  )
}
