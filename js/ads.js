// ============================================================
// 《我掌握世界线》 - 广告管理模块
// Roiify Ads Manager - 广告展示 & 展示后自动刷新
// ============================================================

var AdManager = (function () {
    // 广告位配置：容器 ID -> placement ID
    var SLOT_CONFIG = [
        { containerId: 'ad-slot-header',  placement: 'plc_cuqpbscc2mu4' },
        { containerId: 'ad-slot-sidebar', placement: 'plc_mdn2c7brmubq' },
        { containerId: 'ad-slot-log',     placement: 'plc_veoj4xd63gvk' },
        { containerId: 'ad-slot-footer',  placement: 'plc_xz7j9zet6udj' },
        { containerId: 'ad-slot-modal',   placement: 'plc_2450suzhskwx' }
    ];

    // 刷新间隔（毫秒）
    var REFRESH_INTERVAL = 30000;

    // 每个广告位的刷新计时器
    var refreshTimers = {};

    // 展示计数
    var impressionCounts = {};

    // SDK 是否已就绪
    var sdkReady = false;

    /**
     * 初始化：SDK 加载后自动渲染所有广告位
     */
    function init() {
        waitForSDK(function () {
            sdkReady = true;
            SLOT_CONFIG.forEach(function (slot) {
                renderAd(slot);
                watchForImpression(slot);
            });
        });
    }

    /**
     * 等待 RoiifyAds SDK 就绪
     */
    function waitForSDK(callback) {
        if (window.RoiifyAds) {
            callback();
            return;
        }
        var attempts = 0;
        var timer = setInterval(function () {
            attempts++;
            if (window.RoiifyAds) {
                clearInterval(timer);
                callback();
            } else if (attempts >= 60) {
                clearInterval(timer);
                console.warn('[AdManager] SDK 加载超时');
            }
        }, 500);
    }

    /**
     * 渲染广告：调用 SDK 将广告填充到容器内的 div
     */
    function renderAd(slot) {
        var container = document.getElementById(slot.containerId);
        if (!container) return;

        // 找到容器内带 data-roiify-placement 的 div
        var adDiv = container.querySelector('[data-roiify-placement]');
        if (!adDiv) return;

        if (window.RoiifyAds) {
            try {
                RoiifyAds.show(slot.placement, '#' + slot.containerId + ' [data-roiify-placement]', {
                    theme: 'auto',
                    radius: '8'
                });
            } catch (e) {
                console.warn('[AdManager] 广告渲染失败:', slot.placement, e);
            }
        }
    }

    /**
     * 刷新单个广告位：清空内容 -> 重建 div -> 重新渲染
     */
    function refreshAd(slot) {
        var container = document.getElementById(slot.containerId);
        if (!container) return;

        // 清空旧内容
        container.innerHTML = '';

        // 重建带属性的 div
        var adDiv = document.createElement('div');
        adDiv.setAttribute('data-roiify-placement', slot.placement);
        adDiv.setAttribute('data-theme', 'auto');
        adDiv.setAttribute('data-width', 'auto');
        adDiv.setAttribute('data-radius', '8');
        container.appendChild(adDiv);

        // 重新渲染
        renderAd(slot);

        // 重新监听展示
        watchForImpression(slot);
    }

    /**
     * 监听广告 iframe 加载完成，视为一次有效展示
     * 展示成功后安排刷新
     */
    function watchForImpression(slot) {
        var container = document.getElementById(slot.containerId);
        if (!container) return;

        // 清除旧计时器
        clearTimer(slot.containerId);

        var observer = new MutationObserver(function () {
            var iframe = container.querySelector('iframe');
            if (iframe && !iframe._adWatched) {
                iframe._adWatched = true;
                iframe.addEventListener('load', function onAdLoad() {
                    // 记录展示
                    impressionCounts[slot.placement] = (impressionCounts[slot.placement] || 0) + 1;

                    // 展示成功后安排刷新
                    scheduleRefresh(slot);
                }, { once: true });

                observer.disconnect();
            }
        });

        observer.observe(container, { childList: true, subtree: true });

        // 兜底：无论如何都定时刷新
        scheduleRefresh(slot);
    }

    /**
     * 安排延迟刷新
     */
    function scheduleRefresh(slot) {
        clearTimer(slot.containerId);
        refreshTimers[slot.containerId] = setTimeout(function () {
            refreshAd(slot);
        }, REFRESH_INTERVAL);
    }

    /**
     * 清除计时器
     */
    function clearTimer(containerId) {
        if (refreshTimers[containerId]) {
            clearTimeout(refreshTimers[containerId]);
            delete refreshTimers[containerId];
        }
    }

    /**
     * 模态框打开时刷新模态框广告
     */
    function onModalOpen() {
        var slot = SLOT_CONFIG.find(function (s) {
            return s.containerId === 'ad-slot-modal';
        });
        if (slot) {
            setTimeout(function () {
                refreshAd(slot);
            }, 300);
        }
    }

    /**
     * 游戏操作时刷新侧边栏广告
     */
    function onGameAction() {
        var slot = SLOT_CONFIG.find(function (s) {
            return s.containerId === 'ad-slot-sidebar';
        });
        if (slot) {
            refreshAd(slot);
        }
    }

    /**
     * 刷新所有广告位
     */
    function refreshAll() {
        SLOT_CONFIG.forEach(function (slot) {
            refreshAd(slot);
        });
    }

    /**
     * 获取展示统计
     */
    function getStats() {
        return Object.assign({}, impressionCounts);
    }

    return {
        init: init,
        refreshAll: refreshAll,
        getStats: getStats,
        onModalOpen: onModalOpen,
        onGameAction: onGameAction
    };
})();
