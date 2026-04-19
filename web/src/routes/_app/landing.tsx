import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowRight,
  Calculator,
  Check,
  ChevronDown,
  Database,
  FileText,
  GitCompare,
  Shield,
  Upload,
} from 'lucide-react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_app/landing')({
  component: MinimalistLanding,
})

type Locality = {
  id: string
  label: string
  kind: string
  priceMultiplier: number
}

type ModulePlan = {
  tag: string
  title: string
  subtitle: string
  basePrice: number
  points: string[]
  cta: string
}

const benefits = [
  {
    title: 'Direct state-to-local connection',
    desc: 'TerrasyncCRM creates a direct operational bridge between the state registry and your local system instead of forcing teams to reconcile data in disconnected spreadsheets.',
  },
  {
    title: 'Anomaly detection with real workflow value',
    desc: 'Flag suspicious records, missing fields, ownership conflicts, and mismatches before they distort reports or tax calculations.',
  },
  {
    title: 'Reports ready for operations and management',
    desc: 'Build clear discrepancy, integrity, and workload reports without manually collecting evidence from multiple tools.',
  },
  {
    title: 'Tax calculation in the same control layer',
    desc: 'Use synchronized land and realty data to estimate tax exposure and planning scenarios without leaving the platform.',
  },
]

const processSteps = [
  {
    step: '1',
    title: 'Connect and ingest',
    desc: 'Upload DRRP files and connect the state registry flow with your local working base for land and realty records.',
  },
  {
    step: '2',
    title: 'Detect and reconcile',
    desc: 'TerrasyncCRM normalizes records, detects anomalies, surfaces conflicts, and shows exactly what must be resolved first.',
  },
  {
    step: '3',
    title: 'Report and calculate',
    desc: 'Generate reports and run tax-oriented calculations on synchronized records once data integrity is under control.',
  },
]

const features = [
  {
    icon: Database,
    num: '01',
    title: 'Registry Sync Layer',
    desc: 'Create a direct connection between the state registry and the local operational base.',
  },
  {
    icon: Upload,
    num: '02',
    title: 'Spreadsheet Upload',
    desc: 'Import DRRP source files with preview, validation, and processing control before records enter the workflow.',
  },
  {
    icon: AlertTriangle,
    num: '03',
    title: 'Anomaly Tracking',
    desc: 'Monitor suspicious records, unresolved cases, and operational exceptions in one dedicated anomaly stream.',
  },
  {
    icon: FileText,
    num: '04',
    title: 'Reports Workspace',
    desc: 'Generate discrepancy and management reports for teams, supervisors, and municipality leadership.',
  },
  {
    icon: Calculator,
    num: '05',
    title: 'Tax Calculation',
    desc: 'Estimate tax potential and tax-sensitive scenarios from synchronized and reviewed land and realty datasets.',
  },
  {
    icon: GitCompare,
    num: '06',
    title: 'Conflict Resolution',
    desc: 'Compare registry and local records side by side to resolve mismatches field by field.',
  },
]

const stats = [
  { stat: '2', label: 'Connected Systems', sub: 'State Registry + Local Base' },
  { stat: '3', label: 'Core Functions', sub: 'Anomalies, Reports, Tax Calculation' },
  { stat: '11', label: 'Locality Presets', sub: 'Lviv region pricing logic' },
  { stat: '50 MB', label: 'Upload Limit', sub: 'Per source file' },
]

const localities: Locality[] = [
  { id: 'lviv', label: 'Lviv', kind: 'city', priceMultiplier: 1 },
  { id: 'drohobych', label: 'Drohobych', kind: 'city', priceMultiplier: 0.93 },
  { id: 'stryi', label: 'Stryi', kind: 'city', priceMultiplier: 0.9 },
  { id: 'sheptytskyi', label: 'Sheptytskyi', kind: 'city', priceMultiplier: 0.88 },
  { id: 'truskavets', label: 'Truskavets', kind: 'city', priceMultiplier: 0.84 },
  { id: 'slavske', label: 'Slavske', kind: 'settlement', priceMultiplier: 0.76 },
  { id: 'skhidnytsia', label: 'Skhidnytsia', kind: 'settlement', priceMultiplier: 0.72 },
  { id: 'briukhovychi', label: 'Bryukhovychi', kind: 'settlement', priceMultiplier: 0.7 },
  { id: 'sokilnyky', label: 'Sokilnyky', kind: 'village', priceMultiplier: 0.66 },
  { id: 'pidberiztsi', label: 'Pidberiztsi', kind: 'village', priceMultiplier: 0.58 },
  { id: 'urych', label: 'Urych', kind: 'village', priceMultiplier: 0.5 },
]

const modulePlans: ModulePlan[] = [
  {
    tag: 'FOR GOOD START',
    title: '35$/ month',
    subtitle: 'Anomaly control and state-to-local sync',
    basePrice: 35,
    points: [
      'Direct registry-to-local connection',
      'Anomaly detection stream',
      'Spreadsheet preview before upload',
      'Basic discrepancy monitoring',
      'Operational upload statistics',
      'One municipality workspace',
    ],
    cta: 'start free trial',
  },
  {
    tag: 'MOST POPULAR',
    title: '95$/ month',
    subtitle: 'Reports and reconciliation workflow',
    basePrice: 95,
    points: [
      'Everything in the starter layer',
      'Conflict reports for teams and managers',
      'Field-by-field comparison views',
      'Bulk discrepancy review workflow',
      'Export-ready operational summaries',
      'Extended audit visibility',
    ],
    cta: 'start free trial',
  },
  {
    tag: 'ENTERPRISE',
    title: '165$/ month',
    subtitle: 'Tax calculation and full local planning layer',
    basePrice: 165,
    points: [
      'Everything in the reports layer',
      'Tax calculation scenarios',
      'Location-aware pricing and modeling',
      'Expanded integrity monitoring',
      'Advanced municipality use cases',
      'Priority rollout support',
    ],
    cta: 'contact sales',
  },
]

const faq = [
  {
    question: 'How does the direct connection between the state registry and the local base work?',
    answer:
      'TerrasyncCRM aligns registry records and local records in one workflow so operators can see matched entries, conflicts, and unresolved gaps without switching between disconnected tools.',
  },
  {
    question: 'What kinds of anomalies can the platform detect?',
    answer:
      'The anomaly layer highlights duplicates, incomplete records, ownership inconsistencies, suspicious changes, and conflicts between the state registry and the local base.',
  },
  {
    question: 'What reports can be generated inside the system?',
    answer:
      'Teams can generate discrepancy reports, anomaly summaries, workload snapshots, and management-ready integrity reports directly from the synchronized dataset.',
  },
  {
    question: 'How is tax calculation supported in TerrasyncCRM?',
    answer:
      'Tax calculation uses synchronized land and realty records as the operational base, helping municipalities estimate tax-sensitive scenarios after the data has been reconciled.',
  },
  {
    question: 'Why does pricing depend on the selected locality?',
    answer:
      'The smaller the locality, the smaller the expected operational load and record volume. That is why smaller settlements and villages receive automatically lower pricing.',
  },
  {
    question: 'Which file formats can be imported into the platform?',
    answer:
      'TerrasyncCRM supports .csv, .xls, and .xlsx uploads up to 50 MB with preview, validation checks, and processing statistics.',
  },
]

function MinimalistLanding() {
  const [selectedLocalityId, setSelectedLocalityId] = useState('lviv')
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  const selectedLocality = useMemo(
    () => localities.find((item) => item.id === selectedLocalityId) ?? localities[0],
    [selectedLocalityId],
  )

  const modules = useMemo(
    () =>
      modulePlans.map((plan) => ({
        ...plan,
        title: `${Math.max(19, Math.round(plan.basePrice * selectedLocality.priceMultiplier))}$/ month`,
      })),
    [selectedLocality.priceMultiplier],
  )

  return (
    <div className="min-h-screen bg-white pb-24 font-body text-black selection:bg-black selection:text-white">
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <section className="relative flex min-h-[85vh] flex-col justify-center border-b-[4px] border-black px-6 py-24 md:px-12">
        <div className="relative z-10 mx-auto mt-16 w-full max-w-[72rem]">
          <h1 className="mb-10 font-serif text-6xl leading-none tracking-tighter md:text-8xl lg:text-9xl">
            Terrasync
            <br />
            <span className="font-light italic">CRM.</span>
          </h1>
          <div className="grid grid-cols-1 items-end gap-8 md:grid-cols-12">
            <div className="md:col-span-8">
              <p className="max-w-2xl font-serif text-xl leading-relaxed text-[#525252] md:text-2xl">
                Direct connection between the state registry and the local base for anomaly detection, reporting, and
                tax calculation in one municipality control center.
              </p>
            </div>
            <div className="flex md:col-span-4 md:justify-end">
              <button className="flex items-center gap-4 border-[3px] border-transparent bg-black px-8 py-4 text-sm font-medium uppercase tracking-widest text-white transition-none hover:border-black hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-black focus-visible:outline-offset-[3px]">
                Open Platform
                <ArrowRight size={20} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b-[4px] border-black px-6 py-24 md:px-12 md:py-32">
        <div className="mx-auto w-full max-w-[72rem]">
          <div className="mb-16 flex items-center gap-4 md:mb-24">
            <span className="font-mono text-xs uppercase tracking-[0.1em]">Benefits</span>
            <div className="h-[1px] flex-1 bg-black" />
          </div>

          <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
            <div className="md:col-span-5">
              <h2 className="sticky top-12 font-serif text-5xl leading-tight tracking-tight md:text-6xl">
                Why municipalities need this system
                <span className="mt-6 block font-body text-xl text-[#525252] md:text-2xl">
                  Clean links between registry data, local operations, and tax-driven decisions
                </span>
              </h2>
            </div>

            <div className="flex flex-col gap-12 md:col-span-7">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="group flex cursor-default gap-6">
                  <div className="mt-1 shrink-0">
                    <div className="flex h-6 w-6 items-center justify-center border-[1.5px] border-black transition-colors duration-100 group-hover:bg-black group-hover:text-white">
                      <Check size={16} strokeWidth={2} />
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-3 font-serif text-2xl font-bold">{benefit.title}</h3>
                    <p className="text-lg leading-relaxed text-[#525252]">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-b-[4px] border-black bg-[#F5F5F5] px-6 py-24 md:px-12 md:py-32">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.01]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, #000 40px, #000 42px)',
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-[72rem]">
          <div className="mb-24 flex items-center gap-4">
            <span className="font-mono text-xs uppercase tracking-[0.1em]">Process</span>
            <div className="h-[1px] flex-1 bg-black" />
          </div>

          <div className="mb-24 text-center">
            <h2 className="mb-6 font-serif text-5xl tracking-tight md:text-6xl">How TerrasyncCRM works</h2>
            <p className="text-xl text-[#525252]">
              From source connection to reporting and tax-oriented review in three steps.
            </p>
          </div>

          <div className="relative grid grid-cols-1 gap-12 text-center md:grid-cols-3">
            <div className="absolute left-[16.66%] right-[16.66%] top-10 z-0 hidden h-[2px] bg-black md:block" />

            {processSteps.map((item) => (
              <div key={item.step} className="relative z-10 flex flex-col items-center">
                <div className="mb-8 flex h-20 w-20 items-center justify-center border-[2px] border-black bg-white font-mono text-2xl">
                  {item.step}
                </div>
                <h3 className="mb-4 font-serif text-2xl font-bold">{item.title}</h3>
                <p className="max-w-sm leading-relaxed text-[#525252]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b-[4px] border-black px-6 py-24 md:px-12 md:py-32">
        <div className="mx-auto w-full max-w-[72rem]">
          <h2 className="mb-16 font-serif text-4xl tracking-tight md:text-5xl">Core functionality</h2>

          <div className="grid grid-cols-1 border-l border-t border-black md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.num}
                  className="flex min-h-[320px] h-full flex-col border-b border-r border-black p-10 transition-colors duration-100 hover:bg-[#F5F5F5]"
                >
                  <div className="mb-8 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center border border-black bg-white transition-colors duration-100 group-hover:bg-black group-hover:text-white">
                      <Icon size={20} strokeWidth={1.5} />
                    </div>
                    <span className="font-mono text-xs tracking-widest text-[#525252]">{feature.num}</span>
                  </div>
                  <h3 className="mb-4 font-serif text-xl font-bold">{feature.title}</h3>
                  <p className="leading-relaxed text-[#525252]">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="relative border-b-[4px] border-black bg-black px-6 py-24 text-white md:px-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 1px, #fff 1px, #fff 2px)',
            backgroundSize: '4px 100%',
          }}
        />
        <div className="relative z-10 mx-auto grid w-full max-w-[72rem] grid-cols-1 gap-12 divide-y divide-[#333333] text-center md:grid-cols-4 md:gap-0 md:divide-x md:divide-y-0">
          {stats.map((item) => (
            <div key={item.label} className="flex flex-col items-center px-4 py-8 md:py-0">
              <div className="mb-4 font-serif text-5xl md:text-6xl">{item.stat}</div>
              <div className="mb-2 font-mono text-xs uppercase tracking-[0.1em]">{item.label}</div>
              <div className="text-sm text-[#888888]">{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b-[4px] border-black px-6 py-24 md:px-12 md:py-32">
        <div className="mx-auto w-full max-w-[72rem]">
          <div className="mb-16 text-center">
            <h2 className="mb-6 font-serif text-5xl tracking-tight md:text-6xl">Project modules</h2>
            <p className="mx-auto max-w-3xl text-xl text-[#525252]">
              Select a locality first. Lviv is the default, and smaller towns, settlements, and villages automatically
              receive lower pricing.
            </p>
          </div>

          <div className="mb-10 border-[2px] border-black p-6 md:p-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_320px] md:items-end">
              <div>
                <p className="mb-3 font-mono text-xs uppercase tracking-[0.1em] text-[#525252]">Pricing input</p>
                <h3 className="font-serif text-3xl tracking-tight md:text-4xl">Choose your municipality profile</h3>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#525252]">
                  Pricing is location-sensitive. The smaller the locality, the smaller the expected record volume and
                  the lower the generated price.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block font-mono text-xs uppercase tracking-[0.1em] text-[#525252]">Locality</label>
                <Select value={selectedLocalityId} onValueChange={setSelectedLocalityId}>
                  <SelectTrigger className="h-14 rounded-none border-[2px] border-black bg-white text-base shadow-none">
                    <SelectValue placeholder="Select locality" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-[2px] border-black">
                    {localities.map((locality) => (
                      <SelectItem key={locality.id} value={locality.id} className="rounded-none text-base">
                        {locality.label} | {locality.kind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 items-center border-b border-t border-black lg:grid-cols-3">
            {modules.map((module, idx) => {
              const inverted = idx === 1
              return (
                <div
                  key={module.subtitle}
                  className={
                    inverted
                      ? 'relative z-10 flex h-[105%] flex-col bg-black p-10 text-white shadow-[0_0_0_2px_black] lg:p-14'
                      : idx === 0
                        ? 'flex h-full flex-col p-10 lg:border-r lg:border-black lg:p-12'
                        : 'flex h-full flex-col p-10 lg:border-l lg:border-black lg:p-12'
                  }
                >
                  <div
                    className={
                      inverted
                        ? 'absolute left-10 top-8 border border-white px-3 py-1 font-mono text-[10px] uppercase tracking-widest'
                        : 'w-fit border border-black px-3 py-1 font-mono text-[10px] uppercase tracking-widest'
                    }
                  >
                    {module.tag}
                  </div>

                  <h3
                    className={
                      inverted ? 'mb-4 mt-10 font-serif text-2xl font-bold' : 'mb-4 mt-8 font-serif text-2xl font-bold'
                    }
                  >
                    {module.title}
                  </h3>
                  <p
                    className={
                      inverted
                        ? 'mb-10 border-b border-[#333333] pb-10 text-[#A3A3A3]'
                        : 'mb-10 border-b border-[#E5E5E5] pb-10 text-[#525252]'
                    }
                  >
                    {module.subtitle}
                    <span
                      className={
                        inverted
                          ? 'mt-3 block text-xs uppercase tracking-[0.12em] text-[#d0d0d0]'
                          : 'mt-3 block text-xs uppercase tracking-[0.12em] text-[#737373]'
                      }
                    >
                      {selectedLocality.label} | {selectedLocality.kind}
                    </span>
                  </p>

                  <ul className="mb-12 flex-1 space-y-4">
                    {module.points.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <Check size={18} className="mt-1 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className={
                      inverted
                        ? 'w-full border-[2px] border-white bg-white py-4 font-mono text-sm uppercase tracking-widest text-black transition-none hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-white focus-visible:outline-offset-[3px]'
                        : 'w-full border-[2px] border-black bg-black py-4 font-mono text-sm uppercase tracking-widest text-white transition-none hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-black focus-visible:outline-offset-[3px]'
                    }
                  >
                    {module.cta}
                  </button>
                </div>
              )
            })}
          </div>

          <p className="mt-8 text-center font-mono text-sm tracking-wide text-[#525252]">
            Smaller localities generate lower pricing. Default selection: Lviv.
          </p>
        </div>
      </section>

      <section className="px-6 py-24 md:px-12 md:py-32">
        <div className="mx-auto w-full max-w-[48rem]">
          <div className="mb-16 flex items-center gap-4">
            <span className="font-mono text-xs uppercase tracking-[0.1em]">FAQ</span>
            <div className="h-[1px] flex-1 bg-black" />
          </div>

          <h2 className="mb-16 text-center font-serif text-4xl tracking-tight md:text-5xl">Project FAQ</h2>

          <div className="border-t-[2px] border-black">
            {faq.map((item, index) => {
              const isOpen = openFaqIndex === index

              return (
                <div key={item.question} className="border-b-[2px] border-black">
                  <button
                    type="button"
                    className="group -mx-4 flex w-[calc(100%+2rem)] items-center justify-between gap-6 px-4 py-6 text-left transition-colors duration-100 hover:bg-[#F5F5F5]"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  >
                    <span className="font-serif text-xl font-bold md:text-2xl">{item.question}</span>
                    <div className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center border-[1.5px] border-black bg-white transition-colors duration-100 group-hover:bg-black group-hover:text-white">
                      <ChevronDown
                        size={18}
                        strokeWidth={2}
                        className={cn('transition-transform duration-150', isOpen && 'rotate-180')}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="animate-in fade-in slide-in-from-top-1 pb-6 pr-4">
                      <p className="text-lg leading-relaxed text-[#525252]">{item.answer}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12">
        <div className="mx-auto w-full max-w-[72rem] border-t border-black pt-6">
          <div className="flex items-start gap-3 text-sm text-[#525252]">
            <Shield size={16} className="mt-1 shrink-0" />
            <p>
              Internal data integrity project for municipalities that need anomaly tracking, reporting, tax calculation,
              and direct synchronization between state registry records and local operational data.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
