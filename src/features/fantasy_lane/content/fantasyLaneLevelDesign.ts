export interface FantasyLaneLevelDesignNote {
  levelId: string;
  teaches: string[];
  tests: string[];
  failCases: string[];
  counters: string[];
}

export const FANTASY_LANE_LEVEL_DESIGN_NOTES: Record<string, FantasyLaneLevelDesignNote> = {
  '1-1': {
    levelId: '1-1',
    teaches: ['补前排', '先稳线再补输出'],
    tests: ['前线厚度'],
    failCases: ['空攒金币', '前排断线'],
    counters: ['低费盾线', '后排点射'],
  },
  '1-2': {
    levelId: '1-2',
    teaches: ['认识兵潮', 'AOE 起作用的时机'],
    tests: ['清杂效率'],
    failCases: ['只带单体', '被杂兵拖线'],
    counters: ['范围伤害', '稳前排'],
  },
  '1-3': {
    levelId: '1-3',
    teaches: ['护排与拆排', '前后排联动'],
    tests: ['目标优先级'],
    failCases: ['火力打错排', '后排被白吃'],
    counters: ['破盾单位', '后排压制'],
  },
  '1-4': {
    levelId: '1-4',
    teaches: ['留技能', '持续伤害处理'],
    tests: ['战术技时机'],
    failCases: ['技能交早', '前线掉血过快'],
    counters: ['治疗/护盾', '稳态前排'],
  },
  '1-5': {
    levelId: '1-5',
    teaches: ['重装与破甲', '换线成本'],
    tests: ['拆重装能力'],
    failCases: ['纯轻甲输出', '被厚甲拖住'],
    counters: ['破甲', '攻城'],
  },
  '1-6': {
    levelId: '1-6',
    teaches: ['Boss 节奏', '阶段前留资源'],
    tests: ['Boss 前资源整备'],
    failCases: ['见 Boss 前空技能', '杂兵没清掉'],
    counters: ['单体爆发', '清杂搭配'],
  },
  '2-1': {
    levelId: '2-1',
    teaches: ['空层登场', '反空预留'],
    tests: ['基础制空'],
    failCases: ['全地面编组'],
    counters: ['反空射手', '空域争夺'],
  },
  '2-2': {
    levelId: '2-2',
    teaches: ['双层战场', '地空分工'],
    tests: ['多线资源分配'],
    failCases: ['只顾一层', '反空不足'],
    counters: ['地面拖线', '空层反制'],
  },
  '2-3': {
    levelId: '2-3',
    teaches: ['反空不是万能', '地面仍要稳线'],
    tests: ['编组均衡'],
    failCases: ['反空过量', '地面输出掉档'],
    counters: ['双线补位', '中排持续伤害'],
  },
  '2-4': {
    levelId: '2-4',
    teaches: ['飞行骚扰', '保护后排'],
    tests: ['后排存活'],
    failCases: ['后排裸奔', '制空被反超'],
    counters: ['反空守卫', '切后反制'],
  },
  '2-5': {
    levelId: '2-5',
    teaches: ['空层压制转地面收割'],
    tests: ['节奏切换'],
    failCases: ['见空就慌', '对地伤害不足'],
    counters: ['空地混编', '技能断节奏'],
  },
  '2-6': {
    levelId: '2-6',
    teaches: ['空域 Boss', '多阶段反空'],
    tests: ['反空持续性'],
    failCases: ['只靠一轮反空', 'Boss 阶段前空资源'],
    counters: ['稳定反空', '保地面线'],
  },
  '3-1': {
    levelId: '3-1',
    teaches: ['高密度兵潮', '先清线再推进'],
    tests: ['AOE 覆盖率'],
    failCases: ['AOE 不足', '前线被堵死'],
    counters: ['法术AOE', '群伤射手'],
  },
  '3-2': {
    levelId: '3-2',
    teaches: ['多批次高压', '经济回转'],
    tests: ['短 CD 出兵节奏'],
    failCases: ['手里攒钱', '补兵断档'],
    counters: ['低费兵潮', '中速群伤'],
  },
  '3-3': {
    levelId: '3-3',
    teaches: ['兵潮混重装', '杂兵掩护主力'],
    tests: ['清杂与拆重装并存'],
    failCases: ['只会清杂', '只会打单体'],
    counters: ['AOE + 破甲', '前排拖线'],
  },
};

export function getFantasyLaneLevelDesignNote(levelId: string) {
  return FANTASY_LANE_LEVEL_DESIGN_NOTES[levelId] ?? null;
}
