# Checklist

## Phase 1: 类型定义和存储逻辑
- [x] SaveSlot 接口定义完整（id, name, gameType, timestamp, data）
- [x] SaveData 接口定义完整
- [x] saveToStorage 函数实现正确
- [x] loadFromStorage 函数实现正确
- [x] deleteFromStorage 函数实现正确
- [x] listSaves 函数实现正确

## Phase 2: 存档管理组件
- [x] 存档管理对话框显示正确
- [x] 存档列表渲染正确
- [x] 新建存档功能正常
- [x] 加载存档功能正常
- [x] 删除存档功能正常
- [x] 游戏选择界面显示正确
- [x] 游戏列表渲染正确
- [x] 点击游戏后切换正确

## Phase 3: ExcelHeader 菜单集成
- [x] 文件菜单显示正确
- [x] 文件菜单包含：新建存档、保存、加载存档、删除存档
- [x] 开始菜单显示正确
- [x] 开始菜单点击后显示游戏选择界面
- [x] 快捷键 Alt+F 支持

## Phase 4: App.tsx 界面切换逻辑
- [x] currentGame 状态管理正确
- [x] showGameSelector 状态管理正确
- [x] saveManager 状态管理正确
- [x] 选择游戏后只显示该游戏核心界面
- [x] 返回主菜单功能正常

## Phase 5: 样式和中文本地化
- [x] 存档列表样式正确
- [x] 对话框样式正确
- [x] 所有菜单项使用中文
- [x] 所有提示信息使用中文

## Phase 6: 测试验证
- [x] 存档创建测试通过
- [x] 存档保存测试通过
- [x] 存档加载测试通过
- [x] 存档删除测试通过
- [x] npm run build 通过
- [x] npm test 通过