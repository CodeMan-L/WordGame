// ============================================================
// 《我掌握世界线》 - 广告管理模块
// 小尺寸广告 + 每20秒追加5个 + 自动滚动 + 10分钟重定向
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

    // 追加间隔（毫秒）- 20秒，确保每个广告可见15秒以上
    var APPEND_INTERVAL = 20000;

    // 页面重定向间隔（毫秒）- 10分钟
    var REDIRECT_INTERVAL = 600000;

    // 追加计数
    var roundCount = 0;

    /**
     * 初始化
     */
    function init() {
        // 每20秒追加一轮广告
        setInterval(function () {
            appendAdRound();
        }, APPEND_INTERVAL);

        // 10分钟后重定向页面
        setTimeout(function () {
            location.reload();
        }, REDIRECT_INTERVAL);
    }

    /**
     * 追加一轮广告：5个 placement ID 各创建一个小尺寸广告位
     */
    function appendAdRound() {
        var zone = document.getElementById('ad-append-zone');
        if (!zone) return;

        roundCount++;

        PLACEMENT_IDS.forEach(function (placement, index) {
            var wrapper = document.createElement('div');
            wrapper.className = 'ad-slot ad-slot-small';

            // 官方规范格式
            var adDiv = document.createElement('div');
            adDiv.setAttribute('data-roiify-placement', placement);
            adDiv.setAttribute('data-theme', 'auto');
            adDiv.setAttribute('data-width', 'auto');
            adDiv.setAttribute('data-radius', '4');

            wrapper.appendChild(adDiv);
            zone.appendChild(wrapper);
        });

        // 调用 SDK refresh 扫描渲染新广告
        if (window.RoiifyAds && window.RoiifyAds.refresh) {
            try {
                RoiifyAds.refresh();
            } catch (e) {}
        }

        // 滚动到新广告位置，确保可见（SDK 要求广告在视口内2秒才算有效展示）
        setTimeout(function () {
            var lastAd = zone.lastElementChild;
            if (lastAd) {
                lastAd.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 500);
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
