// Excel Aim Trainer - 统一常量定义

// 网格配置
export const COLS = 30; // B to AD (30 columns)
export const ROWS = 50; // 1 to 50
export const CELL_WIDTH = 64;
export const CELL_HEIGHT = 20;

// 安全刷新区域（避免被UI遮挡）
export const SAFE_ZONE_ROWS = 5; // 顶部预留5行给UI（GameHUD + 连击进度条）
export const SAFE_ZONE_COLS = 2; // 左右各预留2列
export const BOTTOM_SAFE_ROWS = 3; // 底部预留3行

// 目标持续时间配置
export const DEFAULT_TARGET_DURATION_MS = 1000; // 基础持续时间
export const TARGET_DURATION_FACTOR = 300; // 每级增加/减少的毫秒数
export const TARGET_DURATION_LEVELS = 11; // 设置级别 1-10，用于计算

// 音效配置
export const HIT_SOUND_FREQUENCY = 440; // A4
export const HEADSHOT_SOUND_FREQUENCY = 880; // A5
export const COMBO_SOUND_FREQUENCY = 660; // E5
export const MISS_SOUND_FREQUENCY = 200;
export const SOUND_GAIN = 0.15;
export const MISS_SOUND_GAIN = 0.08;

// 游戏配置
export const INITIAL_SPAWN_DELAY_MS = 500;
export const CLEANUP_INTERVAL_MS = 100;
export const HIT_EFFECT_DURATION_MS = 600;
export const MISS_EFFECT_DURATION_MS = 200;
export const CORNER_HIDE_DELAY_MS = 3000;

// 连击配置
export const COMBO_POP_THRESHOLD = 5;