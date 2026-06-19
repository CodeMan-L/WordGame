// ============================================================
// 《我掌握世界线》 - 广告管理模块
// Roiify Ads Manager - 广告轮换 & 展示后自动刷新
// ============================================================

var AdManager = (function () {
    // 所有广告位 ID
    var PLACEMENTS = [
        'plc_cuqpbscc2mu4',
        'plc_mdn2c7brmubq',
        'plc_veoj4xd63gvk',
        'plc_xz7j9zet6udj',
        'plc_2450suzhskwx'
    ];

    // 广告位配置：页面上的容器 ID -> 分配的 placement
    var SLOT_CONFIG = [
        { containerId: 'ad-slot-header',  placement: PLACEMENTS[0] },
        { containerId: 'ad-slot-sidebar', placement: PLACEMENTS[1] },
        { containerId: 'ad-slot-log',     placement: PLACEMENTS[2] },
        { containerId: 'ad-slot-footer',  placement: PLACEMENTS[3] },
        { containerId: 'ad-slot-modal',   placement: PLACEMENTS[4] }
    ];

    // 刷新间隔（毫秒）
    var REFRESH_INTERVAL = 30000; // 30秒

    // 每个广告位的刷新计时器
    var refreshTimers = {};

    // 每个广告位的展示计数
    var impressionCounts = {};

    /**
     * 初始化所有广告位
     */
    function init() {
        // 等待 SDK 加载
        waitForSDK(function () {
            SLOT_CONFIG.forEach(function (slot) {
                loadAd(slot);
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
        var maxAttempts = 50; // 最多等 25 秒
        var interval = setInterval(function () {
            attempts++;
            if (window.RoiifyAds) {
                clearInterval(interval);
                callback();
            } else if (attempts >= maxAttempts) {
                clearInterval(interval);
                console.warn('[AdManager] RoiifyAds SDK 加载超时');
            }
        }, 500);
    }

    /**
     * 加载广告到指定广告位
     */
    function loadAd(slot) {
        var container = document.getElementById(slot.containerId);
        if (!container) return;

        // 清空旧内容
        container.innerHTML = '';

        // 创建广告 div
        var adDiv = document.createElement('div');
        adDiv.setAttribute('data-roiify-placement', slot.placement);
        adDiv.setAttribute('data-theme', 'auto');
        adDiv.setAttribute('data-width', 'auto');
        adDiv.setAttribute('data-radius', '8');
        container.appendChild(adDiv);

        // 调用 SDK 展示广告
        if (window.RoiifyAds) {
            try {
                RoiifyAds.show(slot.placement, '#' + slot.containerId + ' > div', {
                    theme: 'auto',
                    radius: '8'
                });
            } catch (e) {
                console.warn('[AdManager] 广告展示失败:', slot.placement, e);
            }
        }

        // 监听广告加载成功，设置自动刷新
        observeAdImpression(slot);
    }

    /**
     * 监听广告容器，检测广告成功展示后自动刷新
     */
    function observeAdImpression(slot) {
        var container = document.getElementById(slot.containerId);
        if (!container) return;

        // 清除旧的计时器
        if (refreshTimers[slot.containerId]) {
            clearTimeout(refreshTimers[slot.containerId]);
        }

        var observer = new MutationObserver(function () {
            var iframe = container.querySelector('iframe');
            if (iframe) {
                // iframe 出现说明广告正在加载
                iframe.addEventListener('load', function () {
                    // 广告加载成功 = 一次有效展示
                    impressionCounts[slot.placement] = (impressionCounts[slot.placement] || 0) + 1;

                    // 展示成功后，延迟刷新请求新广告
                    scheduleRefresh(slot);
                });

                // 只需要检测一次，断开观察
                observer.disconnect();
            }
        });

        observer.observe(container, { childList: true, subtree: true });

        // 安全兜底：如果 MutationObserver 未触发，也定时刷新
        scheduleRefresh(slot);
    }

    /**
     * 定时刷新广告
     */
    function scheduleRefresh(slot) {
        if (refreshTimers[slot.containerId]) {
            clearTimeout(refreshTimers[slot.containerId]);
        }

        refreshTimers[slot.containerId] = setTimeout(function () {
            loadAd(slot);
        }, REFRESH_INTERVAL);
    }

    /**
     * 手动刷新指定广告位
     */
    function refresh(slotId) {
        var slot = SLOT_CONFIG.find(function (s) {
            return s.containerId === slotId;
        });
        if (slot) {
            loadAd(slot);
        }
    }

    /**
     * 刷新所有广告位
     */
    function refreshAll() {
        SLOT_CONFIG.forEach(function (slot) {
            loadAd(slot);
        });
    }

    /**
     * 获取展示统计
     */
    function getStats() {
        return Object.assign({}, impressionCounts);
    }

    /**
     * 在模态框打开时加载模态框广告
     */
    function onModalOpen() {
        var slot = SLOT_CONFIG.find(function (s) {
            return s.containerId === 'ad-slot-modal';
        });
        if (slot) {
            // 延迟一点确保模态框已渲染
            setTimeout(function () {
                loadAd(slot);
            }, 300);
        }
    }

    /**
     * 在探索时刷新侧边栏广告（增加曝光机会）
     */
    function onGameAction() {
        var sidebarSlot = SLOT_CONFIG.find(function (s) {
            return s.containerId === 'ad-slot-sidebar';
        });
        if (sidebarSlot) {
            loadAd(sidebarSlot);
        }
    }

    return {
        init: init,
        refresh: refresh,
        refreshAll: refreshAll,
        getStats: getStats,
        onModalOpen: onModalOpen,
        onGameAction: onGameAction
    };
})();
