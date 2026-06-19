// ============================================================
// 《我掌握世界线》 - 广告管理模块
// Roiify Ads Manager - iframe 内联框架 & 点击刷新
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

    // 广告展示时长（毫秒）- 悬浮展示后重新请求
    var DISPLAY_DURATION = 3000;

    // 等待 SDK 渲染广告的时间（毫秒）
    var RENDER_WAIT = 2000;

    // 点击后刷新延迟（毫秒）
    var CLICK_REFRESH_DELAY = 1000;

    // 每个广告位的定时器
    var slotTimers = {};

    /**
     * 初始化：加载所有广告位 + 监听 iframe 点击
     */
    function init() {
        SLOT_CONFIG.forEach(function (slot) {
            loadAd(slot);
        });
        setupIframeClickDetection();
    }

    /**
     * 构建 iframe 内的 HTML 内容
     */
    function buildIframeHtml(placement) {
        return [
            '<!DOCTYPE html><html><head>',
            '<style>',
            'body{margin:0;padding:0;overflow:hidden;background:transparent;}',
            '</style>',
            '</head><body>',
            '<div data-roiify-placement="' + placement + '" data-theme="auto" data-width="auto" data-radius="8"></div>',
            '<script async src="https://www.roiify.net/sdk/roiify-ads.js"><\/script>',
            '</body></html>'
        ].join('');
    }

    /**
     * 加载广告：在容器内创建 iframe，加载 Roiify SDK 渲染广告
     */
    function loadAd(slot) {
        var container = document.getElementById(slot.containerId);
        if (!container) return;

        // 清除旧定时器
        clearSlotTimer(slot.containerId);

        // 清空容器
        container.innerHTML = '';

        // 创建 iframe
        var iframe = document.createElement('iframe');
        iframe.className = 'ad-iframe';
        iframe.setAttribute('data-slot', slot.containerId);
        iframe.setAttribute('scrolling', 'no');
        iframe.srcdoc = buildIframeHtml(slot.placement);
        container.appendChild(iframe);

        // iframe 加载完成后，等待 SDK 渲染广告，然后开始展示计时
        iframe.addEventListener('load', function () {
            // 等待 SDK 异步渲染广告
            slotTimers[slot.containerId + '_render'] = setTimeout(function () {
                // 广告渲染完成，显示悬浮提示
                showFloatingHint(slot);

                // 悬浮展示 DISPLAY_DURATION 后重新请求广告
                slotTimers[slot.containerId] = setTimeout(function () {
                    loadAd(slot);
                }, DISPLAY_DURATION);
            }, RENDER_WAIT);
        });
    }

    /**
     * 显示悬浮提示：广告展示中
     */
    function showFloatingHint(slot) {
        var container = document.getElementById(slot.containerId);
        if (!container) return;

        // 移除旧提示
        var old = container.querySelector('.ad-floating-hint');
        if (old) old.remove();

        var hint = document.createElement('div');
        hint.className = 'ad-floating-hint';
        hint.textContent = '广告展示中';
        container.appendChild(hint);

        // 展示结束后移除
        setTimeout(function () {
            if (hint.parentNode) hint.remove();
        }, DISPLAY_DURATION);
    }

    /**
     * 监听 iframe 内的点击事件
     * 原理：用户点击 iframe 内部时，父窗口失去焦点，activeElement 变为该 iframe
     */
    function setupIframeClickDetection() {
        window.addEventListener('blur', function () {
            var active = document.activeElement;
            if (active && active.tagName === 'IFRAME' && active.classList.contains('ad-iframe')) {
                var slotId = active.getAttribute('data-slot');
                var slot = SLOT_CONFIG.find(function (s) {
                    return s.containerId === slotId;
                });
                if (slot) {
                    // 点击广告 → 更改 iframe src（重新加载）触发收益转换
                    setTimeout(function () {
                        loadAd(slot);
                    }, CLICK_REFRESH_DELAY);
                }
            }
        });
    }

    /**
     * 清除指定广告位的定时器
     */
    function clearSlotTimer(containerId) {
        if (slotTimers[containerId]) {
            clearTimeout(slotTimers[containerId]);
            delete slotTimers[containerId];
        }
        if (slotTimers[containerId + '_render']) {
            clearTimeout(slotTimers[containerId + '_render']);
            delete slotTimers[containerId + '_render'];
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
                loadAd(slot);
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

    return {
        init: init,
        refreshAll: refreshAll,
        onModalOpen: onModalOpen,
        onGameAction: onGameAction
    };
})();
