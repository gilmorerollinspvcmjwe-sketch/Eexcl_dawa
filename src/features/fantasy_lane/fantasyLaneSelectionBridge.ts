type FantasyLaneSelectionListener = (levelId: string) => void;

let latestFantasyLaneLevelId = '1-1';
const fantasyLaneListeners = new Set<FantasyLaneSelectionListener>();

export function emitFantasyLaneLevelSelection(levelId: string) {
  latestFantasyLaneLevelId = levelId;
  fantasyLaneListeners.forEach((listener) => listener(levelId));
}

export function getLatestFantasyLaneLevelSelection() {
  return latestFantasyLaneLevelId;
}

export function subscribeFantasyLaneLevelSelection(listener: FantasyLaneSelectionListener) {
  fantasyLaneListeners.add(listener);
  return () => {
    fantasyLaneListeners.delete(listener);
  };
}
