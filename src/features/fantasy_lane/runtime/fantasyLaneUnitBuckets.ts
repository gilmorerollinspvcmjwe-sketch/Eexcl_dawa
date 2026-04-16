import { FANTASY_LANE_UNIT_MAP } from '../fantasyLaneUnitRegistry.ts';
import type {
  FantasyLaneLayer,
  FantasyLaneLaneId,
  FantasyLaneSide,
  FantasyLaneUnitBucketSummary,
  FantasyLaneUnitInstance,
} from '../fantasyLaneTypes.ts';

export interface FantasyLaneUnitBuckets {
  bySide: Record<FantasyLaneSide, FantasyLaneUnitInstance[]>;
  bySideLayer: Record<FantasyLaneSide, Record<FantasyLaneLayer, FantasyLaneUnitInstance[]>>;
  bySideLayerLane: Record<FantasyLaneSide, Record<FantasyLaneLayer, Record<FantasyLaneLaneId, FantasyLaneUnitInstance[]>>>;
  summary: FantasyLaneUnitBucketSummary[];
}

const SIDE_KEYS: FantasyLaneSide[] = ['player', 'enemy'];
const LAYER_KEYS: FantasyLaneLayer[] = ['ground', 'air'];
const LANE_KEYS: FantasyLaneLaneId[] = ['front', 'mid', 'rear', 'air'];

const bucketCache = new WeakMap<FantasyLaneUnitInstance[], FantasyLaneUnitBuckets>();

function createEmptyBuckets(): FantasyLaneUnitBuckets {
  const bySide = {
    player: [],
    enemy: [],
  } satisfies Record<FantasyLaneSide, FantasyLaneUnitInstance[]>;

  const bySideLayer = {
    player: { ground: [], air: [] },
    enemy: { ground: [], air: [] },
  } satisfies Record<FantasyLaneSide, Record<FantasyLaneLayer, FantasyLaneUnitInstance[]>>;

  const bySideLayerLane = {
    player: {
      ground: { front: [], mid: [], rear: [], air: [] },
      air: { front: [], mid: [], rear: [], air: [] },
    },
    enemy: {
      ground: { front: [], mid: [], rear: [], air: [] },
      air: { front: [], mid: [], rear: [], air: [] },
    },
  } satisfies Record<FantasyLaneSide, Record<FantasyLaneLayer, Record<FantasyLaneLaneId, FantasyLaneUnitInstance[]>>>;

  return {
    bySide,
    bySideLayer,
    bySideLayerLane,
    summary: [],
  };
}

export function getFantasyLaneUnitBuckets(units: FantasyLaneUnitInstance[]): FantasyLaneUnitBuckets {
  const cached = bucketCache.get(units);
  if (cached) return cached;

  const buckets = createEmptyBuckets();

  units.forEach((unit) => {
    buckets.bySide[unit.side].push(unit);
    buckets.bySideLayer[unit.side][unit.layer].push(unit);
    buckets.bySideLayerLane[unit.side][unit.layer][unit.lane].push(unit);
  });

  buckets.summary = SIDE_KEYS.flatMap((side) =>
    LAYER_KEYS.flatMap((layer) =>
      LANE_KEYS.map((lane) => {
        const laneUnits = buckets.bySideLayerLane[side][layer][lane];
        const totalPop = laneUnits.reduce((sum, unit) => sum + (FANTASY_LANE_UNIT_MAP[unit.templateId]?.pop ?? 0), 0);
        return {
          side,
          layer,
          lane,
          count: laneUnits.length,
          totalPop,
        } satisfies FantasyLaneUnitBucketSummary;
      }).filter((entry) => entry.count > 0),
    ),
  );

  bucketCache.set(units, buckets);
  return buckets;
}
