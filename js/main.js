// ============================================================
// 《我掌握世界线》 - 主游戏逻辑
// World Line Master - Main Game Logic
// ============================================================

/**
 * 更新所有界面元素，反映当前游戏状态
 */
function updateUI() {
    const config = getCurrentEraConfig();

    // 时代名称
    const eraEl = document.getElementById('current_era');
    if (eraEl) {
        eraEl.textContent = config ? config.name : '未知领域';
    }

    // 腐化等级
    const corruptionEl = document.getElementById('corruption_level');
    if (corruptionEl) {
        const level = PLAYER_STATE.corruption_level;
        const corruptionInfo = getCorruptionEffect(level);
        corruptionEl.textContent = corruptionInfo.name;
        corruptionEl.style.color = corruptionInfo.color;
    }

    // 时间石
    const stonesEl = document.getElementById('time_stones');
    if (stonesEl) {
        stonesEl.textContent = PLAYER_STATE.time_stones;
    }

    // 世界线编号
    const worldlineEl = document.getElementById('worldline');
    if (worldlineEl) {
        const visited = PLAYER_STATE.eras_visited ? PLAYER_STATE.eras_visited.length : 0;
        const num = String(visited).padStart(3, '0');
        worldlineEl.textContent = 'Alpha-' + num;
    }

    // 修为
    const cultivationEl = document.getElementById('cultivation_display');
    if (cultivationEl) {
        if (PLAYER_STATE.cultivation_level > 0) {
            cultivationEl.textContent = '修为: ' + PLAYER_STATE.cultivation_level;
            cultivationEl.style.display = '';
        } else {
            cultivationEl.style.display = 'none';
        }
    }

    // 神性
    const divinityEl = document.getElementById('divinity_display');
    if (divinityEl) {
        if (PLAYER_STATE.has_divinity) {
            divinityEl.textContent = '神性: 已觉醒';
            divinityEl.style.color = '#ff8800';
        } else if (PLAYER_STATE.divinity_fragments > 0) {
            divinityEl.textContent = '神性: ' + PLAYER_STATE.divinity_fragments + '/3';
            divinityEl.style.color = '#ff8800';
        } else {
            divinityEl.style.display = 'none';
        }
    }

    // 腐化进度条
    const corruptionBar = document.querySelector('.corruption-bar');
    if (corruptionBar) {
        const width = Math.min(PLAYER_STATE.corruption_points / 100 * 100, 100);
        corruptionBar.style.width = width + '%';
        const corruptionInfo = getCorruptionEffect(PLAYER_STATE.corruption_level);
        corruptionBar.style.backgroundColor = corruptionInfo.color;
    }

    // 腐化视觉效果
    const corruptionLevel = PLAYER_STATE.corruption_level;
    const statusItems = document.querySelectorAll('.status-item');

    if (!canShowFullStatus(corruptionLevel)) {
        statusItems.forEach(function(item) {
            if (!item.classList.contains('time-stones-item')) {
                item.style.display = 'none';
            }
        });
    } else {
        statusItems.forEach(function(item) {
            item.style.display = '';
        });
    }

    // 腐化闪烁效果
    const gameContainer = document.querySelector('.container') || document.body;
    if (corruptionLevel >= 1) {
        gameContainer.classList.add('corruption-flicker');
    } else {
        gameContainer.classList.remove('corruption-flicker');
    }
    if (corruptionLevel >= 3) {
        gameContainer.classList.add('corruption-glitch');
    } else {
        gameContainer.classList.remove('corruption-glitch');
    }

    // 红色按钮
    const redBtn = document.getElementById('red_button_container');
    if (redBtn) {
        redBtn.style.display = PLAYER_STATE.red_button_visible ? '' : 'none';
    }

    // 游戏结束弹窗
    if (PLAYER_STATE.game_over) {
        showModal('世界线崩塌', PLAYER_STATE.game_over_reason || '你已迷失在世界线之间……');
    }
}

/**
 * 向事件日志中添加一条记录
 * @param {string} text - 日志文本
 * @param {string} type - 日志类型: 'event', 'system', 'warning', 'danger'
 */
function addLog(text, type) {
    const logEl = document.getElementById('event_log');
    if (!logEl) return;

    const entry = document.createElement('div');
    entry.className = 'log-entry log-' + (type || 'event');

    // 对文本施加腐化效果
    const corruptionLevel = PLAYER_STATE.corruption_level;
    const displayText = corruptText(text, corruptionLevel);

    const timestamp = document.createElement('span');
    timestamp.className = 'log-time';
    const now = new Date();
    timestamp.textContent = '[' + String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0') + '] ';

    const content = document.createElement('span');
    content.className = 'log-content';
    content.innerHTML = displayText;

    entry.appendChild(timestamp);
    entry.appendChild(content);
    logEl.appendChild(entry);

    // 自动滚动到底部
    logEl.scrollTop = logEl.scrollHeight;
}

/**
 * 清空日志区域并显示欢迎信息
 */
function clearLog() {
    const logEl = document.getElementById('event_log');
    if (logEl) {
        logEl.innerHTML = '';
    }
    addLog('世界线观测系统已启动。你的意识漂浮在时间的长河之上，无数可能性在眼前展开……', 'system');
    addLog('输入指令，开始你的观测之旅。每一次选择，都将改写世界的命运。', 'system');
}

/**
 * 显示模态弹窗
 * @param {string} title - 弹窗标题
 * @param {string} content - 弹窗内容（HTML）
 */
function showModal(title, content) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal_title');
    const modalContent = document.getElementById('modal_content');

    if (!modal || !modalTitle || !modalContent) return;

    // 对标题和内容施加腐化效果
    const corruptionLevel = PLAYER_STATE.corruption_level;
    modalTitle.textContent = corruptText(title, corruptionLevel);
    modalContent.innerHTML = corruptText(content, corruptionLevel);

    modal.style.display = 'flex';
    modal.classList.add('modal-visible');
}

/**
 * 关闭模态弹窗
 */
function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('modal-visible');
    }
}

/**
 * 探索 - 核心游戏行动
 * 在当前时代中生成事件，推动剧情发展
 */
function explore() {
    if (PLAYER_STATE.game_over) {
        addLog('世界线已经崩塌，你无法再进行观测。', 'danger');
        return;
    }

    PLAYER_STATE.explore_count = (PLAYER_STATE.explore_count || 0) + 1;

    // 从当前时代生成事件
    const event = generateEvent(PLAYER_STATE.current_era);
    if (!event) {
        addLog('这片时空异常安静，什么也没有发生……', 'system');
        updateUI();
        return;
    }

    // 显示事件标题
    if (event.title) {
        addLog('【' + event.title + '】', 'event');
    }

    // 显示事件文本
    if (event.text) {
        addLog(event.text, 'event');
    }

    // 显示NPC反应
    if (event.npc_reaction) {
        addLog('——' + event.npc_reaction, 'event');
    }

    // ---- 应用各种效果 ----

    // 腐化效果
    if (event.corruption) {
        addCorruption(event.corruption);
        if (event.corruption > 0) {
            addLog('你感到一股不可名状的侵蚀正在蔓延……腐化 +' + event.corruption, 'warning');
        }
    }

    // 时间石效果
    if (event.time_stones) {
        if (event.time_stones > 0) {
            addTimeStones(event.time_stones);
            addLog('时间碎片在虚空中闪烁，你将其收入囊中。时间石 +' + event.time_stones, 'system');
        } else if (event.time_stones < 0) {
            consumeTimeStones(Math.abs(event.time_stones));
            addLog('时间之力从指缝间流逝……时间石 ' + event.time_stones, 'warning');
        }
    }

    // 死亡事件
    if (event.death) {
        addDeath();
        addLog('你的意识在时间洪流中消散，又被世界线重新编织……死亡次数 +1', 'danger');

        // 在凡人时代，死亡次数过多触发世界线收束
        if (PLAYER_STATE.current_era === 'common_era' && PLAYER_STATE.death_count >= 100) {
            addLog('……世界线开始收束。你已死亡太多次，命运的齿轮碾碎了所有可能性。', 'danger');
            addLog('在无数次轮回的尽头，你隐约看到了一条超越生死的道路……', 'warning');
            unlockAchievement('worldline_convergence');
            showModal('世界线收束',
                '你在凡人时代的死亡次数已达到临界值。<br><br>' +
                '无数条世界线在你眼前坍缩为一点，你看到了——<br>' +
                '<strong>超越死亡的可能性。</strong><br><br>' +
                '新的飞升路径已解锁。');
            PLAYER_STATE.death_count = 0;
        }
    }

    // 停留选项（创世时代）
    if (event.stay_option) {
        showModal('永恒的诱惑',
            '这片时空如此宁静，灵气充沛，万物和谐。你想要永远留在这里吗？<br><br>' +
            '<em>你已经选择了 ' + PLAYER_STATE.stay_count + ' 次留下。</em>');
        var modalFooter = document.querySelector('.modal-footer');
        if (modalFooter) {
            modalFooter.innerHTML = '<button class="modal-btn" onclick="handleStayChoice(true)">留下</button>' +
                '<button class="modal-btn" onclick="handleStayChoice(false)">离开</button>';
        }
        return; // 等待玩家选择
    }

    // Boss事件
    if (event.boss_event) {
        showBossOptions();
        return; // 等待玩家选择
    }

    // 神性碎片
    if (event.divinity_fragment) {
        addDivinityFragment();
        addLog('一道微光从时间的裂隙中浮现——神性碎片。你触碰它，感受到了超越凡俗的力量。', 'system');
    }

    // 修为增长
    if (event.cultivation) {
        addCultivation(event.cultivation);
        addLog('你在时间的回廊中感悟天地法则。修为 +' + event.cultivation, 'system');
    }

    // 飞升提示
    if (event.ascension_hint) {
        if (!PLAYER_STATE.ascension_path && PLAYER_STATE.cultivation_level >= 5) {
            showAscensionPaths();
            return; // 等待玩家选择
        }
    }

    // 检查成就
    checkAchievements(PLAYER_STATE);

    // 更新界面
    updateUI();
}

/**
 * 处理停留/离开选择（创世时代）
 * @param {boolean} stay - 是否停留
 */
function handleStayChoice(stay) {
    closeModal();

    if (stay) {
        addStay();
        addLog('你选择留在这片宁静的时空中，感受着存在的温暖……', 'event');

        // 停留3次触发特殊结局
        if (PLAYER_STATE.stay_count >= 3) {
            unlockAchievement('happy_end_fake');
            addLog('你已经停留了太多次。时间在这里凝固，世界变得如此安详。', 'system');
            addLog('也许……这就是最好的结局。', 'system');
            addLog('========================================', 'danger');
            addLog('【HAPPY END?】', 'event');
            addLog('你选择永远留在创世年的温柔陷阱中……', 'event');
            addLog('这是一个充满讽刺意味的虚假好结局。', 'event');
            addLog('你放弃了对抗宿命的机会。', 'event');
            addLog('========================================', 'danger');
            showModal('HAPPY END?',
                '你选择了永远停留在这片时空。<br><br>' +
                '没有恐惧，没有腐化，没有无尽的轮回。<br>' +
                '只有永恒的宁静。<br><br>' +
                '<em>——但这是真正的结局吗？</em>');
            gameOver('虚假结局');
            updateUI();
            return;
        }
    } else {
        resetStayCount();
        addLog('你挣脱了温柔的束缚，继续在时间中前行。', 'event');
    }

    checkAchievements(PLAYER_STATE);
    updateUI();
}

/**
 * 显示Boss遭遇选项
 */
function showBossOptions() {
    const options = getBossOptions();
    if (!options || options.length === 0) {
        addLog('虚空中的威胁暂时退去了。', 'system');
        updateUI();
        return;
    }

    let content = '<div class="boss-encounter">';
    content += '<p class="boss-intro">一股强大的存在阻挡了你的去路。你必须做出选择：</p>';

    options.forEach(function(opt, idx) {
        content += '<button onclick="handleBossChoice(' + idx + ')" class="btn btn-boss-choice">' +
            (opt.title || opt.name || '选项 ' + (idx + 1)) +
            '</button>';
        if (opt.text || opt.description) {
            content += '<p class="boss-option-desc">' + (opt.text || opt.description) + '</p>';
        }
    });

    content += '</div>';

    showModal('遭遇', content);
}

/**
 * 处理Boss选项选择
 * @param {number} index - 选项索引
 */
function handleBossChoice(index) {
    const options = getBossOptions();
    if (!options || index < 0 || index >= options.length) {
        closeModal();
        updateUI();
        return;
    }

    const choice = options[index];
    closeModal();

    addLog('你选择了：' + (choice.title || choice.name || '未知选项'), 'event');

    // 应用选择效果
    if (choice.effects) {
        if (choice.effects.corruption) {
            addCorruption(choice.effects.corruption);
            if (choice.effects.corruption > 0) {
                addLog('腐化之力侵蚀了你的意识……腐化 +' + choice.effects.corruption, 'warning');
            } else if (choice.effects.corruption < 0) {
                reduceCorruption(Math.abs(choice.effects.corruption));
                addLog('你的意识得到了短暂的净化。腐化 ' + choice.effects.corruption, 'system');
            }
        }

        if (choice.effects.time_stones) {
            if (choice.effects.time_stones > 0) {
                addTimeStones(choice.effects.time_stones);
                addLog('时间石 +' + choice.effects.time_stones, 'system');
            } else if (choice.effects.time_stones < 0) {
                consumeTimeStones(Math.abs(choice.effects.time_stones));
                addLog('时间石 ' + choice.effects.time_stones, 'warning');
            }
        }

        if (choice.effects.death) {
            addDeath();
            addLog('你在对抗中陨落……死亡 +1', 'danger');
        }

        if (choice.effects.cultivation) {
            addCultivation(choice.effects.cultivation);
            addLog('此战让你有所感悟。修为 +' + choice.effects.cultivation, 'system');
        }

        if (choice.effects.divinity_fragment) {
            addDivinityFragment();
            addLog('在战斗的余波中，你捕捉到了一丝神性的碎片。', 'system');
        }
    }

    if (choice.result_text || choice.text) {
        addLog(choice.result_text || choice.text, 'event');
    }

    checkAchievements(PLAYER_STATE);
    updateUI();
}

/**
 * 显示时代选择界面
 */
function changeEraAction() {
    if (PLAYER_STATE.game_over) {
        addLog('世界线已经崩塌，你无法穿越时空。', 'danger');
        return;
    }

    let content = '<div class="era-selection">';
    content += '<p class="era-intro">时间之河在你面前展开，选择你要前往的时代：</p>';

    Object.values(ERAS).forEach(function(eraId) {
        const cfg = ERA_CONFIG[eraId];
        if (!cfg) return;

        const cost = cfg.time_stone_cost || 0;
        const canAfford = PLAYER_STATE.time_stones >= cost;
        const isCurrent = PLAYER_STATE.current_era === eraId;
        const isAccessible = cfg.can_select || PLAYER_STATE.has_divinity || PLAYER_STATE.eras_visited.includes(eraId);

        content += '<div class="era-option' + (isCurrent ? ' era-current' : '') +
            (!isAccessible ? ' era-locked' : '') + '">';

        content += '<div class="era-name">' + cfg.name;
        if (isCurrent) content += ' <span class="era-current-tag">[当前]</span>';
        content += '</div>';

        content += '<div class="era-desc">' + (cfg.description || '') + '</div>';

        if (cost > 0) {
            content += '<div class="era-cost">消耗时间石: ' + cost +
                (canAfford ? '' : ' <span class="insufficient">(不足)</span>') + '</div>';
        }

        if (!isAccessible) {
            content += '<div class="era-requirement">需要世界坐标或神性方可进入</div>';
        }

        if (isAccessible && canAfford && !isCurrent) {
            content += '<button onclick="selectEra(\'' + eraId + '\')" class="btn btn-era-select">前往</button>';
        } else if (isCurrent) {
            content += '<span class="era-here">你在此处</span>';
        } else if (!isAccessible) {
            content += '<span class="era-locked-text">时空封锁</span>';
        } else if (!canAfford) {
            content += '<span class="era-locked-text">时间石不足</span>';
        }

        content += '</div>';
    });

    content += '</div>';

    showModal('穿越时空', content);
}

/**
 * 执行时代切换
 * @param {string} eraId - 目标时代ID
 */
function selectEra(eraId) {
    const cfg = ERA_CONFIG[eraId];
    if (!cfg) {
        addLog('该时代不存在于已知的时间线上。', 'warning');
        return;
    }

    if (PLAYER_STATE.current_era === eraId) {
        addLog('你已经身处这个时代。', 'system');
        closeModal();
        return;
    }

    const oldEraName = getCurrentEraConfig() ? getCurrentEraConfig().name : '未知';
    const result = changeEra(eraId);

    closeModal();

    if (!result) {
        addLog('无法进入该时代！需要世界坐标或神性，或时间石不足。', 'warning');
        return;
    }

    addLog('时空扭曲，你的意识穿越了时间的壁障——', 'system');
    addLog('从「' + oldEraName + '」抵达「' + cfg.name + '」。', 'event');
    addLog(cfg.description, 'system');
    addLog('消耗了 ' + result.cost + ' 块时间石。', 'system');

    if (PLAYER_STATE.corruption_level < cfg.corruption_base) {
        // corruption was raised by changeEra
    }

    checkAchievements(PLAYER_STATE);
    updateUI();
}

/**
 * 显示详细状态面板
 */
function showStatus() {
    const corruptionLevel = PLAYER_STATE.corruption_level;

    // 高腐化时只能看到时间石
    if (corruptionLevel >= 2 && !canShowFullStatus(corruptionLevel)) {
        showModal('状态',
            '<div class="status-panel">' +
            '<p class="status-corrupted">你的意识已被严重侵蚀，无法感知自身状态……</p>' +
            '<div class="status-item">时间石: ' + PLAYER_STATE.time_stones + '</div>' +
            '</div>');
        return;
    }

    const config = getCurrentEraConfig();
    let html = '<div class="status-panel">';

    html += '<div class="status-row"><span class="status-label">当前时代</span><span class="status-value">' +
        (config ? config.name : '未知') + '</span></div>';

    html += '<div class="status-row"><span class="status-label">世界线</span><span class="status-value">Alpha-' +
        String(PLAYER_STATE.eras_visited ? PLAYER_STATE.eras_visited.length : 0).padStart(3, '0') +
        '</span></div>';

    html += '<div class="status-row"><span class="status-label">时间石</span><span class="status-value">' +
        PLAYER_STATE.time_stones + '</span></div>';

    html += '<div class="status-row"><span class="status-label">腐化等级</span><span class="status-value">' +
        getCorruptionLevelName(corruptionLevel) + ' (' + corruptionLevel + ')</span></div>';

    html += '<div class="status-row"><span class="status-label">死亡次数</span><span class="status-value">' +
        PLAYER_STATE.death_count + '</span></div>';

    html += '<div class="status-row"><span class="status-label">探索次数</span><span class="status-value">' +
        (PLAYER_STATE.explore_count || 0) + '</span></div>';

    if (PLAYER_STATE.cultivation_level > 0) {
        html += '<div class="status-row"><span class="status-label">修为</span><span class="status-value">' +
            PLAYER_STATE.cultivation_level + '</span></div>';
    }

    if (PLAYER_STATE.divinity_fragments > 0) {
        html += '<div class="status-row"><span class="status-label">神性碎片</span><span class="status-value">' +
            PLAYER_STATE.divinity_fragments + '</span></div>';
    }

    if (PLAYER_STATE.ascension_path) {
        const pathConfig = ASCENSION_PATHS[PLAYER_STATE.ascension_path];
        html += '<div class="status-row"><span class="status-label">飞升路径</span><span class="status-value">' +
            (pathConfig ? pathConfig.name : PLAYER_STATE.ascension_path) + '</span></div>';
    }

    html += '</div>';

    showModal('观测者状态', html);
}

/**
 * 观测时间线 - 查看时代信息、腐化状态和成就进度
 */
function viewTimeline() {
    const config = getCurrentEraConfig();
    const corruptionLevel = PLAYER_STATE.corruption_level;
    const allAchievements = getAllAchievements();
    const unlockedCount = allAchievements.filter(function(a) { return a.unlocked; }).length;

    let html = '<div class="timeline-panel">';

    html += '<div class="timeline-section">';
    html += '<h3>当前时代</h3>';
    html += '<p>' + (config ? config.name : '未知') + '</p>';
    if (config && config.timeline_description) {
        html += '<p class="timeline-desc">' + config.timeline_description + '</p>';
    }
    html += '</div>';

    html += '<div class="timeline-section">';
    html += '<h3>世界线状态</h3>';
    html += '<p>编号: Alpha-' + String(PLAYER_STATE.eras_visited ? PLAYER_STATE.eras_visited.length : 0).padStart(3, '0') + '</p>';
    html += '<p>腐化: ' + getCorruptionLevelName(corruptionLevel) + ' (' + corruptionLevel + '/10)</p>';

    if (corruptionLevel >= 3) {
        html += '<p class="timeline-warning">⚠ 警告：世界线稳定性下降，观测数据可能失真</p>';
    }
    if (corruptionLevel >= 6) {
        html += '<p class="timeline-danger">⛔ 严重警告：现实结构正在瓦解</p>';
    }
    html += '</div>';

    html += '<div class="timeline-section">';
    html += '<h3>成就进度</h3>';
    html += '<p>已解锁: ' + unlockedCount + ' / ' + allAchievements.length + '</p>';
    html += '</div>';

    html += '</div>';

    showModal('时间线观测', html);
}

/**
 * 显示所有成就及其解锁状态
 */
function showAchievements() {
    const allAchievements = getAllAchievements();

    let html = '<div class="achievements-panel">';

    allAchievements.forEach(function(achievement) {
        const isUnlocked = achievement.unlocked;
        html += '<div class="achievement-item' + (isUnlocked ? ' achievement-unlocked' : ' achievement-locked') + '">';
        html += '<div class="achievement-icon">' + (isUnlocked ? '◆' : '◇') + '</div>';
        html += '<div class="achievement-info">';
        if (isUnlocked) {
            html += '<div class="achievement-name">' + achievement.name + '</div>';
            html += '<div class="achievement-desc">' + achievement.description + '</div>';
        } else {
            html += '<div class="achievement-name">???</div>';
            html += '<div class="achievement-desc">尚未解锁</div>';
        }
        html += '</div>';
        html += '</div>';
    });

    html += '</div>';

    showModal('成就', html);
}

/**
 * 显示飞升路径选择
 * 隐藏的"自我"路径仅在修为>=20且拥有神性碎片时可见
 */
function showAscensionPaths() {
    let html = '<div class="ascension-panel">';
    html += '<p class="ascension-intro">你已触摸到超越凡俗的边界。选择你的飞升之路：</p>';

    Object.keys(ASCENSION_PATHS).forEach(function(pathId) {
        const path = ASCENSION_PATHS[pathId];

        // "自我"路径的隐藏条件
        if (pathId === 'self') {
            if (PLAYER_STATE.cultivation_level < 20 || !PLAYER_STATE.has_divinity) {
                return; // 不显示
            }
        }

        // 如果已选择该路径，标记为当前
        const isCurrent = PLAYER_STATE.ascension_path === pathId;

        html += '<div class="ascension-path' + (isCurrent ? ' path-current' : '') + '">';
        html += '<div class="path-name">' + path.name + '</div>';
        html += '<div class="path-desc">' + (path.description || '') + '</div>';

        if (isCurrent) {
            html += '<span class="path-selected">当前路径</span>';
        } else if (!PLAYER_STATE.ascension_path) {
            html += '<button onclick="selectAscensionPath(\'' + pathId + '\')" class="btn btn-path-select">选择此路</button>';
        }

        html += '</div>';
    });

    html += '</div>';

    showModal('飞升之路', html);
}

/**
 * 选择飞升路径
 * @param {string} pathId - 路径ID
 */
function selectAscensionPath(pathId) {
    if (PLAYER_STATE.ascension_path) {
        addLog('你已踏上飞升之路，无法更改。', 'warning');
        closeModal();
        return;
    }

    const path = ASCENSION_PATHS[pathId];
    if (!path) {
        addLog('该路径不存在于已知的飞升之道中。', 'warning');
        closeModal();
        return;
    }

    setAscensionPath(pathId);
    closeModal();

    addLog('你选择了飞升之路——「' + path.name + '」。', 'system');
    addLog('从此刻起，你的命运将沿着这条道路前行，直至尽头。', 'event');

    if (path.selection_text) {
        addLog(path.selection_text, 'event');
    }

    checkAchievements(PLAYER_STATE);
    updateUI();
}

/**
 * 显示红色按钮（因果熔断）确认弹窗
 */
function showRedButton() {
    showModal('因果熔断',
        '<div class="red-button-warning">' +
        '<p class="warning-text">⚠ 你即将执行因果熔断。</p>' +
        '<p>这将清除你当前的所有进度——时代、修为、腐化、死亡记录……一切归零。</p>' +
        '<p>但你的成就将被保留，铭刻在世界线的记忆之中。</p>' +
        '<p class="warning-emphasis">此操作不可逆转。你确定吗？</p>' +
        '<div class="red-button-actions">' +
        '<button onclick="confirmCausalFuse()" class="btn btn-danger">执行因果熔断</button> ' +
        '<button onclick="closeModal()" class="btn btn-cancel">放弃</button>' +
        '</div>' +
        '</div>');
}

/**
 * 确认执行因果熔断
 */
function confirmCausalFuse() {
    closeModal();

    addLog('因果熔断启动……', 'danger');
    addLog('世界线在你眼前断裂、重组——', 'danger');

    causalFuse();

    addLog('一切归零。但某些记忆，如同刻在灵魂上的烙印，无法抹去。', 'system');
    addLog('新的世界线已展开。', 'system');

    clearLog();
    checkAchievements(PLAYER_STATE);
    updateUI();
}

/**
 * 显示重置游戏确认弹窗
 */
function resetGame() {
    showModal('重置世界',
        '<div class="reset-warning">' +
        '<p class="warning-text">⛔ 你即将重置整个世界。</p>' +
        '<p>这将清除所有数据，包括成就。一切将从零开始。</p>' +
        '<p>请输入 <strong>我确认重置世界</strong> 以确认：</p>' +
        '<input type="text" id="reset_confirm_input" class="reset-input" placeholder="在此输入确认文本" />' +
        '<div class="reset-actions">' +
        '<button onclick="confirmReset()" class="btn btn-danger">确认重置</button> ' +
        '<button onclick="closeModal()" class="btn btn-cancel">取消</button>' +
        '</div>' +
        '</div>');
}

/**
 * 验证确认文本并执行硬重置
 */
function confirmReset() {
    const input = document.getElementById('reset_confirm_input');
    if (!input || input.value !== '我确认重置世界') {
        addLog('确认文本不匹配，重置已取消。', 'warning');
        closeModal();
        return;
    }

    closeModal();

    addLog('世界正在重置……', 'danger');
    addLog('所有的记忆、成就、因果——一切都在消散。', 'danger');
    addLog('……', 'system');

    hardReset();

    clearLog();
    addLog('一个全新的世界诞生了。你再次站在时间的起点。', 'system');
    updateUI();
}

/**
 * 执行记忆切除操作
 * 消耗20时间石，降低2点腐化
 */
function exciseMemoryAction() {
    if (PLAYER_STATE.game_over) {
        addLog('世界线已经崩塌，记忆切除无法执行。', 'danger');
        return;
    }

    const cost = 20;
    if (PLAYER_STATE.time_stones < cost) {
        addLog('时间石不足，无法支撑记忆切除所需的能量。需要 ' + cost + ' 颗时间石。', 'warning');
        return;
    }

    if (PLAYER_STATE.corruption_level <= 0) {
        addLog('你的意识尚且清明，无需切除记忆。', 'system');
        return;
    }

    consumeTimeStones(cost);
    exciseMemory(); // 降低2点腐化

    addLog('你用时间之力切除了被侵蚀的记忆片段……时间石 -' + cost, 'system');
    addLog('那些扭曲的画面从脑海中消失，但你也失去了一部分自己。腐化 -2', 'warning');

    checkAchievements(PLAYER_STATE);
    updateUI();
}

// ============================================================
// 初始化
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    // 初始化界面
    updateUI();

    // 检查成就
    checkAchievements(PLAYER_STATE);

    // 添加初始欢迎日志
    addLog('观测者，欢迎来到世界线的交汇点。', 'system');
    addLog('你的意识漂浮在时间的长河之上，无数可能性在眼前展开……', 'system');
    addLog('每一次探索，都将改写世界的命运。每一次选择，都可能通向深渊或光明。', 'system');
    addLog('输入指令，开始你的观测之旅。', 'system');
});
