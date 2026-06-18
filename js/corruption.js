const CORRUPTION_SYMBOLS = ['', '', '', '', '', '', 'þ', 'ý', 'ü', 'ï', 'ë', 'â', 'à', 'á', 'ß', 'Þ', 'Ø', 'Æ', 'Ð', 'Ñ'];

function corruptText(text, level) {
    if (!text || level <= 0) return text;
    
    let result = text;
    
    if (level >= 3) {
        result = shuffleText(result);
    }
    
    if (level >= 1) {
        result = addCorruptionSymbols(result, level);
    }
    
    return result;
}

function shuffleText(text) {
    const chars = text.split('');
    for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
}

function addCorruptionSymbols(text, level) {
    const insertionCount = Math.floor(text.length * (level * 0.1));
    let result = text;
    
    for (let i = 0; i < insertionCount; i++) {
        const position = Math.floor(Math.random() * result.length);
        const symbol = CORRUPTION_SYMBOLS[Math.floor(Math.random() * CORRUPTION_SYMBOLS.length)];
        result = result.slice(0, position) + symbol + result.slice(position);
    }
    
    return result;
}

function getCorruptionLevelName(level) {
    const names = ['纯净', '认知', '深层', '真视', '终末'];
    return names[level] || '未知';
}

function getCorruptionEffect(level) {
    switch (level) {
        case 0:
            return { name: '纯净', description: '你保持着清醒的理智', color: '#00ff00' };
        case 1:
            return { name: '认知', description: '状态栏UI闪烁，对话出现乱码', color: '#ffff00' };
        case 2:
            return { name: '深层', description: '状态栏消失，仅显示时间石数量', color: '#ff8800' };
        case 3:
            return { name: '真视', description: '所有UI文字错乱，游戏无法正常操作', color: '#ff0000' };
        case 4:
            return { name: '终末', description: '游戏崩溃，只能返回首页', color: '#8800ff' };
        default:
            return { name: '未知', description: '异常状态', color: '#ffffff' };
    }
}

function canShowFullStatus(level) {
    return level < 2;
}
