# Checklist

## Phase 1: 类型定义扩展
- [x] PvZLevelDefinition 包含 waves 字段
- [x] PvZWaveConfig 接口定义完整
- [x] PvZBoardState 包含 currentWaveIndex 字段
- [x] PvZBoardState 包含 skyDrops 字段
- [x] PvZBoardState 包含 shovelMode 字段
- [x] PvZBoardState 包含 gameSpeed 字段
- [x] PvZPlantInstance 包含 isBeingAttacked 字段
- [x] PvZZombieInstance 包含 isAttacking 字段

## Phase 2: 核心逻辑实现
- [x] 波次系统正确切换波次
- [x] 大波显示"大波僵尸来袭"提示
- [x] 最终波显示"最终波"提示
- [x] 波次间隔 3-5 秒
- [x] 僵尸接触植物后停止移动
- [x] 僵尸啃食植物减少血量
- [x] 植物血量 0 时消失
- [x] 小推车触发清空该行僵尸
- [x] 小推车触发后消失
- [x] 无推车时僵尸到达左边界游戏失败
- [x] 天空每 8-10 秒掉落阳光
- [x] 阳光落地停留 10 秒
- [x] 点击阳光收集成功
- [x] 铲子移除植物返还 50% 阳光
- [x] 铲子模式切换正常
- [x] 游戏速度 1x/2x 切换正常
- [x] 暂停/恢复功能正常

## Phase 3: 环境限制实现
- [x] 迷雾遮挡视野
- [x] 灯笼草照明 3x3 区域
- [x] 水路限制非水生植物种植
- [x] 睡莲允许种植其他植物
- [x] 屋顶限制直线射击植物
- [x] 屋顶允许抛投植物

## Phase 4: UI 渲染实现
- [x] 波次提示显示正确
- [x] 小推车渲染正确
- [x] 小推车触发动画流畅
- [x] 天空掉落阳光渲染
- [x] 阳光点击交互响应
- [x] 铲子按钮显示
- [x] 铲子模式视觉反馈
- [x] 暂停/加速按钮显示
- [x] 迷雾遮罩渲染
- [x] 照明区域高亮
- [x] 植物被攻击闪烁动画
- [x] 植物摇晃动画

## Phase 5: 关卡数据迁移
- [x] 所有 100 关包含波次配置
- [x] 波次数量根据强度正确计算
- [x] 每章环境标记正确

## Phase 6: 测试验证
- [x] 波次系统测试通过
- [x] 僵尸攻击测试通过
- [x] 小推车测试通过
- [x] npm run build 通过
- [ ] npm test 全部通过（部分测试需要调试）