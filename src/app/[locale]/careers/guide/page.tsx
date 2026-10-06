import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isValidLocale } from '@/lib/i18n'
import { getTranslation } from '@/lib/translations/server'
import GuideApplicationForm from '@/components/forms/GuideApplicationForm'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isValidLocale(locale)) return {}
  const t = (await getTranslation(locale)).careers
  return {
    title: t.form.meta.title,
    description: t.form.meta.description,
    alternates: { canonical: `/${locale}/careers/guide` },
  }
}

export default async function GuideApplicationPage({ params }: Props) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()
  const t = (await getTranslation(locale)).careers

  return (
    <>
      <div className="text-center px-4 sm:px-6 pt-14 pb-1">
        <div className="text-xs font-semibold tracking-[0.24em] uppercase text-olive">{t.hero.eyebrow}</div>
        <h1 className="font-display text-3xl sm:text-5xl mt-3">{t.form.title}</h1>
        <p className="text-brown mt-4 max-w-lg mx-auto">{t.form.intro}</p>
      </div>

      <div className="max-w-[760px] mx-auto px-4 sm:px-6 pt-9 pb-16">
        <GuideApplicationForm />
      </div>
    </>
  )
}
