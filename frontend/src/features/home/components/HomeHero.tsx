import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Bot, BookOpenText, Sparkles } from 'lucide-react'
import heroImage from '@/assets/hero.png'
import { buttonVariants } from '@/components/ui/button-variants'
import { aliyunPublicServiceUrl } from '@/core/site/deployment'
import { siteRoutes } from '@/core/site/routes'

export function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-lg border border-zinc-200 bg-zinc-950 text-white shadow-sm">
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="relative z-10 grid gap-8 px-6 py-10 md:grid-cols-[1.15fr_0.85fr] md:px-8 md:py-12">
        <div className="flex min-w-0 flex-col justify-between gap-8">
          <div className="space-y-6">
            <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-200">
              <Sparkles className="size-4 text-blue-300" aria-hidden="true" />
              Unified Personal Web
            </div>

            <div className="max-w-3xl space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-white">
                Kelvin's Creative Lab
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-zinc-200">
                A quieter front door for reading notes, book files, personal skills, and the
                SuperHaojun agent surface.
              </p>
              <p className="max-w-2xl text-sm leading-7 text-zinc-400">
                Open the notebook, continue a book, or jump into the tool that matches the work.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to={siteRoutes.readingJournal}
              className={buttonVariants({
                variant: 'default',
                className:
                  'min-h-11 gap-2 bg-white px-4 text-zinc-950 hover:bg-zinc-200 focus-visible:ring-white/40',
              })}
            >
              Open Reading Journal
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              to={siteRoutes.bookReader}
              className={buttonVariants({
                variant: 'outline',
                className:
                  'min-h-11 gap-2 border-white/20 bg-white/5 px-4 text-white hover:bg-white/10 hover:text-white focus-visible:ring-white/40',
              })}
            >
              Open Book Reader
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a
              href={aliyunPublicServiceUrl}
              data-app-boundary="external"
              className={buttonVariants({
                variant: 'outline',
                className:
                  'min-h-11 gap-2 border-blue-300/35 bg-blue-300/10 px-4 text-blue-50 hover:bg-blue-300/18 hover:text-white focus-visible:ring-blue-200/50',
              })}
            >
              Open Aliyun Service
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="grid gap-4 md:content-between">
          <div className="rounded-lg border border-white/10 bg-white/7 p-4">
            <img
              src={heroImage}
              alt="Layered abstract interface tile for Kelvin's Creative Lab"
              width={343}
              height={361}
              className="mx-auto aspect-square max-h-64 w-full max-w-64 object-contain"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/7 p-4">
              <div className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-white">
                <BookOpenText className="size-4 text-blue-300" aria-hidden="true" />
                Calm Reading
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                The incumbent reader stays easy to reach from the unified site.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/7 p-4">
              <div className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-white">
                <Bot className="size-4 text-emerald-300" aria-hidden="true" />
                Agent Surface
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                SuperHaojun remains a deliberate launch boundary for deeper work.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
