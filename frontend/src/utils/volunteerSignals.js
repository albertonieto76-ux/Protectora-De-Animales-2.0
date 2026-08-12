export const VOLUNTEER_UPDATE_EVENT = "protectora:volunteer-updated";

export function broadcastVolunteerUpdated(payload = {}) {
  const detail = {
    timestamp: Date.now(),
    ...payload,
  };

  window.dispatchEvent(new CustomEvent(VOLUNTEER_UPDATE_EVENT, { detail }));
  window.localStorage.setItem(VOLUNTEER_UPDATE_EVENT, JSON.stringify(detail));
}
