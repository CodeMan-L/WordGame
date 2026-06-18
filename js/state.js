const ERAS = {
    GENESIS: 'genesis',
    COMMON_ERA: 'common_era',
    FEDERATION: 'federation'
};

const ERA_CONFIG = {
    [ERAS.GENESIS]: {
        id: ERAS.GENESIS,
        name: '创世年',
        range: '00-100',
        description: '诸神创世，混沌初开',
        core_play: '极速修炼、观察神祇、陷阱抉择',
        corruption_level: 0,
        can_select: false,
        need_coordinate: true
    },
    [ERAS.COMMON_ERA]: {
        id: ERAS.COMMON_ERA,
        name: '公元年',
        range: '0000-10000',
        description: '现代/近现代，科技萌芽',
        core_play: '模拟人生、探索神秘学',
        corruption_level: 1,
        can_select: true,
        default_node: 'ce_26'
    },
    [ERAS.FEDERATION]: {
        id: ERAS.FEDERATION,
        name: '联邦年',
        range: '0001-10000',
        description: '赛博修仙，多元文化交汇',
        core_play: '多势力周旋、发育成长',
        corruption_level: 2,
        can_select: true,
        default_node: 'fed_27'
    }
};

const PLAYER_STATE = {
    current_era: ERAS.FEDERATION,
    node_level: 'fed_27',
    corruption_level: 0,
    time_stones: 0,
    has_divinity: false,
    death_count: 0,
    stay_count: 0,
    achievements: [],
    game_over: false,
    game_over_reason: ''
};

const STORAGE_KEY = 'worldline_game_state';

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
    PLAYER_STATE.corruption_level = 0;
    PLAYER_STATE.time_stones = 0;
    PLAYER_STATE.has_divinity = false;
    PLAYER_STATE.death_count = 0;
    PLAYER_STATE.stay_count = 0;
    PLAYER_STATE.game_over = false;
    PLAYER_STATE.game_over_reason = '';
    saveState();
}

function getCurrentEraConfig() {
    return ERA_CONFIG[PLAYER_STATE.current_era];
}

function changeEra(eraId) {
    if (!ERA_CONFIG[eraId]) return false;
    
    const config = ERA_CONFIG[eraId];
    if (!config.can_select && !PLAYER_STATE.has_divinity) {
        return false;
    }
    
    PLAYER_STATE.current_era = eraId;
    PLAYER_STATE.node_level = config.default_node || eraId + '_0';
    PLAYER_STATE.corruption_level = Math.min(PLAYER_STATE.corruption_level, config.corruption_level);
    saveState();
    return true;
}

function addTimeStones(count) {
    PLAYER_STATE.time_stones += count;
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
    PLAYER_STATE.corruption_level = Math.min(4, PLAYER_STATE.corruption_level + amount);
    if (PLAYER_STATE.corruption_level >= 4) {
        gameOver('终末污染');
    }
    saveState();
}

function reduceCorruption(amount) {
    PLAYER_STATE.corruption_level = Math.max(0, PLAYER_STATE.corruption_level - amount);
    saveState();
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
    initState();
    PLAYER_STATE.achievements = achievements;
    saveState();
}

loadState();
