# 《我掌握世界线》 - The Implementation Plan (Decomposed and Prioritized Task List)

## [ ] Task 1: 创建项目结构和基础HTML框架
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 创建项目目录结构（index.html, css/, js/）
  - 创建基础HTML页面，包含游戏容器、状态栏、事件日志、操作按钮等基本布局
  - 添加基础样式，模拟暗色科幻风格界面
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - human-judgment TR-1.1: 页面加载正常，布局完整可见
  - human-judgment TR-1.2: 界面风格符合克苏鲁科幻主题
- **Notes**: 使用纯HTML/CSS/JS，无需外部依赖

## [ ] Task 2: 实现状态机核心系统
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 创建PlayerState类，管理current_era, node_level, corruption_level, time_stones, has_divinity等属性
  - 实现状态初始化、属性更新、状态持久化（localStorage）
  - 实现时代定义常量和切换逻辑
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-11
- **Test Requirements**:
  - programmatic TR-2.1: 状态机初始化后属性值正确
  - programmatic TR-2.2: 时代切换时时间石保留
  - programmatic TR-2.3: localStorage保存和读取正常
- **Notes**: 支持的时代：创世年、公元年、联邦年

## [ ] Task 3: 构建模块化文本池系统
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 创建textPool.js，存储各时代的描述、事件、NPC反应文本
  - 实现随机抽取和拼接函数
  - 实现事件生成器，根据时代和玩家状态生成事件
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - human-judgment TR-3.1: 每个时代至少有10个事件文本
  - human-judgment TR-3.2: 事件文本随机生成，内容丰富
- **Notes**: 文本内容参考游戏设计文档中的时代特征

## [ ] Task 4: 实现克苏鲁污染系统
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 实现污染等级对文本输出的干扰效果（乱码字符插入）
  - 实现level>=3时的字符顺序打乱功能
  - 实现level==2时的界面限制（仅显示时间石）
  - 实现污染等级提升和降低逻辑
- **Acceptance Criteria Addressed**: AC-4, AC-5, AC-6
- **Test Requirements**:
  - human-judgment TR-4.1: level=1时文本有轻微乱码
  - human-judgment TR-4.2: level=3时文本严重混乱
  - programmatic TR-4.3: level=2时状态栏仅显示时间石
- **Notes**: 使用、、等特殊字符作为乱码

## [ ] Task 5: 实现关键事件触发机制
- **Priority**: P0
- **Depends On**: Task 2, Task 3
- **Description**: 
  - 实现公元年死亡计数系统，达100次触发世界线收束
  - 实现联邦年BOSS周旋选择系统
  - 实现创世年"留下"选项和虚假结局触发（3次选择）
- **Acceptance Criteria Addressed**: AC-7, AC-8, AC-9
- **Test Requirements**:
  - programmatic TR-5.1: 死亡计数达100触发收束文本
  - human-judgment TR-5.2: BOSS周旋有多个选项和不同后果
  - programmatic TR-5.3: 创世年选择"留下"3次触发【HAPPY END?】成就
- **Notes**: 死亡计数可通过事件快速模拟测试

## [ ] Task 6: 实现成就系统
- **Priority**: P1
- **Depends On**: Task 2
- **Description**: 
  - 创建成就字典，定义各成就解锁条件
  - 实现成就检查和解锁逻辑
  - 实现成就展示界面
- **Acceptance Criteria Addressed**: AC-10
- **Test Requirements**:
  - programmatic TR-6.1: 达成条件时成就自动解锁
  - human-judgment TR-6.2: 成就界面显示已解锁和未解锁成就
- **Notes**: 包含【时序幽灵】、【HAPPY END?】、【世界线收束】等成就

## [ ] Task 7: 实现时间石系统和重置机制
- **Priority**: P1
- **Depends On**: Task 2
- **Description**: 
  - 实现时间石获取（成就、事件奖励）
  - 实现时间石消耗（穿越、清除污染记忆）
  - 实现重置机制（硬重置需要输入确认文字）
- **Acceptance Criteria Addressed**: AC-11, AC-12
- **Test Requirements**:
  - programmatic TR-7.1: 时间石获取和消耗计算正确
  - programmatic TR-7.2: 输入"我确认重置世界"后进度清除
- **Notes**: 软重启（因果熔断）保留ID和成就记录

## [ ] Task 8: 整合界面交互和测试
- **Priority**: P1
- **Depends On**: Task 1-7
- **Description**: 
  - 将所有模块整合到HTML界面
  - 实现事件按钮、时代切换、状态查看等交互
  - 进行整体测试和bug修复
- **Acceptance Criteria Addressed**: 全部AC
- **Test Requirements**:
  - human-judgment TR-8.1: 所有功能按钮可正常点击
  - human-judgment TR-8.2: 游戏流程顺畅，无明显bug
- **Notes**: 确保界面响应及时，操作反馈清晰
