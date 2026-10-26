// Seconds left until endAt (ms). Computed from the clock, not by counting ticks,
// because phones throttle or pause timers while the page is in the background.
export function secondsLeft(endAt: number, now: number): number {
  return Math.max(0, Math.ceil((endAt - now) / 1000));
}
