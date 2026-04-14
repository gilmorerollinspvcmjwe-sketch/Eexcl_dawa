# Checklist

## Phase 1: 类型定义和存储逻辑
- [x] SaveSlot 接口定义完整
- [x] SaveData 接口定义完整
- [x] saveToStorage 函数实现
- [x] loadFromStorage 函数实现
- [x] deleteFromStorage 函数实现
- [x] listSaves 函数实现

## Phase 2: 存档管理组件
- [x] SaveManager 组件渲染正确
- [x] 新建存档功能正常
- [x] 保存存档功能正常
- [x] 加载存档功能正常
- [x] 删除存档功能正常（含确认提示）
- [x] 存档列表显示正确

## Phase 3: 游戏选择界面
- [x] GameSelector 组件渲染正确
- [x] 游戏列表显示完整
- [x] 点击游戏进入对应界面

## Phase 4: 主应用路由
- [x] 左上角文件菜单显示
- [x] 游戏选择界面路由正确
- [x] 界面切换逻辑清晰
- [x] 选择游戏后仅显示该游戏核心界面

## Phase 5: 中文化
- [x] 所有界面文本为中文
- [x] 所有按钮文本为中文
- [x] 所有提示文本为中文
- [x] 所有交互反馈为中文

## Phase 6: 测试验证
- [ ] 存档管理测试通过
- [x] npm run build 通过
- [ ] npm test 通过