import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { useApp } from '../context/AppContext'

// Validated categorical palette (fixed slot order — never cycled) with selected dark steps
const SERIES = {
  light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'],
  dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'],
}

// Ordinal blue ramp for ordered stages (funnel, pipeline); lightest step still clears 2:1 on the surface
const ORDINAL = {
  light: ['#86b6ef', '#6da7ec', '#5598e7', '#3987e5', '#2a78d6', '#256abf', '#1c5cab', '#184f95', '#104281'],
  dark: ['#184f95', '#1c5cab', '#256abf', '#2a78d6', '#3987e5', '#5598e7', '#6da7ec', '#86b6ef', '#9ec5f4'],
}

export function useChartTheme() {
  const { dark } = useApp()
  const mode = dark ? 'dark' : 'light'
  return {
    series: SERIES[mode],
    ordinal: (n) => {
      const r = ORDINAL[mode]
      return Array.from({ length: n }, (_, i) => r[Math.round((i * (r.length - 1)) / Math.max(n - 1, 1))])
    },
    grid: dark ? '#1e293b' : '#e2e8f0',
    axis: dark ? '#64748b' : '#94a3b8',
    surface: dark ? '#0f172a' : '#ffffff',
  }
}

export const axisProps = (t) => ({ tickLine: false, axisLine: false, fontSize: 11, stroke: t.axis, tick: { fill: t.axis } })

export function ChartCard({ title, subtitle, legend, actions, children, className = '' }) {
  return (
    <div className={`card flex flex-col p-5 sm:p-6 ${className}`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          {legend && <Legend items={legend} />}
          {actions}
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}

export function Legend({ items }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span className={`${i.line ? 'h-0.5 w-3.5' : 'h-2.5 w-2.5'} rounded-sm`} style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  )
}

export function ChartTooltip({ active, payload, label, format = (v) => v, total }) {
  if (!active || !payload?.length) return null
  const sum = payload.reduce((a, p) => a + (Number(p.value) || 0), 0)
  return (
    <div className="min-w-[160px] rounded-xl border border-slate-200/80 bg-white/95 px-3 py-2.5 text-xs shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
      {label != null && <p className="mb-1.5 font-semibold text-slate-900 dark:text-white">{label}</p>}
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span className="h-2 w-2 rounded-sm" style={{ background: p.color || p.payload?.fill }} />
            {p.name}
          </span>
          <span className="font-semibold tabular-nums text-slate-900 dark:text-white">{format(p.value)}</span>
        </div>
      ))}
      {total && payload.length > 1 && (
        <div className="mt-1 flex justify-between border-t border-slate-100 pt-1 dark:border-slate-800">
          <span className="text-slate-500">{total}</span>
          <span className="font-semibold tabular-nums">{format(sum)}</span>
        </div>
      )}
    </div>
  )
}

export function Sparkline({ data, dataKey = 'v', color }) {
  return (
    <div className="h-10">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={color} fillOpacity={0.1} isAnimationActive={false} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Ranked horizontal bars in HTML: value at the tip, label in text ink, one series color
export function RankedBars({ items, format = (v) => v, color, colors, sub }) {
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <div className="space-y-3">
      {items.map((i, idx) => (
        <div key={i.label} className="group" title={`${i.label}: ${format(i.value)}`}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
            <span className="truncate font-medium text-slate-700 dark:text-slate-200">{i.label}</span>
            <span className="shrink-0 tabular-nums text-slate-500 dark:text-slate-400">
              <b className="text-slate-900 dark:text-white">{format(i.value)}</b>
              {sub && <span className="ml-1.5">{sub(i)}</span>}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full transition-all duration-500 group-hover:brightness-110"
              style={{ width: `${Math.max((i.value / max) * 100, 1.5)}%`, background: colors ? colors[idx] : color }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
