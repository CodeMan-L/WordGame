const TEXT_POOL = {
    genesis: {
        descriptions: [
            '混沌中诞生了第一缕光',
            '古神的低语在虚空中回响',
            '时间的长河开始流动',
            '法则正在被编织',
            '万物的种子悄然埋下',
            '维度的壁垒逐渐形成',
            '神祇们睁开了眼睛',
            '灵气如潮水般充盈',
            '宇宙的轮廓逐渐清晰',
            '命运的丝线开始缠绕'
        ],
        events: [
            {
                id: 'gen_event_1',
                title: '神祇的注视',
                text: '你感受到一股庞大的意识扫过你的存在，似乎在好奇为什么命运之线无法穿过你。',
                effects: { corruption: 0, time_stones: 1 }
            },
            {
                id: 'gen_event_2',
                title: '灵气潮汐',
                text: '一波精纯的灵气涌入你的身体，修为飞速增长。但你隐约感觉到，这似乎是一个温柔的陷阱。',
                effects: { corruption: 0, time_stones: 2 }
            },
            {
                id: 'gen_event_3',
                title: '法则碎片',
                text: '一块蕴含着原始法则的碎片漂浮在你面前，触碰它可能获得强大的力量，也可能被污染。',
                effects: { corruption: 1, time_stones: 3 }
            },
            {
                id: 'gen_event_4',
                title: '虚空裂隙',
                text: '时空出现了一道微小的裂隙，透过它你看到了无数平行世界的可能性。',
                effects: { corruption: 0, time_stones: 2 }
            },
            {
                id: 'gen_event_5',
                title: '创世之痛',
                text: '诸神正在承受创世的痛苦，他们的哀嚎震动着整个新生的宇宙。',
                effects: { corruption: 1, time_stones: 1 }
            },
            {
                id: 'gen_event_6',
                title: '永恒的诱惑',
                text: '一个温柔的声音在你耳边低语：留下吧，这里有无尽的灵气和永恒的安宁。',
                effects: { corruption: 0, time_stones: 0, stay_option: true }
            },
            {
                id: 'gen_event_7',
                title: '维度风暴',
                text: '一场维度风暴席卷而来，你在混乱中艰难前行，却也因此触碰到了更高维度的奥秘。',
                effects: { corruption: 1, time_stones: 4 }
            },
            {
                id: 'gen_event_8',
                title: '命运的织网',
                text: '你看到命运女神正在编织命运之网，但所有的丝线都绕过了你——你是不存在的变数。',
                effects: { corruption: 0, time_stones: 2 }
            },
            {
                id: 'gen_event_9',
                title: '混沌之种',
                text: '一颗蕴含着混沌之力的种子落入你的手中，它可能是毁灭的源头，也可能是破局的关键。',
                effects: { corruption: 2, time_stones: 5 }
            },
            {
                id: 'gen_event_10',
                title: '诸神的博弈',
                text: '古神们正在进行一场决定宇宙命运的博弈，而你，是他们棋盘上唯一的未知因子。',
                effects: { corruption: 1, time_stones: 3 }
            }
        ],
        npc_reactions: [
            '那个存在...为什么我看不到他的命运？',
            '奇怪，因果律似乎在这里出现了断层。',
            '是幻象吗？还是...真正的变数？',
            '警告：检测到无法识别的存在性波动。',
            '他不应该存在于这个时间线上...'
        ]
    },
    common_era: {
        descriptions: [
            '平凡的日常下隐藏着未知的恐怖',
            '科技的光芒无法照亮深渊',
            '古老的秘密在阴影中低语',
            '历史的车轮正在悄然偏离轨道',
            '凡人的世界即将迎来剧变',
            '神秘学的暗流涌动',
            '命运的节点正在汇聚',
            '克苏鲁的低语开始被少数人听见',
            '理性与疯狂的边界逐渐模糊',
            '时间的裂缝正在扩大'
        ],
        events: [
            {
                id: 'ce_event_1',
                title: '神秘的古籍',
                text: '你在一间旧书店里发现了一本用未知文字书写的古籍，阅读它让你感到一阵莫名的恐惧。',
                effects: { corruption: 1, time_stones: 2 }
            },
            {
                id: 'ce_event_2',
                title: '深夜的低语',
                text: '深夜，你听到窗外传来模糊的低语声，像是某种古老的语言。当你看向窗外，什么都没有。',
                effects: { corruption: 1, time_stones: 1 }
            },
            {
                id: 'ce_event_3',
                title: '离奇的死亡',
                text: '一位著名的考古学家在发掘一处古代遗迹后离奇死亡，死前留下了一串奇怪的符号。',
                effects: { corruption: 0, time_stones: 2 }
            },
            {
                id: 'ce_event_4',
                title: '梦境入侵',
                text: '你开始做奇怪的梦，梦中有巨大的触手和无法描述的几何图形。醒来后，你发现床头有一滩水渍。',
                effects: { corruption: 2, time_stones: 3 }
            },
            {
                id: 'ce_event_5',
                title: '失踪的航班',
                text: '一架飞机在百慕大三角区域神秘消失，搜救队只找到了一些奇怪的鳞片。',
                effects: { corruption: 1, time_stones: 2 }
            },
            {
                id: 'ce_event_6',
                title: '深海信号',
                text: '科学家收到了来自马里亚纳海沟深处的奇怪信号，信号的模式与人类已知的任何语言都不匹配。',
                effects: { corruption: 1, time_stones: 3 }
            },
            {
                id: 'ce_event_7',
                title: '死亡的轮回',
                text: '你再次死去，然后再次醒来。这已经是第\{death_count\}次了。每次死亡，你都能听到更清晰的低语。',
                effects: { corruption: 1, time_stones: 1, death: true }
            },
            {
                id: 'ce_event_8',
                title: '博物馆之夜',
                text: '博物馆里的古埃及文物在夜间发出奇怪的光芒，木乃伊似乎动了一下。',
                effects: { corruption: 1, time_stones: 2 }
            },
            {
                id: 'ce_event_9',
                title: '失踪的记忆',
                text: '你发现自己失去了一段记忆，那段时间你似乎去了某个地方，但完全想不起来。',
                effects: { corruption: 1, time_stones: 1 }
            },
            {
                id: 'ce_event_10',
                title: '神秘的组织',
                text: '一个自称"守望者"的神秘组织找到了你，他们似乎知道你的秘密身份。',
                effects: { corruption: 0, time_stones: 4 }
            }
        ],
        npc_reactions: [
            '你看起来...很眼熟？但我肯定不认识你。',
            '你身上有一种奇怪的气息，让人不安。',
            '抱歉，我刚才说到哪了？好像忘了什么重要的事情。',
            '你是谁？为什么我感觉我们认识很久了？',
            '警告：非注册人员，系统无法识别您的身份。'
        ]
    },
    federation: {
        descriptions: [
            '赛博空间与修仙世界的交汇',
            '多元势力的暗流涌动',
            '数据与灵气的碰撞',
            '棋手们正在布局',
            '赛博修士的日常',
            '高位存在的注视',
            '虚拟与现实的边界模糊',
            '势力间的博弈正在升级',
            '时间线的异常正在被监测',
            '本土BOSS们的警觉'
        ],
        events: [
            {
                id: 'fed_event_1',
                title: '赛博空间的暗流',
                text: '你在赛博空间中发现了一处被加密的区域，破解后发现了关于克苏鲁污染的机密数据。',
                effects: { corruption: 1, time_stones: 3 }
            },
            {
                id: 'fed_event_2',
                title: '棋手的棋局',
                text: '你无意中闯入了一场由高位存在布置的棋局，他们惊讶地发现你是一个无法被计算的变量。',
                effects: { corruption: 2, time_stones: 4, boss_event: true }
            },
            {
                id: 'fed_event_3',
                title: '灵气节点',
                text: '你找到了一处隐藏的灵气节点，吸收后修为大增。',
                effects: { corruption: 0, time_stones: 2 }
            },
            {
                id: 'fed_event_4',
                title: '数据幽灵',
                text: '一个数据幽灵试图入侵你的意识，但你利用"不存在"的特性将其反噬。',
                effects: { corruption: 0, time_stones: 3 }
            },
            {
                id: 'fed_event_5',
                title: '势力的招揽',
                text: '多个势力同时向你抛出橄榄枝，他们都想利用你的特殊性。',
                effects: { corruption: 1, time_stones: 4 }
            },
            {
                id: 'fed_event_6',
                title: '污染报告',
                text: '联邦发布了一份机密污染报告，报告中提到了一种无法被常规手段检测的新型污染。',
                effects: { corruption: 1, time_stones: 2 }
            },
            {
                id: 'fed_event_7',
                title: '虚拟修行',
                text: '你进入了一个高级虚拟修行空间，在那里时间流速与外界不同。',
                effects: { corruption: 0, time_stones: 3 }
            },
            {
                id: 'fed_event_8',
                title: 'BOSS的注视',
                text: '一股强大的意识锁定了你，是联邦的本土BOSS之一。他们似乎开始注意到你的异常。',
                effects: { corruption: 2, time_stones: 2, boss_event: true }
            },
            {
                id: 'fed_event_9',
                title: '时间线波动',
                text: '联邦的时间监测系统检测到了异常波动，源头指向你所在的位置。',
                effects: { corruption: 1, time_stones: 2 }
            },
            {
                id: 'fed_event_10',
                title: '黑市交易',
                text: '你在黑市上发现了一块蕴含着时空能量的奇异宝石，卖家不知道它的真正价值。',
                effects: { corruption: 1, time_stones: 5 }
            }
        ],
        npc_reactions: [
            '警告：检测到非常规存在性波动',
            '你的命运线...为什么是空白的？',
            '数据异常：目标身份无法验证',
            '有趣，一个不在因果律中的变数',
            '你不应该存在于这个时代...'
        ],
        boss_options: [
            {
                id: 'boss_option_1',
                text: '伪装成普通数据波动',
                result: '你成功隐藏了自己的存在，但消耗了大量时间石。',
                effects: { corruption: 0, time_stones: -3 }
            },
            {
                id: 'boss_option_2',
                text: '利用"不存在"的特性逃离',
                result: '你在他们的计算中消失了，但这引起了更多BOSS的注意。',
                effects: { corruption: 2, time_stones: 0 }
            },
            {
                id: 'boss_option_3',
                text: '正面周旋，误导他们的判断',
                result: '你成功误导了他们，让他们以为你只是一个普通的异常数据。',
                effects: { corruption: 1, time_stones: 2 }
            },
            {
                id: 'boss_option_4',
                text: '主动暴露，挑战他们的权威',
                result: '你引起了BOSS们的强烈兴趣，他们决定将你作为研究对象。',
                effects: { corruption: 3, time_stones: 5 }
            }
        ]
    }
};

function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function generateEvent(era) {
    const pool = TEXT_POOL[era];
    if (!pool || !pool.events || pool.events.length === 0) {
        return null;
    }
    
    const event = getRandomItem(pool.events);
    return {
        ...event,
        description: getRandomItem(pool.descriptions),
        npc_reaction: getRandomItem(pool.npc_reactions)
    };
}

function getBossOptions() {
    return TEXT_POOL.federation.boss_options || [];
}
