const ACHIEVEMENTS = {
    TIME_GHOST: {
        id: 'time_ghost',
        name: '时序幽灵',
        description: '首次进入游戏，成为不存在于因果律中的变数',
        icon: '',
        unlocked: false,
        condition: 'start_game'
    },
    HAPPY_END_FAKE: {
        id: 'happy_end_fake',
        name: 'HAPPY END?',
        description: '在创世年选择留下3次，获得讽刺的虚假好结局',
        icon: '',
        unlocked: false,
        condition: 'stay_3_times'
    },
    WORLD_LINE_CONVERGE: {
        id: 'world_line_converge',
        name: '世界线收束',
        description: '在公元年死亡100次，触发世界线收束',
        icon: '',
        unlocked: false,
        condition: 'death_100'
    },
    FIRST_CORRUPTION: {
        id: 'first_corruption',
        name: '初次污染',
        description: '污染等级达到1级',
        icon: '',
        unlocked: false,
        condition: 'corruption_1'
    },
    DEEP_CORRUPTION: {
        id: 'deep_corruption',
        name: '深层污染',
        description: '污染等级达到2级',
        icon: '',
        unlocked: false,
        condition: 'corruption_2'
    },
    TRUE_VISION: {
        id: 'true_vision',
        name: '真视之眼',
        description: '污染等级达到3级，看到世界的真相',
        icon: '',
        unlocked: false,
        condition: 'corruption_3'
    },
    TIME_STONE_COLLECTOR: {
        id: 'time_stone_collector',
        name: '时间石收藏家',
        description: '累计获得100块时间石',
        icon: '',
        unlocked: false,
        condition: 'time_stones_100'
    },
    ERA_TRAVELER: {
        id: 'era_traveler',
        name: '时空旅者',
        description: '成功切换到不同时代',
        icon: '',
        unlocked: false,
        condition: 'change_era'
    },
    BOSS_DEALER: {
        id: 'boss_dealer',
        name: '棋手博弈',
        description: '成功与联邦BOSS周旋',
        icon: '',
        unlocked: false,
        condition: 'boss_interaction'
    },
    DIVINITY_SEEKER: {
        id: 'divinity_seeker',
        name: '神性追寻者',
        description: '获得神性碎片',
        icon: '',
        unlocked: false,
        condition: 'has_divinity'
    }
};

function checkAchievements(state) {
    const unlocked = [];
    
    if (!hasAchievement('time_ghost')) {
        unlockAchievement('time_ghost');
        unlocked.push(ACHIEVEMENTS.TIME_GHOST);
    }
    
    if (!hasAchievement('stay_3_times') && state.stay_count >= 3) {
        unlockAchievement('stay_3_times');
        unlocked.push(ACHIEVEMENTS.HAPPY_END_FAKE);
    }
    
    if (!hasAchievement('world_line_converge') && state.death_count >= 100) {
        unlockAchievement('world_line_converge');
        unlocked.push(ACHIEVEMENTS.WORLD_LINE_CONVERGE);
    }
    
    if (!hasAchievement('first_corruption') && state.corruption_level >= 1) {
        unlockAchievement('first_corruption');
        unlocked.push(ACHIEVEMENTS.FIRST_CORRUPTION);
    }
    
    if (!hasAchievement('deep_corruption') && state.corruption_level >= 2) {
        unlockAchievement('deep_corruption');
        unlocked.push(ACHIEVEMENTS.DEEP_CORRUPTION);
    }
    
    if (!hasAchievement('true_vision') && state.corruption_level >= 3) {
        unlockAchievement('true_vision');
        unlocked.push(ACHIEVEMENTS.TRUE_VISION);
    }
    
    if (!hasAchievement('has_divinity') && state.has_divinity) {
        unlockAchievement('has_divinity');
        unlocked.push(ACHIEVEMENTS.DIVINITY_SEEKER);
    }
    
    return unlocked;
}

function getAllAchievements() {
    return Object.values(ACHIEVEMENTS);
}

function getAchievementById(id) {
    return Object.values(ACHIEVEMENTS).find(a => a.id === id);
}
