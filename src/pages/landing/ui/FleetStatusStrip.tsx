const UNITS = [
  { id: '4101', days: ['idle', 'pickup', 'transit', 'transit', 'delivery', 'idle', 'pickup', 'transit', 'delivery', 'idle', 'pickup', 'transit', 'transit', 'delivery'] },
  { id: '4103', days: ['pickup', 'transit', 'delivery', 'idle', 'pickup', 'transit', 'transit', 'delivery', 'idle', 'idle', 'pickup', 'transit', 'delivery', 'idle'] },
  { id: '4111', days: ['idle', 'idle', 'pickup', 'transit', 'transit', 'delivery', 'idle', 'pickup', 'transit', 'delivery', 'idle', 'idle', 'pickup', 'transit'] },
  { id: '4126', days: ['transit', 'delivery', 'idle', 'pickup', 'transit', 'transit', 'delivery', 'idle', 'pickup', 'transit', 'delivery', 'idle', 'idle', 'pickup'] },
  { id: '4130', days: ['delivery', 'idle', 'pickup', 'transit', 'delivery', 'idle', 'idle', 'pickup', 'transit', 'transit', 'delivery', 'idle', 'pickup', 'transit'] },
  { id: '4142', days: ['idle', 'pickup', 'transit', 'transit', 'transit', 'delivery', 'idle', 'idle', 'pickup', 'transit', 'delivery', 'idle', 'pickup', 'transit'] },
]

export function FleetStatusStrip() {
  return (
    <section className="section section-tint">
      <div className="wrap">
        <div className="section-head">
          <p className="eyebrow">Fleet status</p>
          <h2>See the whole fleet’s week without opening a load board</h2>
          <p>
            A day-by-day grid, one row per truck. Green is a pickup, blue is in-transit, violet is a
            delivery, grey is idle. Filter by trailer type, pick 7, 14 or 30 days.
          </p>
        </div>

        <div className="fsstrip">
          <div className="fsstrip-grid">
            {UNITS.map((u) => (
              <div className="fsstrip-row" key={u.id}>
                <b>Unit {u.id}</b>
                {u.days.map((s, i) => (
                  <span key={i} className={`fsstrip-cell fsc-${s}`} />
                ))}
              </div>
            ))}
          </div>
          <div className="fsstrip-legend">
            <span>
              <i style={{ background: 'var(--bubble-pickup)' }} /> Pickup
            </span>
            <span>
              <i style={{ background: 'var(--bubble-transit)' }} /> In transit
            </span>
            <span>
              <i style={{ background: 'var(--bubble-delivery)' }} /> Delivery
            </span>
            <span>
              <i style={{ background: 'var(--bubble-idle)', opacity: 0.35 }} /> Idle
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
