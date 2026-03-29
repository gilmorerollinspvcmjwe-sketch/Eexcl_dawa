# 贡献指南

感谢你对 Excel Aim Trainer 的兴趣！我们欢迎各种形式的贡献。

## 🚀 如何贡献

### 报告 Bug

如果你发现了 bug，请通过 [Issue](https://github.com/gilmorerollinspvcmjwe-sketch/Eexcl_dawa/issues) 报告，并包含以下信息：

1. **问题描述** - 清晰描述发生了什么
2. **复现步骤** - 如何重现这个问题
3. **期望行为** - 你期望发生什么
4. **实际行为** - 实际发生了什么
5. **环境信息** - 浏览器版本、操作系统等
6. **截图** - 如果有的话，附上截图

### 提出新功能

有新想法？欢迎提交 Issue 讨论：

1. 先搜索是否已有类似提议
2. 清晰描述你的功能需求
3. 解释为什么这个功能有用
4. 如果可能，提供实现思路

### 提交代码

#### 开发流程

1. **Fork 项目**
   ```bash
   # 点击 GitHub 上的 Fork 按钮
   ```

2. **克隆你的 Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Eexcl_dawa.git
   cd Eexcl_dawa
   ```

3. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/bug-description
   ```

4. **安装依赖**
   ```bash
   npm install
   ```

5. **开发**
   ```bash
   npm run dev
   ```

6. **提交更改**
   ```bash
   git add .
   git commit -m "feat: 添加新功能描述"
   ```

7. **推送到你的 Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **创建 Pull Request**
   - 访问原项目页面
   - 点击 "New Pull Request"
   - 选择你的分支
   - 填写 PR 描述

#### 代码规范

- 使用 TypeScript
- 遵循现有的代码风格
- 添加必要的注释
- 确保代码能通过 lint 检查：`npm run lint`

#### 提交信息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式（不影响功能）
- `refactor:` 重构
- `perf:` 性能优化
- `test:` 测试相关
- `chore:` 构建/工具相关

示例：
```
feat: 添加新的单元格颜色模式
fix: 修复点击命中失效问题
docs: 更新 README 安装说明
```

## 📝 开发指南

### 项目结构

```
src/
├── components/     # React 组件
├── contexts/       # Context 状态管理
├── hooks/          # 自定义 Hooks
├── types/          # TypeScript 类型
├── utils/          # 工具函数
└── styles/         # CSS 样式
```

### 添加新功能 checklist

- [ ] 代码符合 TypeScript 类型要求
- [ ] 通过 `npm run lint` 检查
- [ ] 更新相关文档（README 等）
- [ ] 测试功能正常工作
- [ ] 提交信息符合规范

## 💬 沟通渠道

- **Issue** - Bug 报告和功能建议
- **Pull Request** - 代码贡献
- **Discussions** - 一般性讨论（如果开启）

## 🏆 贡献者

感谢所有为这个项目做出贡献的人！

---

**有问题？** 随时提交 Issue 或联系维护者。

让我们一起打造最好的摸鱼练枪神器！🐟🎯
