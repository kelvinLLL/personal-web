export function shouldPrepareDailyNuanceData({ hasGeneratedHome, forceRefresh }) {
  return forceRefresh || !hasGeneratedHome;
}
