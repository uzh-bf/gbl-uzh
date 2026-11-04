import { isStructurallySame, parse } from '@formatjs/icu-messageformat-parser'
import { createTranslator } from 'next-intl'
import { describe, expect, it } from 'vitest'
import { catalogs } from './catalogs'
import { contentText } from './content'
import { detectLanguage, languageTools } from './locale'
import { lessons, levels, stories } from './originalContent'

describe('demo languages', () => {
  it('honours an explicit preference, then the first supported browser language', () => {
    expect(detectLanguage('de', ['en'])).toBe('de')
    expect(detectLanguage('invalid', ['fr-CH', 'de-AT', 'en-US'])).toBe('de')
    expect(detectLanguage(null, ['fr', 'en-GB', 'de'])).toBe('en')
    expect(detectLanguage(null, ['fr-CH', 'it-CH'])).toBe('en')
    expect(detectLanguage(null, [])).toBe('en')
  })
  it('matches every message path and ICU argument type in both catalogs', () => {
    function flatten(tree: object, path = ''): Record<string, string> {
      return Object.assign(
        {},
        ...Object.entries(tree).map(([key, value]) => {
          const name = path ? `${path}.${key}` : key
          return typeof value === 'string'
            ? { [name]: value }
            : flatten(value, name)
        })
      )
    }
    const en = flatten(catalogs.en)
    const de = flatten(catalogs.de)
    expect(Object.keys(de).sort()).toEqual(Object.keys(en).sort())
    for (const [key, message] of Object.entries(en)) {
      expect(de[key].trim(), key).not.toBe('')
      if (key.startsWith('content.')) continue // Raw Markdown, never passed to ICU.
      const comparison = isStructurallySame(parse(message), parse(de[key]))
      expect(
        comparison.success,
        key + ' ' + (comparison.error?.message ?? '')
      ).toBe(true)
    }
  })
  it.each([
    ['en', 'Across 1 team', 'Across 2 teams', 'Ada {2}'],
    ['de', 'Über 1 Team', 'Über 2 Teams', 'Ada {2}'],
  ] as const)(
    'renders plurals and literal argument values in %s',
    (locale, one, two, name) => {
      const t = createTranslator({
        locale,
        messages: catalogs[locale],
        onError(error) {
          throw error
        },
      })
      expect(t('manage.report.teamCount', { count: 1 })).toBe(one)
      expect(t('manage.report.teamCount', { count: 2 })).toBe(two)
      expect(t('manage.report.focusTeam', { team: name })).toContain(name)
    }
  )
  it('formats Swiss currency, calendar months and signed returns at the original precision', () => {
    const en = languageTools('en'),
      de = languageTools('de')
    expect(en.formatCHF(12345.6)).toBe("12'345.60 CHF")
    expect(de.formatCHF(12345.6)).toMatch(/^12['’]345\.60 CHF$/)
    for (const tools of [en, de]) {
      // Allocation previews historically round with toFixed; settled balances use Intl.
      expect(tools.formatCHF(1.005)).toBe('1.00 CHF')
      expect(tools.playerAmount(1.005)).toBe('1.01')
    }
    expect(en.shortMonth(4)).toBe('May')
    expect(en.shortMonth(8)).toBe('Sep')
    expect(de.shortMonth(4)).toBe('Mai')
    expect(de.signedPercent(-0.00001)).toBe('0.0 %')
    expect(en.playerPercent(0.1234)).toBe('+12.34%')
  })
  it('translates shipped fields while keeping custom records and edits verbatim', () => {
    for (const [id, story] of Object.entries(stories))
      for (const field of ['title', 'content'] as const)
        expect(contentText('de', 'story', id, field, story[field])).not.toBe(
          story[field]
        )
    for (const level of levels)
      expect(
        contentText(
          'de',
          'level',
          level.index,
          'description',
          level.description
        )
      ).not.toBe(level.description)
    expect(
      contentText('de', 'story', 'custom', 'title', stories.bank_account.title)
    ).toBe(stories.bank_account.title)
    expect(
      contentText('de', 'story', 'bank_account', 'content', 'My bank')
    ).toBe('My bank')
    for (const lesson of lessons) {
      expect(
        contentText('en', 'lesson', lesson.id, 'question', 'Edited question?')
      ).toBe('Edited question?')
      expect(
        contentText('en', 'lesson', lesson.id, 'question', lesson.question)
      ).not.toBe(lesson.question)
      const options = [...lesson.options].reverse()
      const rendered = options.map((text) =>
        contentText('en', 'lesson', lesson.id, 'option', text)
      )
      expect(new Set(rendered).size).toBe(options.length)
      for (const [index, text] of options.entries()) {
        expect(rendered[index]).not.toBe(text)
        const de = contentText('de', 'lesson', lesson.id, 'option', text)
        expect(de).toBe(
          lesson.id === 'bonds_intro'
            ? text
                .replace('Anleihen', 'Obligationen')
                .replace('Anleihe', 'Obligation')
            : text
        )
      }
      expect(
        contentText('en', 'lesson', lesson.id, 'option', 'Instructor edit')
      ).toBe('Instructor edit')
    }
  })
  it.each([
    ['bonds_intro', 'less risk than a share', 'geringeres erwartetes Risiko'],
    [
      'stocks_intro',
      'a creditor of the company',
      'Gläubiger der Aktiengesellschaft',
    ],
    ['investments_risks', 'Market risk is', 'Das Marktrisiko'],
    ['time_value_of_money', 'worth the same', 'gleich viel Wert'],
  ])(
    'keeps the submitted option index for %s in either language',
    (id, en, de) => {
      const serverOptions = [
        ...lessons.find((lesson) => lesson.id === id)!.options,
      ].reverse()
      const selected = (language: 'en' | 'de', text: string) =>
        serverOptions.findIndex((original) =>
          contentText(language, 'lesson', id, 'option', original).includes(text)
        )
      expect(selected('de', de)).toBeGreaterThanOrEqual(0)
      expect(selected('en', en)).toBe(selected('de', de))
    }
  )
})
