import React, { useMemo, useRef, useLayoutEffect, useState } from "react";
import styles from "./index.module.css";

function formatDate(d) {
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
  });
}

/**
 * @param {Object} props
 * @param {Array}  props.items - [{ title, at?, start?, end?, color?, side? }]
 * @param {number} [props.height=600]
 * @param {Date|string} [props.now=new Date()]
 * @param {Date|string} [props.minTime] - lock the bottom of the scale
 * @param {number} [props.padding=24]
 * @param {number} [props.railWidth=3]
 */
export default function Timeline({
  items = [],
  height = 600,
  now = new Date(),
  minTime,
  padding = 24,
  railWidth = 3,
}) {
  const containerRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(height);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const resize = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = Math.round(entry.contentRect.height);
        if (height > 0) setContainerHeight(height);
      }
    });
    resize.observe(el);
    return () => resize.disconnect();
  }, []);

  /**  parse and validate timeline items */
  const tlItems = useMemo(() => {
    const sortedItems = [...items].sort((a, b) => {
      return (a.startDate ?? 0) - (b.startDate ?? 0);
    });

    return sortedItems.map((item, i) => {
      const start = item.startDate;
      const end = item.endDate || new Date();

      const side = (i + 2) % 2 === 1 ? "right" : "left";

      /** Anchor point for the dot. */
      const anchor = start ?? end;
      if (!anchor) return null;

      // pick a distinct color for this item
      const hue = (i * 45) % 360; // change 45 to 30/60 for tighter/looser spacing
      const color = `hsl(${hue}, 70%, 50%)`;

      return {
        ...item,
        _idx: item.id ?? String(i),
        _start: start,
        _end: end,
        _anchor: anchor,
        _side: side,
        color: color, // attach a generated color
      };
    });
  }, [items]);

  /** Earliest start time (for the timeline bottom label) */
  const earliestStart = useMemo(() => {
    const times = tlItems
      .map((p) => p?._start?.getTime())
      .filter((t) => Number.isFinite(t));
    if (!times.length) return null;
    return new Date(Math.min(...times));
  }, [tlItems]);

  const { tNow, tMin } = useMemo(() => {
    const _now = new Date(now).getTime();
    const oldestFromItems =
      tlItems.length > 0
        ? Math.min(
            ...tlItems.map((p) =>
              Math.min(
                p._start?.getTime() ?? Infinity,
                p._end?.getTime() ?? Infinity
              )
            )
          )
        : _now;

    if (_now === oldestFromItems) {
      return { tNow: _now + 1, tMin: oldestFromItems };
    }
    return { tNow: _now, tMin: oldestFromItems };
  }, [tlItems, now]);

  /**
   * Ruler ticks: quarters (3 mo) and years (1 yr), starting from earliestStart
   */
  const ticks = useMemo(() => {
    if (!earliestStart) return { quarters: [], years: [] };

    // Normalize to avoid DST issues (use Y/M/D constructor)
    const base = new Date(
      earliestStart.getFullYear(),
      earliestStart.getMonth(),
      earliestStart.getDate()
    );
    const top = new Date(now); // "now" at the top

    // Helper to add months
    const addMonths = (d, n) =>
      new Date(d.getFullYear(), d.getMonth() + n, d.getDate());

    // Quarters: start at +3 months and go to now
    const quarters = [];
    for (let q = addMonths(base, 3); q <= top; q = addMonths(q, 3)) {
      quarters.push(q);
    }

    // Years: first completed year is base + 12 months
    const years = [];
    for (let y = addMonths(base, 12); y <= top; y = addMonths(y, 12)) {
      years.push(y);
    }

    return { quarters, years };
  }, [earliestStart, now]);

  const innerHeight = Math.max(containerHeight - padding * 2, 1);
  const span = Math.max(tNow - tMin, 1);

  const yForTime = (time) => {
    const ratio = (tNow - time) / (tNow - tMin);
    return padding + ratio * (containerHeight - padding * 2);
  };

  return (
    <div
      ref={containerRef}
      className={styles.Timeline}
      style={{
        height,
        // expose some CSS vars for theming from the outside if you like
        "--timeline-rail-width": `${railWidth}px`,
        "--timeline-padding": `${padding}px`,
      }}
      aria-label="Timeline (now at top; past below)"
    >
      {/* Vertical rail */}
      <div className={styles.Timeline_rail} aria-hidden />

      {/* "now" helper label */}
      <div
        className={styles.Timeline_now_label}
        style={{ top: padding - 10 }}
        aria-hidden
      >
        now
      </div>

      {/* Ruler ticks on the left side of the rail */}
      {ticks && (
        <div className={styles.Timeline_ticks} aria-hidden>
          {/* small ticks for every 3 months, excluding where a year tick exists */}
          {(() => {
            const yearSet = new Set(ticks.years.map((d) => d.getTime()));
            return ticks.quarters.map((d, i) => {
              if (yearSet.has(d.getTime())) return null; // don't double render
              const y = yForTime(d.getTime());
              return (
                <div
                  key={`q-${i}`}
                  className={`${styles.Timeline_tick} ${styles.small}`}
                  style={{ top: y - 1 }}
                />
              );
            });
          })()}

          {/* big ticks for each full year */}
          {ticks.years.map((d, i) => {
            const y = yForTime(d.getTime());
            return (
              <div
                key={`y-${i}`}
                className={`${styles.Timeline_tick} ${styles.big}`}
                style={{ top: y - 1 }}
              />
            );
          })}
        </div>
      )}

      {/* Items */}
      {tlItems.map((p) => {
        const clampY = (y) =>
          Math.max(padding, Math.min(padding + innerHeight, y));

        const y = clampY(yForTime(p._anchor.getTime()));
        const side = p.side === "left" ? "left" : "right";
        const startY = p._start
          ? clampY(yForTime(p._start.getTime()))
          : undefined;
        const endY = p._end ? clampY(yForTime(p._end.getTime())) : undefined;

        // NEW: duration segment math
        let segTop, segHeight;
        if (startY !== undefined) {
          if (endY !== undefined) {
            // start ↔ end
            segTop = Math.min(startY, endY);
            segHeight = Math.max(2, Math.abs(endY - startY));
          } else {
            // open-ended: now (top) ↔ start
            segTop = padding; // top of the rail area = "now"
            segHeight = Math.max(2, startY - padding);
          }
        }

        const itemStyle = { "--item-color": p.color || "var(--color-primary)" };

        return (
          <div key={p._idx} className={styles.Timeline_item} style={itemStyle}>
            {/* duration segment */}
            {segTop !== undefined && segHeight !== undefined && (
              <div
                className={styles.Timeline_range_segment}
                style={{
                  top: segTop,
                  height: segHeight,
                  width: railWidth + 4,
                  opacity: 0.8,
                  // uncomment for a solid line instead of translucent:
                  // background: "var(--item-color)",
                }}
                aria-hidden
              />
            )}

            {/* dot */}
            <div
              className={styles.Timeline_dot}
              role="img"
              aria-label={`${p.title} on ${p._anchor.toLocaleString()}`}
              style={{ top: y - 6 }}
            />

            {/* leader */}
            <div
              className={`${styles.Timeline_leader} ${
                p._side === "left" ? styles.left : styles.right
              }`}
              style={{ top: y - 1 }}
              aria-hidden
            />

            {/* label */}
            <div
              className={`${styles.Timeline_label} ${
                p._side === "left" ? styles.left : styles.right
              }`}
              style={{ top: y - 12 }}
            >
              <div className={styles.Timeline_label_title}>{p.title}</div>
              <div className={styles.Timeline_label_meta}>
                {p._start && p._end
                  ? `${formatDate(p._start)} — ${formatDate(p._end)}`
                  : `${formatDate(p._start ?? p._anchor)} — Present`}
              </div>
            </div>

            {/* "start" helper label at the bottom */}
            {earliestStart && (
              <div
                className={styles.Timeline_start_label}
                style={{ bottom: padding - 10 }}
                aria-hidden
              >
                {formatDate(earliestStart)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
