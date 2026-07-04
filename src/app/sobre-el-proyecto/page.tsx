import type { Metadata } from 'next'
import Link from 'next/link'
import {
  CategoryCard,
  EditorialFooter,
  MapHero,
  SiteHeader,
} from '@/components/editorial'
import { CATEGORY_ORDER } from '@/lib/categories'
import SubscribeForm from './SubscribeForm'

const SUBSCRIBE_HREF = '/sobre-el-proyecto#suscripcion'

export const metadata: Metadata = {
  title: 'Sobre el proyecto | La Biblioteca de Apolo',
  description:
    'Manifiesto editorial de La Biblioteca de Apolo, una newsletter cultural independiente construida como un mapa de obsesiones.',
}

export default function SobreElProyectoPage() {
  return (
    <main className="paper-page min-h-screen">
      <SiteHeader activeHref="/sobre-el-proyecto" subscribeHref={SUBSCRIBE_HREF} />

      <MapHero
        compact
        title="Sobre el proyecto"
        subtitle="Una newsletter cultural independiente escrita como quien dibuja un mapa: con dudas, desvío y una fe tranquila en las conexiones."
      />

      <section className="editorial-shell py-10 md:py-14" aria-labelledby="manifesto-title">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <article className="max-w-3xl">
            <p className="ui-label">Manifiesto editorial</p>
            <h1 id="manifesto-title" className="serif-title mt-3 text-4xl font-medium leading-tight text-ink md:text-5xl">
              La Biblioteca de Apolo es un mapa de obsesiones, no una fábrica de actualidad.
            </h1>

            <div className="mt-8 space-y-6 font-serif text-xl leading-9 text-ink-soft">
              <p>
                Este proyecto nace de una intuición simple: leer el mundo exige trazar rutas. A veces la ruta pasa por una
                elección, una frontera o un libro viejo; otras veces por un gol, una canción, una escena de anime o una
                mesa de rol que deja pensando más de lo previsto.
              </p>
              <p>
                No busca cubrirlo todo. Prefiere detenerse donde algo vibra, mirar con paciencia y convertir esa
                insistencia en una nota legible. Cada edición intenta ordenar un pedazo de ruido sin quitarle su misterio.
              </p>
              <p>
                La promesa es sobria: ensayos, apuntes y recorridos culturales escritos en primera persona, con la
                libertad de una libreta y la disciplina de un archivo.
              </p>
            </div>

            <blockquote className="mt-10 border-l border-gold pl-5 font-serif text-2xl italic leading-9 text-ink">
              Una revista/newsletter cultural independiente construida como un mapa de obsesiones.
            </blockquote>
          </article>

          <aside className="border-l border-line pl-5">
            <p className="ui-label mb-3">Coordenadas</p>
            <dl className="space-y-5 text-sm leading-6">
              <div>
                <dt className="font-semibold text-ink">Frecuencia</dt>
                <dd className="mt-1 text-ink-soft">Una entrega cuando el mapa tiene una ruta clara.</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Tono</dt>
                <dd className="mt-1 text-ink-soft">Editorial, personal, cultural, sin estridencia.</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Método</dt>
                <dd className="mt-1 text-ink-soft">Conectar temas que parecen lejanos hasta que aparece el camino.</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section id="suscripcion" className="editorial-shell pb-12 md:pb-16" aria-labelledby="subscribe-title">
        <div className="grid overflow-hidden border border-line bg-paper-soft md:grid-cols-[minmax(0,1fr)_0.9fr]">
          <div className="paper-map-bg p-7 md:p-9">
            <p className="ui-label">Suscripción local</p>
            <h2 id="subscribe-title" className="serif-title mt-3 text-4xl font-medium leading-tight text-ink">
              Recibir la próxima edición
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-ink-soft">
              Deja tu correo para probar el flujo de suscripción. Por ahora queda simulado en la página, sin base de
              datos y sin servicios externos.
            </p>
          </div>

          <div className="border-t border-line bg-paper p-7 md:border-l md:border-t-0 md:p-9">
            <SubscribeForm />
          </div>
        </div>
      </section>

      <section className="editorial-shell pb-16 md:pb-20" aria-labelledby="routes-title">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-4">
          <div>
            <p className="ui-label">Rutas de lectura</p>
            <h2 id="routes-title" className="serif-title mt-2 text-3xl font-medium text-ink">
              Las obsesiones que ordenan el mapa
            </h2>
          </div>
          <Link href="/categorias" className="text-sm font-semibold text-sepia transition-colors hover:text-ink">
            Ver atlas completo
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {CATEGORY_ORDER.map((category) => (
            <CategoryCard key={category} category={category} href={`/categorias?categoria=${category}`} />
          ))}
        </div>
      </section>

      <EditorialFooter subscribeHref={SUBSCRIBE_HREF} />
    </main>
  )
}
