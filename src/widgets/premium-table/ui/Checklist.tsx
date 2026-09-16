export function Checklist<T extends string | number>({
  label,
  options,
  selected,
  onChange,
  render,
}: {
  label: string
  options: T[]
  selected: Set<T>
  onChange(next: Set<T>): void
  render?: (opt: T) => string
}) {
  function toggle(opt: T) {
    const next = new Set(selected)
    if (next.has(opt)) next.delete(opt)
    else next.add(opt)
    onChange(next)
  }
  return (
    <div className="dfield">
      <label>{label}</label>
      <div className="dchecklist">
        <div className="dchecklist-head">
          <button type="button" className="linklike" onClick={() => onChange(new Set(options))}>
            All
          </button>
          <button type="button" className="linklike" onClick={() => onChange(new Set())}>
            None
          </button>
        </div>
        {options.map((opt) => (
          <label key={String(opt)}>
            {/* Strictly what is selected: treating an empty set as "everything"
                made None a no-op, since clearing it ticked every box again. */}
            <input type="checkbox" checked={selected.has(opt)} onChange={() => toggle(opt)} />
            {render ? render(opt) : String(opt)}
          </label>
        ))}
      </div>
    </div>
  )
}
