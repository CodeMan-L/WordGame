/**
 * 克苏鲁腐化系统 - 《我掌握世界线》
 * 控制游戏中的理智腐化效果，包括文字扭曲、UI异常等
 */

const CORRUPTION_SYMBOLS = ['§', '¤', '¦', 'þ', 'ý', 'ü', 'ï', 'ë', 'â', 'à', 'á', 'ß', 'Þ', 'Ø', 'Æ', 'Ð', 'Ñ', 'Ω', 'Σ', 'Ψ'];

/**
 * 对文本施加腐化效果
 * @param {string} text - 原始文本
 * @param {number} level - 腐化等级 (0-4)
 * @returns {string} 腐化后的文本
 */
function corruptText(text, level) {
    if (level <= 0 || !text) return text;

    switch (level) {
        case 1:
            return addCorruptionSymbols(text, 1);
        case 2:
            return addCorruptionSymbols(replaceRandomChars(text, 0.05), 2);
        case 3:
            return addCorruptionSymbols(shuffleText(text), 3);
        case 4:
            return addCorruptionSymbols(replaceWithBlocks(shuffleText(text), 0.15), 4);
        default:
            return text;
    }
}

/**
 * Fisher-Yates 洗牌算法打乱文本字符
 * @param {string} text - 原始文本
 * @returns {string} 打乱后的文本
 */
function shuffleText(text) {
    if (!text || text.length <= 1) return text;
    const arr = text.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
}

/**
 * 在文本中随机插入腐化符号
 * @param {string} text - 原始文本
 * @param {number} level - 腐化等级，决定插入符号的比例
 * @returns {string} 插入符号后的文本
 */
function addCorruptionSymbols(text, level) {
    if (!text) return text;
    const ratios = { 1: 0.1, 2: 0.2, 3: 0.3, 4: 0.4 };
    const ratio = ratios[level] || 0.1;
    const count = Math.floor(text.length * ratio);
    const arr = text.split('');
    for (let i = 0; i < count; i++) {
        const pos = Math.floor(Math.random() * (arr.length + 1));
        const symbol = CORRUPTION_SYMBOLS[Math.floor(Math.random() * CORRUPTION_SYMBOLS.length)];
        arr.splice(pos, 0, symbol);
    }
    return arr.join('');
}

/**
 * 随机替换文本中的字符为腐化符号
 * @param {string} text - 原始文本
 * @param {number} ratio - 替换比例
 * @returns {string} 替换后的文本
 */
function replaceRandomChars(text, ratio) {
    if (!text) return text;
    const arr = text.split('');
    for (let i = 0; i < arr.length; i++) {
        if (Math.random() < ratio) {
            arr[i] = CORRUPTION_SYMBOLS[Math.floor(Math.random() * CORRUPTION_SYMBOLS.length)];
        }
    }
    return arr.join('');
}

/**
 * 将文本中的部分字符替换为方块符号
 * @param {string} text - 原始文本
 * @param {number} ratio - 替换比例
 * @returns {string} 替换后的文本
 */
function replaceWithBlocks(text, ratio) {
    if (!text) return text;
    const arr = text.split('');
    for (let i = 0; i < arr.length; i++) {
        if (Math.random() < ratio) {
            arr[i] = '█';
        }
    }
    return arr.join('');
}

/**
 * 获取腐化等级的中文名称
 * @param {number} level - 腐化等级 (0-4)
 * @returns {string} 等级名称
 */
function getCorruptionLevelName(level) {
    const names = ['纯净', '认知', '深层', '真视', '终末'];
    return names[level] || names[0];
}

/**
 * 获取腐化等级的详细效果信息
 * @param {number} level - 腐化等级 (0-4)
 * @returns {{name: string, description: string, color: string}} 效果信息
 */
function getCorruptionEffect(level) {
    const effects = [
        { name: '纯净', description: '你保持着清醒的理智', color: '#00ff00' },
        { name: '认知', description: '状态栏UI闪烁，对话出现乱码', color: '#ffff00' },
        { name: '深层', description: '状态栏消失，仅显示时间石数量', color: '#ff8800' },
        { name: '真视', description: '所有UI文字错乱，红色按钮出现', color: '#ff0000' },
        { name: '终末', description: '游戏崩溃，只能返回首页', color: '#8800ff' }
    ];
    return effects[level] || effects[0];
}

/**
 * 判断当前腐化等级是否可以显示完整状态栏
 * @param {number} level - 腐化等级
 * @returns {boolean} 是否可以显示完整状态栏
 */
function canShowFullStatus(level) {
    return level < 2;
}

/**
 * 获取腐化等级对应的UI CSS类名
 * @param {number} level - 腐化等级 (1-4)
 * @returns {string} CSS类名
 */
function getCorruptionUIEffect(level) {
    const classes = {
        1: 'corruption-flicker',
        2: 'corruption-hide',
        3: 'corruption-glitch',
        4: 'corruption-crash'
    };
    return classes[level] || '';
}
