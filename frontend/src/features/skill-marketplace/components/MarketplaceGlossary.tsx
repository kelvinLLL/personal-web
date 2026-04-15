const glossaryItems = [
  {
    question: 'What is a skill?',
    answer:
      'A reusable workflow prompt or playbook that helps an agent approach a recurring kind of task.',
  },
  {
    question: 'What is a plugin?',
    answer:
      'A packaged extension or capability bundle that adds tools, platform context, or integrated workflows.',
  },
  {
    question: 'What counts as a curated pick?',
    answer:
      'An external tool that earned a place on the shelf because it meaningfully improves discovery, verification, or execution.',
  },
  {
    question: 'Why separate personal and community entries?',
    answer:
      'Personal entries reflect lived workflow value. Community entries reflect research and curation value.',
  },
  {
    question: 'What does compatibility mean here?',
    answer:
      'It describes which agent or tooling ecosystems the entry is most relevant to today.',
  },
]

export function MarketplaceGlossary() {
  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm md:p-8">
      <div className="max-w-3xl space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">
          Glossary / FAQ
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
          Plain-language framing for a catalog that will keep growing.
        </h2>
        <p className="text-sm leading-7 text-stone-600 sm:text-base">
          The glossary keeps the surface understandable even as the catalog expands beyond one
          artifact type.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {glossaryItems.map((item) => (
          <article
            key={item.question}
            className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 px-5 py-5"
          >
            <h3 className="text-base font-semibold text-stone-900">{item.question}</h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
