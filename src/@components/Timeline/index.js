import React, { useMemo, useRef, useLayoutEffect, useState } from "react";
import styles from "./index.module.css";

function formatDate(d) {
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

  const parsed = useMemo(() => {
    const ensureDate = (date) =>
      date ? (date instanceof Date ? date : new Date(date)) : undefined;
    return items
      .map((item, i) => {
        const at = ensureDate(item.at);
        const start = ensureDate(item.start);
        const end = ensureDate(item.end);
        const anchor = at ?? start ?? end;
        if (!anchor) return null;
        return {
          ...item,
          _idx: item.id ?? String(i),
          _at: at,
          _start: start,
          _end: end,
          _anchor: anchor,
        };
      })
      .filter(Boolean);
  }, [items]);

  const { tNow, tMin } = useMemo(() => {
    const _now = new Date(now).getTime();
    const explicitMin = minTime ? new Date(minTime).getTime() : undefined;
    const oldestFromItems =
      parsed.length > 0
        ? Math.min(
            ...parsed.map((p) =>
              Math.min(
                p._anchor.getTime(),
                p._start?.getTime() ?? Infinity,
                p._end?.getTime() ?? Infinity
              )
            )
          )
        : _now;
    const _min =
      explicitMin !== undefined
        ? Math.min(explicitMin, oldestFromItems)
        : oldestFromItems;
    if (_now === _min) return { tNow: _now + 1, tMin: _min };
    return { tNow: _now, tMin: _min };
  }, [parsed, now, minTime]);

  const innerHeight = Math.max(containerHeight - padding * 2, 1);
  const span = Math.max(tNow - tMin, 1);

  const yForTime = (time) => {
    // top = now (bigger time), bottom = past (smaller)
    const ratio = (tNow - time) / span; // 0 at now, 1 at oldest
    return padding + ratio * innerHeight;
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

      {/* Items */}
      {parsed.map((p) => {
        const y = yForTime(p._anchor.getTime());
        const side = p.side === "left" ? "left" : "right";
        const startY = p._start ? yForTime(p._start.getTime()) : undefined;
        const endY = p._end ? yForTime(p._end.getTime()) : undefined;

        const segmentTop =
          startY !== undefined && endY !== undefined
            ? Math.min(startY, endY)
            : undefined;
        const segmentHeight =
          startY !== undefined && endY !== undefined
            ? Math.abs(endY - startY)
            : undefined;

        // color per-item via CSS var (falls back to var(--color-primary))
        const itemStyle = { "--item-color": p.color || "var(--color-primary)" };

        return (
          <div key={p._idx} className={styles.Timeline_item} style={itemStyle}>
            {/* range segment (optional) */}
            {segmentTop !== undefined && segmentHeight !== undefined && (
              <div
                className={styles.Timeline_range_segment}
                style={{ top: segmentTop, height: Math.max(2, segmentHeight) }}
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

            {/* leader line */}
            <div
              className={`${styles.Timeline_leader} ${
                side === "left" ? styles.left : styles.right
              }`}
              style={{ top: y - 1 }}
              aria-hidden
            />

            {/* label */}
            <div
              className={`${styles.Timeline_label} ${
                side === "left" ? styles.left : styles.right
              }`}
              style={{ top: y - 12 }}
            >
              <div className={styles.Timeline_label_title}>{p.title}</div>
              <div className={styles.Timeline_label_meta}>
                {p._start && p._end
                  ? `${formatDate(p._start)} — ${formatDate(p._end)}`
                  : formatDate(p._anchor)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
