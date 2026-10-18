import { expect, test } from 'claude-code/testing'

import { formatLimit, fromStore, MASCOT, pie } from './register'

test('formats a limit with label, rounded percent and reset time', async () => {
  const now = Date.parse('2026-01-05T10:00:00')
  const soon = formatLimit({ kind: 'five_hour', percentUsed: 23.4, resetsAt: '2026-01-05T14:30:00' }, now)
  expect(soon).toBe('Session (5h): 23% · resets 14:30')
  const later = formatLimit({ kind: 'seven_day', percentUsed: 41, resetsAt: '2026-01-12T09:00:00' }, now)
  expect(later).toBe('Weekly: 41% · resets Mon 09:00')
  expect(formatLimit({ kind: 'spend_limit', percentUsed: 5 }, now)).toBe('spend_limit: 5%')
})

test('mascot cycles five scenes within the Svg size limit', async () => {
  expect(MASCOT.match(/class="s s\d"/g)?.length).toBe(5)
  expect(MASCOT.length < 131072).toBe(true)
  expect(MASCOT.includes('style=')).toBe(false)
})

test('saved limits: reset windows read 0%, junk is dropped', async () => {
  const now = Date.parse('2026-01-05T10:00:00')
  const saved = [
    { kind: 'five_hour', percentUsed: 80, resetsAt: '2026-01-05T09:00:00' },
    { kind: 'seven_day', percentUsed: 41, resetsAt: '2026-01-12T09:00:00' },
    { nope: 1 },
  ]
  expect(fromStore(saved, now)).toEqual([
    { kind: 'five_hour', percentUsed: 0 },
    { kind: 'seven_day', percentUsed: 41, resetsAt: '2026-01-12T09:00:00' },
  ])
  expect(fromStore(undefined, now)).toEqual([])
})

test('pie fills its arc in proportion and clamps', async () => {
  const arc = (svg: string) => Number(svg.match(/stroke-dasharray="([\d.]+)/)?.[1])
  const full = 2 * Math.PI * 5
  expect(arc(pie(0))).toBe(0)
  expect(Math.abs(arc(pie(50)) - full / 2) < 0.01).toBe(true)
  expect(arc(pie(150))).toBe(arc(pie(100)))
})
