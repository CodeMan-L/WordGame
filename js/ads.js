// ============================================================
// 《我掌握世界线》 - 广告管理模块
// 初始5个官方广告位 + 每5秒追加 + 每小时重定向
// ============================================================

var AdManager = (function () {
    // 5个广告位 ID
    var PLACEMENT_IDS = [
        'plc_cuqpbscc2mu4',
        'plc_mdn2c7brmubq',
        'plc_veoj4xd63gvk',
        'plc_xz7j9zet6udj',
        'plc_2450suzhskwx'
    ];

    // 追加间隔（毫秒）
    var APPEND_INTERVAL = 5000;

    // 页面重定向间隔（毫秒）- 1小时
    var REDIRECT_INTERVAL = 3600000;

    // 追加计数
    var roundCount = 0;

    /**
     * 初始化
     */
    function init() {
        // 每5秒追加一轮广告
        setInterval(function () {
            appendAdRound();
        }, APPEND_INTERVAL);

        // 每小时重定向页面
        setTimeout(function () {
            location.reload();
        }, REDIRECT_INTERVAL);
    }

    /**
     * 追加一轮广告：创建 data-roiify-placement div，然后调 refresh 让 SDK 扫描渲染
     */
    function appendAdRound() {
        var zone = document.getElementById('ad-append-zone');
        if (!zone) return;

        roundCount++;

        PLACEMENT_IDS.forEach(function (placement, index) {
            var wrapper = document.createElement('div');
            wrapper.className = 'ad-slot';

            // 官方规范格式：data-roiify-placement div
            var adDiv = document.createElement('div');
            adDiv.setAttribute('data-roiify-placement', placement);
            adDiv.setAttribute('data-theme', 'auto');
            adDiv.setAttribute('data-width', 'auto');
            adDiv.setAttribute('data-radius', '8');

            wrapper.appendChild(adDiv);
            zone.appendChild(wrapper);
        });

        // 调用 SDK refresh 扫描所有未加载的 data-roiify-placement 元素并渲染
        if (window.RoiifyAds && window.RoiifyAds.refresh) {
            try {
                RoiifyAds.refresh();
            } catch (e) {
                console.warn('[AdManager] refresh 失败:', e);
            }
        }
    }

    /**
     * 模态框打开时追加一轮广告
     */
    function onModalOpen() {
        appendAdRound();
    }

    /**
     * 游戏操作时追加一轮广告
     */
    function onGameAction() {
        appendAdRound();
    }

    return {
        init: init,
        onModalOpen: onModalOpen,
        onGameAction: onGameAction
    };
})();
