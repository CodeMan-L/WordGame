function updateUI() {
    const eraEl = document.getElementById('current_era');
    const corruptionEl = document.getElementById('corruption_level');
    const stonesEl = document.getElementById('time_stones');
    const corruptionBar = document.querySelector('.corruption-bar');
    const statusBar = document.querySelector('.status-bar');

    const eraConfig = getCurrentEraConfig();
    
    if (eraEl) eraEl.textContent = eraConfig ? eraConfig.name : '未知时代';
    if (stonesEl) stonesEl.textContent = PLAYER_STATE.time_stones;
    
    const corruptionInfo = getCorruptionEffect(PLAYER_STATE.corruption_level);
    if (corruptionEl) {
        corruptionEl.textContent = corruptionInfo.name;
        corruptionEl.style.color = corruptionInfo.color;
    }
    
    if (corruptionBar) {
        corruptionBar.style.width = (PLAYER_STATE.corruption_level * 25) + '%';
        corruptionBar.style.backgroundColor = corruptionInfo.color;
    }
    
    if (!canShowFullStatus(PLAYER_STATE.corruption_level)) {
        const statusItems = statusBar.querySelectorAll('.status-item');
        statusItems.forEach((item, index) => {
            if (index !== 2) {
                item.style.display = 'none';
            }
        });
    } else {
        const statusItems = statusBar.querySelectorAll('.status-item');
        statusItems.forEach(item => {
            item.style.display = 'flex';
        });
    }

    if (PLAYER_STATE.game_over) {
        addLog('游戏结束：' + PLAYER_STATE.game_over_reason, 'danger');
        showModal('游戏结束', '世界线已收束。' + PLAYER_STATE.game_over_reason);
    }
}

function addLog(text, type = 'event') {
    const logContent = document.getElementById('event_log');
    if (!logContent) return;

    const corruptedText = corruptText(text, PLAYER_STATE.corruption_level);
    
    const entry = document.createElement('div');
    entry.className = 'log-entry ' + type + '-log';
    entry.textContent = corruptedText;

    logContent.appendChild(entry);
    logContent.scrollTop = logContent.scrollHeight;
}

function clearLog() {
    const logContent = document.getElementById('event_log');
    if (logContent) {
        logContent.innerHTML = '<div class="log-entry system-log">欢迎来到世界线管理系统。时间的洪流在等待着你...</div>';
    }
}

function showModal(title, content) {
    const modal = document.getElementById('modal_overlay');
    const modalTitle = document.getElementById('modal_title');
    const modalBody = document.getElementById('modal_body');

    if (modal && modalTitle && modalBody) {
        modalTitle.textContent = corruptText(title, PLAYER_STATE.corruption_level);
        modalBody.textContent = corruptText(content, PLAYER_STATE.corruption_level);
        modal.style.display = 'flex';
    }
}

function closeModal() {
    const modal = document.getElementById('modal_overlay');
    if (modal) {
        modal.style.display = 'none';
    }
}

function explore() {
    if (PLAYER_STATE.game_over) {
        addLog('游戏已结束，无法继续探索...', 'danger');
        return;
    }

    const event = generateEvent(PLAYER_STATE.current_era, PLAYER_STATE);
    if (!event) {
        addLog('无法生成事件...', 'warning');
        return;
    }

    addLog('【' + event.title + '】', 'event');
    addLog(event.text, 'event');
    addLog('NPC反应：' + event.npc_reaction, 'system');

    if (event.effects) {
        if (event.effects.corruption) {
            addCorruption(event.effects.corruption);
            addLog('污染等级提升！', 'warning');
        }
        
        if (event.effects.time_stones && event.effects.time_stones > 0) {
            addTimeStones(event.effects.time_stones);
            addLog('获得了 ' + event.effects.time_stones + ' 块时间石！', 'event');
        }
        
        if (event.effects.time_stones && event.effects.time_stones < 0) {
            const cost = Math.abs(event.effects.time_stones);
            if (consumeTimeStones(cost)) {
                addLog('消耗了 ' + cost + ' 块时间石', 'system');
            } else {
                addLog('时间石不足！', 'warning');
            }
        }
        
        if (event.effects.death) {
            addDeath();
            addLog('你再次死亡...', 'danger');
            
            if (PLAYER_STATE.death_count >= 100 && PLAYER_STATE.current_era === ERAS.COMMON_ERA) {
                addLog('========================================', 'danger');
                addLog('世界线收束！时间的法则正在崩塌...', 'danger');
                addLog('克苏鲁的低语变得无比清晰...', 'danger');
                addLog('========================================', 'danger');
                unlockAchievement('world_line_converge');
            }
        }
    }

    if (event.stay_option && PLAYER_STATE.current_era === ERAS.GENESIS) {
        showModal('永恒的诱惑', event.text + '\n\n你想留在这里吗？');
        
        const modalFooter = document.querySelector('.modal-footer');
        modalFooter.innerHTML = `
            <button class="modal-btn confirm-btn" onclick="handleStayChoice(true)">留下</button>
            <button class="modal-btn cancel-btn" onclick="handleStayChoice(false)">离开</button>
        `;
    }

    if (event.boss_event && PLAYER_STATE.current_era === ERAS.FEDERATION) {
        showBossOptions();
    }

    const unlocked = checkAchievements(PLAYER_STATE);
    unlocked.forEach(achievement => {
        addLog('🏆 解锁成就：【' + achievement.name + '】 - ' + achievement.description, 'event');
    });

    updateUI();
}

function handleStayChoice(stay) {
    if (stay) {
        addStay();
        addLog('你选择留下...', 'event');
        
        if (PLAYER_STATE.stay_count >= 3) {
            addLog('========================================', 'danger');
            addLog('【HAPPY END?】', 'event');
            addLog('你选择永远留在创世年的温柔陷阱中...', 'event');
            addLog('这是一个充满讽刺意味的虚假好结局。', 'event');
            addLog('你放弃了对抗宿命的机会。', 'event');
            addLog('========================================', 'danger');
            unlockAchievement('happy_end_fake');
            gameOver('虚假结局');
        } else {
            addLog('你还可以选择离开...', 'system');
        }
    } else {
        resetStayCount();
        addLog('你抵抗了诱惑，选择继续前行。', 'event');
    }
    closeModal();
    updateUI();
}

function showBossOptions() {
    const options = getBossOptions();
    const content = options.map((opt, index) => 
        (index + 1) + '. ' + opt.text
    ).join('\n\n');
    
    showModal('BOSS周旋', '你被联邦的棋手们盯上了！选择你的应对方式：\n\n' + content);
    
    const modalFooter = document.querySelector('.modal-footer');
    modalFooter.innerHTML = options.map((opt, index) => 
        `<button class="modal-btn boss-btn" onclick="handleBossChoice(${index})">${index + 1}</button>`
    ).join('');
}

function handleBossChoice(index) {
    const options = getBossOptions();
    const choice = options[index];
    
    if (choice) {
        addLog('你选择：' + choice.text, 'event');
        addLog(choice.result, 'event');
        
        if (choice.effects) {
            if (choice.effects.corruption) {
                addCorruption(choice.effects.corruption);
            }
            if (choice.effects.time_stones) {
                if (choice.effects.time_stones > 0) {
                    addTimeStones(choice.effects.time_stones);
                } else {
                    consumeTimeStones(Math.abs(choice.effects.time_stones));
                }
            }
        }
        
        unlockAchievement('boss_interaction');
    }
    
    closeModal();
    updateUI();
}

function changeEra() {
    if (PLAYER_STATE.game_over) {
        addLog('游戏已结束，无法切换时代...', 'danger');
        return;
    }

    const eras = Object.values(ERAS);
    const currentIndex = eras.indexOf(PLAYER_STATE.current_era);
    let nextIndex = (currentIndex + 1) % eras.length;
    let targetEra = eras[nextIndex];
    
    while (targetEra === PLAYER_STATE.current_era) {
        nextIndex = (nextIndex + 1) % eras.length;
        targetEra = eras[nextIndex];
    }

    if (!consumeTimeStones(5)) {
        addLog('时间石不足！切换时代需要5块时间石。', 'warning');
        return;
    }

    const success = changeEra(targetEra);
    if (success) {
        const eraConfig = getCurrentEraConfig();
        addLog('穿越时间...', 'system');
        addLog('进入时代：' + eraConfig.name, 'event');
        addLog(eraConfig.description, 'system');
        unlockAchievement('era_traveler');
    } else {
        addLog('无法进入该时代！需要世界坐标或神性。', 'warning');
        addTimeStones(5);
    }

    updateUI();
}

function showStatus() {
    const eraConfig = getCurrentEraConfig();
    const corruptionInfo = getCorruptionEffect(PLAYER_STATE.corruption_level);
    
    let statusInfo = '当前状态概览：\n\n';
    
    if (canShowFullStatus(PLAYER_STATE.corruption_level)) {
        statusInfo += '时代：' + eraConfig.name + '\n';
        statusInfo += '节点：' + PLAYER_STATE.node_level + '\n';
        statusInfo += '污染等级：' + corruptionInfo.name + '\n';
        statusInfo += '污染效果：' + corruptionInfo.description + '\n';
        statusInfo += '神性：' + (PLAYER_STATE.has_divinity ? '拥有' : '未拥有') + '\n';
        statusInfo += '死亡次数：' + PLAYER_STATE.death_count + '\n';
        statusInfo += '留下次数：' + PLAYER_STATE.stay_count + '\n';
    }
    
    statusInfo += '时间石：' + PLAYER_STATE.time_stones;

    showModal('状态报告', statusInfo);
}

function viewTimeline() {
    const eraConfig = getCurrentEraConfig();
    
    let timelineInfo = '世界线观测报告：\n\n';
    timelineInfo += '当前时代：' + eraConfig.name + '\n';
    timelineInfo += '污染程度：' + getCorruptionLevelName(PLAYER_STATE.corruption_level) + '\n';
    timelineInfo += '可用时间石：' + PLAYER_STATE.time_stones + '\n';
    
    const achievements = getAllAchievements();
    const unlockedCount = achievements.filter(a => PLAYER_STATE.achievements.includes(a.id)).length;
    
    timelineInfo += '\n成就进度：' + unlockedCount + '/' + achievements.length;

    showModal('世界线观测', timelineInfo);
}

function resetGame() {
    showModal('确认重置', '输入"我确认重置世界"以确认重置所有进度：');
    
    const modalBody = document.getElementById('modal_body');
    modalBody.innerHTML = '<input type="text" id="reset_input" placeholder="输入确认文字..." style="width: 100%; padding: 10px; margin-top: 10px;">';
    
    const modalFooter = document.querySelector('.modal-footer');
    modalFooter.innerHTML = `
        <button class="modal-btn cancel-btn" onclick="closeModal()">取消</button>
        <button class="modal-btn confirm-btn" onclick="confirmReset()">确认</button>
    `;
}

function confirmReset() {
    const input = document.getElementById('reset_input');
    if (input && input.value === '我确认重置世界') {
        hardReset();
        clearLog();
        addLog('时间线已完全重置。新的世界线开始了...', 'system');
        closeModal();
        updateUI();
    } else {
        addLog('确认文字不正确！', 'warning');
    }
}

function showAchievements() {
    const achievements = getAllAchievements();
    let content = '成就列表：\n\n';
    
    achievements.forEach(achievement => {
        const unlocked = PLAYER_STATE.achievements.includes(achievement.id);
        content += (unlocked ? '✓' : '✗') + ' ' + achievement.name + '\n';
        content += '  ' + achievement.description + '\n\n';
    });
    
    showModal('成就系统', content);
}

document.addEventListener('DOMContentLoaded', function() {
    updateUI();
    checkAchievements(PLAYER_STATE);
});
