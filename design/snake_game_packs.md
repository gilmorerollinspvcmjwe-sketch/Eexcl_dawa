# 贪吃蛇游戏包设计（Sheet10）

## 设计前提
- 参考：`snake_levels_and_modes_masterplan.md` 中的经典 / 限时 / 挑战 / 字符链谱系、`snake_module_analysis.md` 的模块责任、`snake_reference_redesign.md` 的 Excel 视觉语境、`snake_text_chain_feature_design.md` 的文字链规则。
- 输出目标：每个包都能拆成“模式 + 目标词 + 地图 + HUD 展示 + 对应实现文件” 的明确工作项（`snakeContent`、`snakeBoardState`、HUD/Overlay、sheet 配置）。
- 风格：保持 Excel 工作簿成品感，短局可手动选择地图尺寸，并让文字链、压力与公式关逃离“demo”级别，成为可复用的产品级包。
- 每个包结尾注明“对应 Excel 表现”方便 UI / HUD 组件对齐。 

## 游戏包列表

1. **基础训练包 I：文字链入门**  
   - **定位**：帮助新玩家认识所有 token、字母链和 HUD 提示（配合 `SnakeHud` 逐项展示），保持 `classic` / `timed` 中低难度。  
   - **原版参考**：休闲手机贪吃蛇（点击型无障碍 + 目标词）与 `Wordalike` 类低难度词组。  
   - **核心规则**：`classic` 模式 + `timed easy` 分别对应两个模板，`targetPlan` 为 `['GO', 'HP']`；目标词在 HUD 做进度条，错误字符只减分、不生成压力障碍；地图默认 `small 12×16`。  
   - **建议关卡数**：4 关（2 个 classic 自由链 + 2 个 timed 目标词）  
   - **首发必做**：`SnakeHUD` 显示当前词/进度、`SnakeOverlay` 介绍目标词；目标词保证满场存在 `isTarget` token；设置页默认选 `small`。  
   - **可延期内容**：加入 `timed` 的 `durationMs 45s` 挑战、加入 `targetSegmentConfig` 让词组拆成分段目标。  
   - **Excel 对应**：`Sheet10` 的“基础训练包”卡片直接映射到 `snakeContent` 中这四个 preset，HUD `targetProgress` 文案在公式栏同步。  

2. **基础训练包 II：障碍与压力**  
   - **定位**：以 `challenge` 模式的中图地图引入静态障碍（冻结区/合并区）和动态审计线压力；目标 `EXCEL` 词组，完成后奖励压力清空。  
   - **原版参考**：掌机Snake 迷宫 + modern pressure map。  
   - **核心规则**：`challenge normal` + `mapSize medium`，场上静态障碍从 `snakeBoardState` `buildChallengeObstacles`；时间点每 9s 产生 `pressureObstacle`；错误字符触发 `pressureLevel`，带 HUD 告警。  
   - **建议关卡数**：3 个压力模板（冻结线 / 合并区 / 审计扫码）。  
   - **首发必做**：动态压力 timer、HUD `审计波` 倒计时、`SnakeOverlay` 结算强调压力趋势。  
   - **可延期内容**：可加 `challenge hard` map + `mapSize large`；加入 `dynamicPressureTimerMs` 触发附加移动障碍。  
   - **Excel 对应**：`pressure_maps` 包卡片（`snake_content` 里 `pressure_freeze`/`pressure_audit` 等）直接映射，`Sheet10` HUD `压力` 指示当前 `pressureLevel`。  

3. **目标词包**  
   - **定位**：纯单词关，锁定 `targetPlan` 并加强短词完成奖励，强调“按顺序吃字” + “词组奖励”。  
   - **原版参考**：`Word Snake`、`Boggle` 式任务。  
   - **核心规则**：`timed normal` + `targetPlan ['LOVE', 'EXCEL', '404']`，每完成一词 `targetProgress` 归零且 `completedTargets` 增加；误吃字符触发 `chainBonus` 失败提示并清除本轮 chain。  
   - **建议关卡数**：3 关，对应三种词组，每关 map size `medium`。  
   - **首发必做**：HUD 显示 `currentTarget`、`targetProgress`；`SnakeOverlay` 显示“词组完成”反馈；`snakeBoardState` 里的 `getSegmentMetadata` 保持；基础 `Snake Sheet` preset 显示 `targetPlan`。  
   - **可延期内容**：加 `timed hard` 形式的 `targetSegmentConfig`（如 `LOVE YOU` 分段、`A1+B2` 公式），以及 `word_chain` 模式支持 `targetPlan` 随机选词。  
   - **Excel 对应**：`target_words` pack 界面中 `badge` / `summary` 文案即刻可用，HUD `任务进度` 评价 `getSnakeTargetProgressLabel`。  

4. **高阶句子包**  
   - **定位**：带分段的句子目标（如 `LOVE YOU`, `GOOD LUCK`, `I AM EXCEL`），把 `segmentMilestone` 奖励拆成多段完成点，HUD 显示 `当前段`。  
   - **原版参考**：`Sentence Snake`、扫字游戏的句子闯关模式。  
   - **核心规则**：`challenge hard` + `targetPlan ['LOVE YOU', 'A1+B2']`，`targetSegmentConfig` 明确拆分；完成每段 `segmentIndex` +1 并发 `SEGMENT_COMPLETION_BONUS`，终点 `chainTokens` 清空；地图 `large`。  
   - **建议关卡数**：5 关（每个句子 3 段），可按主题（情感/公式/复仇）分类。  
   - **首发必做**：HUD 显示 `段落`、`当前段`、`当前链条` 与阶段完成提示；overlay 结算显示“短句完成”；保留 `segmentMeta` 视图。  
   - **可延期内容**：加句子闯关挑战并带动态障碍；`word_chain` 系统自动从词库摘出句子（如 `LOVE YOU`）。  
   - **Excel 对应**：`Sheet10` 侧栏中的“段落计数”说明直接联动 `SnakeHud`，公式栏条目可依照 `SnakeTextChain` 词组快速展示。  

5. **公式修复包**  
   - **定位**：结合 Excel 经典公式（`SUM`、`VLOOKUP`、`REF!`），把符号也视为 token，增加 `targetPlan` 中的运算顺序。  
   - **原版参考**：`Calculator Snake`、`formula puzzle` 关卡（包括 `🧮` 版本）。  
   - **核心规则**：`challenge hard` + `targetPlan ['A1+B2', 'SUM+404']`，`targetSegmentConfig` 让 `A1+` 和 `B2` 拆段；`FORMULA_SYMBOLS` 作为可吃取 token，误抓符号触发 `pressure`；HUD 显示公式模式提示。  
   - **建议关卡数**：4 关，分别让公式越来越长，引入 `@` 万能符与 `wild` 公式符号。  
   - **首发必做**：`SnakeHud` 额外加 `当前符号` 提示；`SnakeOverlay` 补“公式完成”文案；HUD 的阶段提示强调 `A1+` 直至 `B2`。  
   - **可延期内容**：加入 `Excel` 错误码（`#DIV/0!`、`#REF!`）联动 `chainBonus`； `targetPlan` 支持 `Math.Random() > 0` 生成公式。  
   - **Excel 对应**：在 `Sheet10` 中的 `pressure_maps` 加入 `formula_fix` preset，HUD `任务进度` 文案改成“公式进度”；overlay 结算显示“公式修复完成”。  

6. **挑战剧情包**  
   - **定位**：设定一系列“审计实验”主题关（如 `审计线逃逸`、`Meeting Crash`），每关线性连接，带强制障碍与压缩时间。  
   - **原版参考**：关卡式 Snake（如 `Snake Rewind`） + `Survival mode` 章节。  
   - **核心规则**：`challenge` + variable map (13×22) + `durationMs` 逐段递减；`pressureObstacle` 会在每个“审计节段”末尾激活。  
   - **建议关卡数**：6 关（每关为一个“审计节段”，分别引入 `filter_wall`、`merged corridor`、`frozen center`），最终关附带 `sentence target`。  
   - **首发必做**：`SnakeHud` `审计波` 提示变成节段计时器； `SnakeOverlay` 结算说明“逃离审计”；  `Sheet10` 加入 “挑战剧情包” tab 供选。  
   - **可延期内容**：加 `story journal` 记录每关完成词汇/时间； `Sheet10` 公式栏提示 `审计 + 句子`。  
   - **Excel 对应**：`Sheet10` 中新增 `Chapter Pack` 面板，卡片直接链接 `snake_content` 中的 preset `pressure_audit`、`formula_fix`、`phrase_run`。  

7. **社交/每日挑战包**  
   - **定位**：提供每日目标（如“完成 `LOVE YOU`、不要死于障碍”），并记录 `lastRunResult`/`runStats` 里 `targetsCompleted`，鼓励重复挑战。  
   - **原版参考**：每日挑战与社交排行榜（`Snake vs Friends`）。  
   - **核心规则**：`timed` + `difficulty` 可变；每日轮换 `targetPlan` 与地图模板；`Sheet10` HUD 显示“今日目标 + 进度”。  
   - **建议关卡数**：用 `snake_content` 里 `daily` 预设实现，每天一关。  
   - **首发必做**：数据层追踪“今日目标完成数”；HUD `lastEventText` 显示今日特殊规则；UI 提供“查看今日目标”。  
   - **可延期内容**：加入社交对比视图，导出 `runStats` 到 `StatsPanel`。  
   - **Excel 对应**：`Sheet10` 加每日挑战按钮，表格公式显示 “今天目标” 文案，`SnakeHud` 里同步 `targetPlan`。  


以上每个包都直指一个可拆的实施任务（模式、目标词、障碍、地图、HUD、记录分别一组），后续开发只需在 `snakeContent`、`snakeBoardState`、`SnakeHud`、`SnakeOverlay` 与 `Sheet10` 配置入口上逐包推进，就能把贪吃蛇从单一短局模块扩成可持续更新的正式内容线。
