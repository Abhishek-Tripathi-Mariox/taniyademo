import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Search } from 'lucide-react'

const SEARCH_THRESHOLD = 5
const cx = (...c) => c.filter(Boolean).join(' ')
const normalize = (o) => (typeof o === 'object' ? o : { value: o, label: String(o) })

// Styled dropdown replacing native <select>. Options: strings or { value, label, hint }.
// Search appears automatically when there are more than 5 options.
export default function Select({ value, onChange, options, placeholder = 'Select…', searchable, disabled, size = 'md', className, title }) {
  const opts = options.map(normalize)
  const showSearch = searchable ?? opts.length > SEARCH_THRESHOLD
  const selected = opts.find((o) => o.value === value)

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [pos, setPos] = useState(null)
  const triggerRef = useRef(null)
  const panelRef = useRef(null)
  const listRef = useRef(null)
  const searchRef = useRef(null)

  const q = query.trim().toLowerCase()
  const filtered = q ? opts.filter((o) => `${o.label} ${o.hint ?? ''}`.toLowerCase().includes(q)) : opts

  const place = () => {
    const r = triggerRef.current?.getBoundingClientRect()
    if (!r) return
    const below = window.innerHeight - r.bottom
    const up = below < 280 && r.top > below
    setPos({ left: r.left, width: r.width, ...(up ? { bottom: window.innerHeight - r.top + 6 } : { top: r.bottom + 6 }) })
  }

  const openMenu = () => {
    if (disabled) return
    place()
    setQuery('')
    setActive(Math.max(0, opts.findIndex((o) => o.value === value)))
    setOpen(true)
  }

  const close = (refocus = true) => {
    setOpen(false)
    if (refocus) triggerRef.current?.focus()
  }

  const choose = (o) => {
    onChange(o.value)
    close()
  }

  useLayoutEffect(() => {
    if (!open) return
    if (showSearch) searchRef.current?.focus()
    else listRef.current?.focus()
  }, [open, showSearch])

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!panelRef.current?.contains(e.target) && !triggerRef.current?.contains(e.target)) close(false)
    }
    const onMove = (e) => {
      if (!panelRef.current?.contains(e.target)) place()
    }
    document.addEventListener('mousedown', onDown)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', onMove, true)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', onMove, true)
    }
  }, [open])

  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[active]) choose(filtered[active])
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault()
      e.stopPropagation()
      close()
    }
  }

  const sm = size === 'sm'

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        title={title}
        disabled={disabled}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={(e) => {
          if (!open && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
            e.preventDefault()
            openMenu()
          }
        }}
        className={cx(
          'input flex items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-60',
          sm && 'py-1 pl-2.5 pr-2 text-xs',
          open && 'border-brand-400 ring-4 ring-brand-100 dark:ring-brand-900/40',
          className,
        )}
      >
        <span className={cx('truncate', !selected && 'text-slate-400')}>
          {selected ? selected.label : placeholder}
          {selected?.hint && !sm && <span className="ml-1.5 text-xs text-slate-400">{selected.hint}</span>}
        </span>
        <ChevronDown size={sm ? 14 : 16} className={cx('shrink-0 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: 'fixed', left: pos.left, top: pos.top, bottom: pos.bottom, minWidth: Math.max(pos.width, sm ? 80 : 200) }}
            className="animate-fade-up z-[70] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40"
          >
            {showSearch && (
              <div className="relative border-b border-slate-100 p-2 dark:border-slate-800">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setActive(0)
                  }}
                  onKeyDown={onKeyDown}
                  placeholder={`Search ${opts.length} options…`}
                  className="w-full rounded-lg bg-slate-50 py-1.5 pl-8 pr-2 text-sm outline-none placeholder:text-slate-400 focus:bg-slate-100 dark:bg-slate-800 dark:focus:bg-slate-700"
                />
              </div>
            )}
            <ul ref={listRef} tabIndex={-1} onKeyDown={onKeyDown} className="scroll-thin max-h-64 overflow-y-auto p-1 outline-none" role="listbox">
              {filtered.map((o, i) => {
                const isSel = o.value === value
                return (
                  <li
                    key={String(o.value)}
                    data-idx={i}
                    role="option"
                    aria-selected={isSel}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(o)}
                    className={cx(
                      'flex cursor-pointer items-center gap-2 rounded-lg px-2.5 text-sm',
                      sm ? 'py-1 text-xs' : 'py-2',
                      i === active && 'bg-brand-50 text-brand-800 dark:bg-brand-500/10 dark:text-brand-200',
                      isSel && 'font-semibold',
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{o.label}</span>
                    {o.hint && <span className="shrink-0 font-mono text-[11px] font-normal text-slate-400">{o.hint}</span>}
                    <Check size={14} className={cx('shrink-0 text-brand-600 dark:text-brand-400', !isSel && 'invisible')} />
                  </li>
                )
              })}
              {filtered.length === 0 && <li className="px-3 py-6 text-center text-xs text-slate-400">No matches for “{query}”</li>}
            </ul>
          </div>,
          document.body,
        )}
    </>
  )
}
