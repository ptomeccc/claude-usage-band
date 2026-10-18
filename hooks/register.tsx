import { atom, read, update } from 'claude-code'
import type { Register, SessionRateLimit } from 'claude-code'

const limits = atom({ plugin: 'usage-band', key: 'limits' } as const, [] as SessionRateLimit[])
const context = atom({ plugin: 'usage-band', key: 'context' } as const, null as number | null)

const LABELS: Record<string, string> = { five_hour: 'Session (5h)', seven_day: 'Weekly' }
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const pad = (n: number) => String(n).padStart(2, '0')

// Within 24h: "14:30"; later: "Mon 09:00". Local time.
export function formatReset(iso: string | undefined, now: number): string {
  const d = new Date(iso ?? '')
  if (Number.isNaN(d.getTime())) return ''
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  return d.getTime() - now < 86_400_000 ? time : `${DAYS[d.getDay()]} ${time}`
}

// Small ring like the desktop's usage circle: a faint track and an arc filled to `percent`.
export function pie(percent: number): string {
  const c = 2 * Math.PI * 5
  const filled = (Math.min(Math.max(percent, 0), 100) / 100) * c
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14">` +
    `<circle cx="7" cy="7" r="5" fill="none" stroke="#8a8a8a" stroke-opacity=".35" stroke-width="2.5"/>` +
    `<circle cx="7" cy="7" r="5" fill="none" stroke="#4a90e2" stroke-width="2.5" ` +
    `stroke-dasharray="${filled.toFixed(2)} ${c.toFixed(2)}" transform="rotate(-90 7 7)"/></svg>`
}

export function formatLimit(l: SessionRateLimit, now: number): string {
  const reset = formatReset(l.resetsAt, now)
  return `${LABELS[l.kind] ?? l.kind}: ${Math.round(l.percentUsed)}%${reset ? ` · resets ${reset}` : ''}`
}

// Pixel Claude mascot: five scenes (wave, idea, sleep, cheer, coffee break) taking turns, CSS-only (sandboxed Svg frame).
const D = '#1a1a1a'
const W = '#fff3e6'
const px = (x: number, y: number, w = 1, h = 1, fill?: string) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}"${fill ? ` fill="${fill}"` : ''}/>`
const LEGS = `<g class="l1">${px(5, 13, 1, 2)}${px(12, 13, 1, 2)}</g><g class="l2">${px(7, 13, 1, 2)}${px(14, 13, 1, 2)}</g>`
const SIDE_ARMS = px(2, 10, 2, 2) + px(16, 10, 2, 2)
const EYES = px(7, 9, 1, 1, D) + px(12, 9, 1, 1, D)
const crab = (cls: string, parts: string) => `<g class="${cls}">${px(4, 7, 12, 6)}${parts}</g>${LEGS}`
const zed = (x: number, y: number, d = '') =>
  `<g class="z ${d}" fill="#6b4bd8">${px(x, y, 3)}${px(x + 1, y + 1)}${px(x, y + 2, 3)}</g>`
const spark = (x: number, y: number, d = '') =>
  `<g class="tw ${d}" fill="#f5c542">${px(x + 1, y, 1, 3)}${px(x, y + 1, 3, 1)}</g>`

const SCENES = [
  // wave: "HI" bubble, left arm waving
  px(9, 0, 7, 5, '#3ddc6e') + px(10, 5, 1, 1, '#3ddc6e') +
    px(10, 1, 1, 3, W) + px(12, 1, 1, 3, W) + px(11, 2, 1, 1, W) + px(14, 1, 1, 3, W) +
    crab('b', `<g class="wave">${px(2, 4, 2, 5)}</g>${px(16, 10, 2, 2)}${EYES}${px(9, 11, 2, 1, W)}`),
  // idea: light bulb with twinkling rays, big smile
  px(8, 0, 4, 1, '#f5c542') + px(7, 1, 6, 3, '#f5c542') + px(8, 4, 4, 1, '#f5c542') + px(8, 1, 1, 1, '#fff') +
    px(9, 5, 2, 1, '#6b4bd8') +
    `<g class="tw" fill="#f5c542">${px(5, 1)}${px(14, 1)}${px(5, 4)}${px(14, 4)}</g>` +
    crab('b', SIDE_ARMS + EYES + px(8, 10, 1, 1, W) + px(9, 11, 2, 1, W) + px(11, 10, 1, 1, W)),
  // sleep: closed eyes, slow breathing, floating Zs
  zed(12, 3) + zed(15, 0, 'd1') +
    crab('br', SIDE_ARMS + px(6, 9, 2, 1, D) + px(12, 9, 2, 1, D) + px(9, 11, 1, 1, W)),
  // cheer: arms up, jumping, sparkles
  spark(0, 0) + spark(17, 0, 'd2') + spark(8, 2, 'd3') +
    crab('jump', px(2, 3, 2, 5) + px(16, 3, 2, 5) +
      px(6, 10, 1, 1, D) + px(7, 9, 1, 1, D) + px(8, 10, 1, 1, D) +
      px(11, 10, 1, 1, D) + px(12, 9, 1, 1, D) + px(13, 10, 1, 1, D) + px(9, 11, 2, 1, W)),
  // coffee break: pause bubble, steaming mug lifted for a sip now and then, eyes shut in bliss
  px(1, 0, 5, 5, '#4a7bd8') + px(4, 5, 1, 1, '#4a7bd8') + px(2, 1, 1, 3, W) + px(4, 1, 1, 3, W) +
    `<g class="st" fill="#b8b8b8">${px(18, 6)}${px(17, 5)}</g><g class="st d1" fill="#b8b8b8">${px(19, 5)}${px(18, 4)}</g>` +
    crab('br', px(2, 10, 2, 2) + px(6, 9, 2, 1, D) + px(12, 9, 2, 1, D) + px(9, 11, 2, 1, W) +
      `<g class="sip">${px(16, 10, 1, 2)}${px(17, 8, 3, 4, '#3a8f5c')}${px(17, 8, 3, 1, '#6f4e37')}${px(17, 10, 3, 1, W)}</g>`),
]
const SCENE_S = 4

// Each scene shows for SCENE_S; a negative delay per scene puts it on screen during its own slot.
export const MASCOT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 16" shape-rendering="crispEdges">
<style>
.s{opacity:0;animation:show ${SCENE_S * SCENES.length}s linear infinite}
@keyframes show{0%,${100 / SCENES.length - 1}%{opacity:1}${100 / SCENES.length}%,100%{opacity:0}}
.b{animation:hop .8s steps(1) infinite}
.jump{animation:hop .5s steps(1) infinite}
.br{animation:breathe 2s steps(1) infinite}
.l1{animation:hop .4s steps(1) infinite}
.l2{animation:hop .4s steps(1) infinite reverse}
.wave{animation:wave .5s steps(1) infinite}
.tw{animation:tw .6s steps(1) infinite}
.z{animation:zz 2s linear infinite}
@keyframes hop{50%{transform:translateY(-.5px)}}
@keyframes breathe{50%{transform:translateY(.5px)}}
@keyframes wave{50%{transform:translateX(-1px)}}
@keyframes tw{50%{opacity:0}}
.st{animation:zz 1.6s linear infinite}
.sip{animation:sip 4s steps(1) infinite}
@keyframes sip{70%{transform:translateY(-2px)}90%{transform:none}}
${SCENES.map((_, i) => `.s${i}{animation-delay:${i * SCENE_S - SCENE_S * SCENES.length}s}`).join('')}
.d1{animation-delay:-1s}.d2{animation-delay:-.3s}.d3{animation-delay:-.15s}
@keyframes zz{0%{transform:translate(0,1px);opacity:0}30%{opacity:1}100%{transform:translate(1px,-2px);opacity:0}}
</style>
<g fill="#D97757">${SCENES.map((s, i) => `<g class="s s${i}">${s}</g>`).join('')}</g></svg>`

// Last known limits, saved across sessions, so a new chat shows them before its first reply.
// A window whose reset time has passed has started over: it reads 0%.
export function fromStore(raw: unknown, now: number): SessionRateLimit[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((l): l is SessionRateLimit => typeof l?.kind === 'string' && typeof l?.percentUsed === 'number')
    .map(l => (l.resetsAt && Date.parse(l.resetsAt) <= now ? { kind: l.kind, percentUsed: 0 } : l))
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    const { rateLimits, context: ctx } = await $.session.usage()
    await update($, context, () => ctx.percent ?? null)
    if (rateLimits.length > 0) {
      await update($, limits, () => rateLimits)
      await $.store.set('limits', rateLimits)
    } else {
      const saved = fromStore(await $.store.get('limits'), await $.clock.now())
      await update($, limits, () => saved)
    }
    return result
  })

  on('session.measure', async ($, e, next) => {
    if (e.changed.includes('context')) {
      await update($, context, () => e.context.percent ?? null)
    }
    if (e.changed.includes('rateLimits') && e.rateLimits.length > 0) {
      await update($, limits, () => e.rateLimits)
      await $.store.set('limits', e.rateLimits)
    }
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const all = await read($, limits)
    const ctx = await read($, context)
    if (e.props.hasSurvey || (all.length === 0 && ctx === null)) return next(e)

    const els = $.ui.resolve(e)
    const { Box, Text } = els
    const now = await $.clock.now()
    const items = [
      ...(ctx === null ? [] : [{ key: 'context', percent: ctx, text: `Context: ${ctx}%` }]),
      ...all.map(l => ({ key: l.kind, percent: l.percentUsed, text: formatLimit(l, now) })),
    ]

    return (
      <Box flexDirection="row" justifyContent="space-between" alignItems="center">
        <Box flexDirection="row" alignItems="center" gap={3}>
          {items.map(i => (
            <Box key={i.key} flexDirection="row" alignItems="center" gap={1}>
              {/* the terminal has no Svg; it shows the text alone */}
              {'Svg' in els && <els.Svg source={pie(i.percent)} alt={`${Math.round(i.percent)}%`} width={14} height={14} />}
              <Text dimColor>{i.text}</Text>
            </Box>
          ))}
        </Box>
        {'Svg' in els && <els.Svg source={MASCOT} alt="Claude" width={30} height={24} isInteractive />}
      </Box>
    )
  })
}
