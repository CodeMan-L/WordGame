/**
 * 成就系统 - 《我掌握世界线》
 * 定义所有成就及其检查逻辑
 */

const ACHIEVEMENTS = {
    TIME_GHOST: {
        id: 'time_ghost',
        name: '时序幽灵',
        desc: '首次进入游戏，成为不存在于因果律中的变数'
    },
    HAPPY_END_FAKE: {
        id: 'happy_end_fake',
        name: 'HAPPY END?',
        desc: '在创世年选择留下3次，获得讽刺的虚假好结局'
    },
    WORLD_LINE_CONVERGE: {
        id: 'world_line_converge',
        name: '世界线收束',
        desc: '在公元年死亡100次，触发世界线收束'
    },
    FIRST_CORRUPTION: {
        id: 'first_corruption',
        name: '初次污染',
        desc: '污染等级达到1级，认知的边界开始模糊'
    },
    DEEP_CORRUPTION: {
        id: 'deep_corruption',
        name: '深层污染',
        desc: '污染等级达到2级，真相与疯狂仅一线之隔'
    },
    TRUE_VISION: {
        id: 'true_vision',
        name: '真视之眼',
        desc: '污染等级达到3级，看到世界的真相——但代价是什么？'
    },
    TIME_STONE_COLLECTOR: {
        id: 'time_stone_collector',
        name: '时间石收藏家',
        desc: '累计获得100块时间石'
    },
    ERA_TRAVELER: {
        id: 'era_traveler',
        name: '时空旅者',
        desc: '成功穿越到不同的时代'
    },
    BOSS_DEALER: {
        id: 'boss_dealer',
        name: '棋手博弈',
        desc: '成功与联邦BOSS周旋'
    },
    DIVINITY_SEEKER: {
        id: 'divinity_seeker',
        name: '神性追寻者',
        desc: '获得神性碎片，超越凡俗的可能'
    },
    CAUSAL_FUSE: {
        id: 'causal_fuse',
        name: '因果熔断',
        desc: '按下红色按钮，执行存在性重置'
    },
    CULTIVATOR: {
        id: 'cultivator',
        name: '修行者',
        desc: '修为等级达到10级'
    },
    ASCENDED: {
        id: 'ascended',
        name: '飞升之路',
        desc: '选择一条飞升路径'
    },
    EXPLORER: {
        id: 'explorer',
        name: '探索者',
        desc: '累计探索50次'
    },
    MULTIVERSE_WALKER: {
        id: 'multiverse_walker',
        name: '多元行者',
        desc: '访问5个不同的时代'
    },
    TRUE_END: {
        id: 'true_end',
        name: '真·世界线主宰',
        desc: '在灭世年正面抗衡克苏鲁本体，达成真结局'
    },
    LONELY_GOD: {
        id: 'lonely_god',
        name: '善神孤舟',
        desc: '世界线按原典收束，你选择了另一条路'
    },
    MEMORY_SURGEON: {
        id: 'memory_surgeon',
        name: '记忆切除者',
        desc: '消耗时间石切除被污染的记忆'
    },
    SELF_PATH: {
        id: 'self_path',
        name: '唯己不灭',
        desc: '发现并选择隐线飞升路径：吾神虽散，唯己不灭'
    },
    DEATH_MASTER: {
        id: 'death_master',
        name: '死亡行者',
        desc: '累计死亡50次'
    }
};

/**
 * 检查所有成就条件，返回新解锁的成就数组
 * @param {Object} state - 游戏状态对象
 * @returns {Array} 新解锁的成就数组
 */
function checkAchievements(state) {
    const newlyUnlocked = [];

    const check = (achievement, condition) => {
        if (condition && !hasAchievement(achievement.id)) {
            unlockAchievement(achievement.id);
            newlyUnlocked.push(achievement);
        }
    };

    check(ACHIEVEMENTS.TIME_GHOST, true);
    check(ACHIEVEMENTS.FIRST_CORRUPTION, state.corruption_level >= 1);
    check(ACHIEVEMENTS.DEEP_CORRUPTION, state.corruption_level >= 2);
    check(ACHIEVEMENTS.TRUE_VISION, state.corruption_level >= 3);
    check(ACHIEVEMENTS.TIME_STONE_COLLECTOR, state.total_time_stones_earned >= 100);
    check(ACHIEVEMENTS.ERA_TRAVELER, state.eras_visited && state.eras_visited.length >= 2);
    check(ACHIEVEMENTS.DIVINITY_SEEKER, state.has_divinity);
    check(ACHIEVEMENTS.CULTIVATOR, state.cultivation_level >= 10);
    check(ACHIEVEMENTS.ASCENDED, state.ascension_path !== null);
    check(ACHIEVEMENTS.EXPLORER, state.explore_count >= 50);
    check(ACHIEVEMENTS.MULTIVERSE_WALKER, state.eras_visited && state.eras_visited.length >= 5);
    check(ACHIEVEMENTS.DEATH_MASTER, state.death_count >= 50);

    return newlyUnlocked;
}

/**
 * 获取所有成就列表
 * @returns {Array} 所有成就对象的数组
 */
function getAllAchievements() {
    return Object.values(ACHIEVEMENTS);
}

/**
 * 根据ID获取成就
 * @param {string} id - 成就ID
 * @returns {Object|undefined} 成就对象，未找到则返回undefined
 */
function getAchievementById(id) {
    return Object.values(ACHIEVEMENTS).find(a => a.id === id);
}
