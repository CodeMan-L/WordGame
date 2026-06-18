# 《我掌握世界线》 - Product Requirement Document

## Overview
- **Summary**: 创建一个基于多时间线穿越的叙事驱动型文字RPG游戏原型，融合哲学思辨、克苏鲁恐怖与模拟经营元素。玩家作为"时序幽灵"穿梭于创世、公元、联邦等多个时代，对抗克苏鲁污染，最终在灭世年直面本体。
- **Purpose**: 实现游戏设计文档中的核心机制，提供可运行的Web交互原型，展示时间线穿越、克苏鲁污染、成就系统等核心玩法。
- **Target Users**: 喜欢文字冒险、放置类游戏、克苏鲁题材的玩家

## Goals
- [ ] 实现状态机核心，管理玩家在不同时代的属性（current_era, corruption_level, time_stones等）
- [ ] 构建模块化文本池，支持创世年、公元年、联邦年的随机事件生成
- [ ] 实现克苏鲁污染系统，根据污染等级影响文本输出和界面显示
- [ ] 实现关键事件触发机制（死亡计数、BOSS周旋、虚假结局）
- [ ] 实现成就系统和存档重置机制
- [ ] 提供Web界面，模拟游戏操作体验

## Non-Goals (Out of Scope)
- [ ] 完整的8个时代内容（仅实现创世年、公元年、联邦年作为核心演示）
- [ ] 完整的8大飞升流派系统
- [ ] 真实的多宇宙探索机制
- [ ] 复杂的战斗系统
- [ ] 音效和动画效果
- [ ] 云存档功能
- [ ] 移动端适配

## Background & Context
- 游戏设计参考"人生重开模拟器"的文字叙事风格
- 核心机制来源于《我掌握世界线》游戏设计概要文档V2.0
- 使用HTML/CSS/JavaScript实现纯前端原型，无需后端支持

## Functional Requirements
- **FR-1**: 状态机系统 - 管理玩家的current_era, node_level, corruption_level, time_stones, has_divinity等属性
- **FR-2**: 模块化文本池 - 使用字典存储创世年、公元年、联邦年的描述、事件、NPC反应文本，并实现随机抽取拼接
- **FR-3**: 克苏鲁污染系统 - corruption_level(0-4)影响文本输出，level>=3时随机打乱字符顺序
- **FR-4**: 关键事件触发 - 公元年死亡计数达100次触发世界线收束；联邦年BOSS周旋选择；创世年3次"留下"触发虚假结局
- **FR-5**: 界面模拟 - corruption_level==2时仅显示时间石数量
- **FR-6**: 成就系统 - 内置成就字典，特定条件达成时解锁

## Non-Functional Requirements
- **NFR-1**: 界面响应时间 < 200ms
- **NFR-2**: 支持现代浏览器（Chrome, Firefox, Edge）
- **NFR-3**: 纯前端实现，无需后端或数据库
- **NFR-4**: 代码结构清晰，便于后续扩展

## Constraints
- **Technical**: HTML/CSS/JavaScript，纯前端实现
- **Dependencies**: 无外部依赖库
- **Timeline**: 单阶段交付，原型演示

## Assumptions
- [ ] 玩家熟悉文字冒险游戏操作方式
- [ ] 浏览器支持localStorage用于本地存档
- [ ] 用户屏幕分辨率 >= 1024x768

## Acceptance Criteria

### AC-1: 状态机初始化与属性管理
- **Given**: 游戏页面已加载
- **When**: 用户点击"开始游戏"
- **Then**: 状态机初始化，显示初始属性（current_era=联邦年，corruption_level=0，time_stones=0等）
- **Verification**: programmatic
- **Notes**: 初始时代默认为联邦年（推荐初始）

### AC-2: 时代切换与属性保留
- **Given**: 玩家在某时代积累了时间石
- **When**: 玩家选择切换到另一个时代
- **Then**: 时间石数量保留，corruption_level根据新环境调整
- **Verification**: programmatic

### AC-3: 模块化文本池随机事件
- **Given**: 玩家处于某个时代
- **When**: 玩家点击"探索"或时间推进
- **Then**: 从对应时代的文本池中随机抽取并拼接事件描述
- **Verification**: human-judgment

### AC-4: 克苏鲁污染文本干扰
- **Given**: corruption_level >= 1
- **When**: 显示事件文本
- **Then**: 文本中加入乱码字符（如），level越高干扰越严重
- **Verification**: human-judgment

### AC-5: 高污染等级界面崩溃
- **Given**: corruption_level >= 3
- **When**: 打印功能执行
- **Then**: 文本字符顺序随机打乱
- **Verification**: human-judgment

### AC-6: 污染等级2界面限制
- **Given**: corruption_level == 2
- **When**: 查看玩家状态
- **Then**: 仅显示时间石数量，其他属性隐藏
- **Verification**: programmatic

### AC-7: 公元年死亡计数触发
- **Given**: 玩家在公元年，死亡计数 < 100
- **When**: 玩家经历死亡事件，计数累计达100
- **Then**: 触发世界线收束文本
- **Verification**: programmatic

### AC-8: 联邦年BOSS周旋选择
- **Given**: 玩家在联邦年
- **When**: 遇到BOSS事件
- **Then**: 显示多个周旋选项，不同选择导致不同后果
- **Verification**: human-judgment

### AC-9: 创世年虚假结局
- **Given**: 玩家在创世年
- **When**: 连续选择"留下"选项3次
- **Then**: 弹出成就【HAPPY END?】并结束当前游戏
- **Verification**: programmatic

### AC-10: 成就系统解锁
- **Given**: 玩家达成特定条件
- **When**: 条件满足时
- **Then**: 成就自动解锁并显示提示
- **Verification**: programmatic

### AC-11: 时间石获取与消耗
- **Given**: 玩家完成任务或达成成就
- **When**: 获取/消耗时间石
- **Then**: 时间石数量正确增减
- **Verification**: programmatic

### AC-12: 重置机制
- **Given**: 玩家点击重置按钮
- **When**: 输入确认文字"我确认重置世界"
- **Then**: 所有进度清除，重新开始
- **Verification**: programmatic

## Open Questions
- [ ] 是否需要实现其他时代（航旅年、人联年、界盟年）的内容？
- [ ] 是否需要添加音效或视觉效果来增强克苏鲁氛围？
- [ ] 是否需要支持移动端触控操作？
