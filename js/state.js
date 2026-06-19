// ============================================
// 《我掌握世界线》 - 状态机核心
// ============================================

const ERAS = {
    GENESIS: 'genesis',
    COMMON_ERA: 'common_era',
    VOYAGE: 'voyage',
    ALLIANCE: 'alliance',
    FEDERATION: 'federation',
    REALM: 'realm',
    HORROR: 'horror',
    END: 'end'
};

const ERA_CONFIG = {
    [ERAS.GENESIS]: {
        id: ERAS.GENESIS,
        name: '创世年',
        range: '00-100',
        description: '诸神创世，混沌初开。灵气充沛，修炼极速，但温柔陷阱无处不在。',
        core_play: '极速修炼、观察神祇、陷阱抉择',
        corruption_base: 0,
        can_select: false,
        need_coordinate: true,
        default_node: 'gen_01',
        time_stone_cost: 10
    },
    [ERAS.COMMON_ERA]: {
        id: ERAS.COMMON_ERA,
        name: '公元年',
        range: '0000-10000',
        description: '现代/近现代，科技萌芽。平凡日常下隐藏着未知的恐怖。',
        core_play: '模拟人生、探索神秘学',
        corruption_base: 1,
        can_select: true,
        default_node: 'ce_26',
        time_stone_cost: 5
    },
    [ERAS.VOYAGE]: {
        id: ERAS.VOYAGE,
        name: '航旅年',
        range: '0000-10000',
        description: '星际大航海时代，科技扩张。深空遗迹中潜伏着不可名状之物。',
        core_play: '星际拓荒、种族发现、资源采集',
        corruption_base: 1,
        can_select: false,
        need_coordinate: true,
        default_node: 'voy_01',
        time_stone_cost: 8
    },
    [ERAS.ALLIANCE]: {
        id: ERAS.ALLIANCE,
        name: '人联年',
        range: '000-1000',
        description: '人类统一联盟，高度秩序。思想审查之下，污染悄然渗透。',
        core_play: '秩序博弈、躲避思想审查',
        corruption_base: 2,
        can_select: true,
        default_node: 'all_128',
        time_stone_cost: 8
    },
    [ERAS.FEDERATION]: {
        id: ERAS.FEDERATION,
        name: '联邦年',
        range: '0001-10000',
        description: '赛博修仙，多元文化交汇。棋手们正在布局，而你是不在棋盘上的变数。',
        core_play: '多势力周旋、发育成长',
        corruption_base: 2,
        can_select: true,
        default_node: 'fed_27',
        time_stone_cost: 5
    },
    [ERAS.REALM]: {
        id: ERAS.REALM,
        name: '界盟年',
        range: '0000-10000',
        description: '跨位面联盟，维度大融合。克苏鲁已成为"高维模因"。',
        core_play: '高维探索、外交与冲突',
        corruption_base: 3,
        can_select: true,
        default_node: 'rlm_01',
        time_stone_cost: 12
    },
    [ERAS.HORROR]: {
        id: ERAS.HORROR,
        name: '赫年',
        range: '00-10',
        description: '克苏鲁苏醒，世界壁垒全面失效。末日降临，万物在恐惧中挣扎。',
        core_play: '末日求生、最终抵抗',
        corruption_base: 3,
        can_select: false,
        auto_advance: true,
        default_node: 'hor_01',
        time_stone_cost: 20
    },
    [ERAS.END]: {
        id: ERAS.END,
        name: '灭世年',
        range: '0-10',
        description: '万物终结，时间线收束。直面克苏鲁本体，这是最后的战场。',
        core_play: '终局决战',
        corruption_base: 4,
        can_select: false,
        auto_advance: true,
        default_node: 'end_01',
        time_stone_cost: 0
    }
};

const ASCENSION_PATHS = {
    MECHANICAL: { id: 'mechanical', name: '机械飞升', opposite: '机械腐朽', philosophy: '秩序与熵增' },
    PSIONIC: { id: 'psionic', name: '灵能飞升', opposite: '灵能枯竭', philosophy: '超脱与虚无' },
    SOUL: { id: 'soul', name: '魂魄飞升', opposite: '魂飞魄散', philosophy: '凝练与耗散' },
    TRUE_SPIRIT: { id: 'true_spirit', name: '真灵永存', opposite: '真灵迷失', philosophy: '锚定与漂泊' },
    FAITH: { id: 'faith', name: '信仰之跃', opposite: '信仰无存', philosophy: '笃信与质疑' },
    FLESH: { id: 'flesh', name: '血肉永存', opposite: '血肉苦弱', philosophy: '本能与失控' },
    SELF: { id: 'self', name: '吾神虽散，唯己不灭', opposite: null, philosophy: '绝对自我，不假外求', hidden: true }
};

const PLAYER_STATE = {
    current_era: ERAS.FEDERATION,
    node_level: 'fed_27',
    corruption_points: 0,
    corruption_level: 0,
    time_stones: 10,
    total_time_stones_earned: 10,
    has_divinity: false,
    divinity_fragments: 0,
    cultivation_level: 0,
    ascension_path: null,
    death_count: 0,
    stay_count: 0,
    eras_visited: [ERAS.FEDERATION],
    achievements: [],
    game_over: false,
    game_over_reason: '',
    red_button_visible: false,
    explore_count: 0
};

const CORRUPTION_THRESHOLDS = [0, 10, 30, 60, 100];

function calcCorruptionLevel(points) {
    for (let i = CORRUPTION_THRESHOLDS.length - 1; i >= 0; i--) {
        if (points >= CORRUPTION_THRESHOLDS[i]) return i;
    }
    return 0;
}

const STORAGE_KEY = 'worldline_game_state_v2';

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(PLAYER_STATE, parsed);
        }
    } catch (e) {
        console.error('Failed to load state:', e);
    }
}

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(PLAYER_STATE));
    } catch (e) {
        console.error('Failed to save state:', e);
    }
}

function initState() {
    PLAYER_STATE.current_era = ERAS.FEDERATION;
    PLAYER_STATE.node_level = 'fed_27';
    PLAYER_STATE.corruption_points = 0;
    PLAYER_STATE.corruption_level = 0;
    PLAYER_STATE.time_stones = 10;
    PLAYER_STATE.total_time_stones_earned = 10;
    PLAYER_STATE.has_divinity = false;
    PLAYER_STATE.divinity_fragments = 0;
    PLAYER_STATE.cultivation_level = 0;
    PLAYER_STATE.ascension_path = null;
    PLAYER_STATE.death_count = 0;
    PLAYER_STATE.stay_count = 0;
    PLAYER_STATE.eras_visited = [ERAS.FEDERATION];
    PLAYER_STATE.achievements = [];
    PLAYER_STATE.game_over = false;
    PLAYER_STATE.game_over_reason = '';
    PLAYER_STATE.red_button_visible = false;
    PLAYER_STATE.explore_count = 0;
    saveState();
}

function getCurrentEraConfig() {
    return ERA_CONFIG[PLAYER_STATE.current_era];
}

function changeEra(eraId) {
    if (!ERA_CONFIG[eraId]) return false;

    const config = ERA_CONFIG[eraId];
    if (!config.can_select && !PLAYER_STATE.has_divinity && !PLAYER_STATE.eras_visited.includes(eraId)) {
        return false;
    }

    const cost = config.time_stone_cost || 5;
    if (!consumeTimeStones(cost)) return false;

    PLAYER_STATE.current_era = eraId;
    PLAYER_STATE.node_level = config.default_node || eraId + '_0';

    if (!PLAYER_STATE.eras_visited.includes(eraId)) {
        PLAYER_STATE.eras_visited.push(eraId);
    }

    if (PLAYER_STATE.corruption_level < config.corruption_base) {
        PLAYER_STATE.corruption_points = CORRUPTION_THRESHOLDS[config.corruption_base];
        PLAYER_STATE.corruption_level = config.corruption_base;
    }

    saveState();
    return { success: true, cost: cost };
}

function addTimeStones(count) {
    PLAYER_STATE.time_stones += count;
    PLAYER_STATE.total_time_stones_earned += Math.max(0, count);
    saveState();
}

function consumeTimeStones(count) {
    if (PLAYER_STATE.time_stones >= count) {
        PLAYER_STATE.time_stones -= count;
        saveState();
        return true;
    }
    return false;
}

function addCorruption(amount) {
    PLAYER_STATE.corruption_points += amount;
    PLAYER_STATE.corruption_level = calcCorruptionLevel(PLAYER_STATE.corruption_points);
    if (PLAYER_STATE.corruption_level >= 3) {
        PLAYER_STATE.red_button_visible = true;
    }
    if (PLAYER_STATE.corruption_level >= 4) {
        gameOver('终末污染');
    }
    saveState();
}

function reduceCorruption(amount) {
    PLAYER_STATE.corruption_points = Math.max(0, PLAYER_STATE.corruption_points - amount);
    PLAYER_STATE.corruption_level = calcCorruptionLevel(PLAYER_STATE.corruption_points);
    if (PLAYER_STATE.corruption_level < 3) {
        PLAYER_STATE.red_button_visible = false;
    }
    saveState();
}

function exciseMemory() {
    if (consumeTimeStones(20)) {
        reduceCorruption(40);
        return true;
    }
    return false;
}

function addDeath() {
    PLAYER_STATE.death_count++;
    saveState();
}

function addStay() {
    PLAYER_STATE.stay_count++;
    saveState();
}

function resetStayCount() {
    PLAYER_STATE.stay_count = 0;
    saveState();
}

function addCultivation(amount) {
    PLAYER_STATE.cultivation_level += amount;
    saveState();
}

function addDivinityFragment() {
    PLAYER_STATE.divinity_fragments++;
    if (PLAYER_STATE.divinity_fragments >= 3) {
        PLAYER_STATE.has_divinity = true;
    }
    saveState();
}

function setAscensionPath(pathId) {
    if (ASCENSION_PATHS[pathId]) {
        PLAYER_STATE.ascension_path = pathId;
        saveState();
        return true;
    }
    return false;
}

function unlockAchievement(achievementId) {
    if (!PLAYER_STATE.achievements.includes(achievementId)) {
        PLAYER_STATE.achievements.push(achievementId);
        saveState();
        return true;
    }
    return false;
}

function hasAchievement(achievementId) {
    return PLAYER_STATE.achievements.includes(achievementId);
}

function gameOver(reason) {
    PLAYER_STATE.game_over = true;
    PLAYER_STATE.game_over_reason = reason;
    saveState();
}

function hardReset() {
    localStorage.removeItem(STORAGE_KEY);
    initState();
}

function softReset() {
    const achievements = [...PLAYER_STATE.achievements];
    const totalEarned = PLAYER_STATE.total_time_stones_earned;
    initState();
    PLAYER_STATE.achievements = achievements;
    PLAYER_STATE.total_time_stones_earned = totalEarned;
    saveState();
}

function causalFuse() {
    const achievements = [...PLAYER_STATE.achievements];
    const totalEarned = PLAYER_STATE.total_time_stones_earned;
    initState();
    PLAYER_STATE.achievements = achievements;
    PLAYER_STATE.total_time_stones_earned = totalEarned;
    PLAYER_STATE.time_stones = 10;
    saveState();
}

loadState();
