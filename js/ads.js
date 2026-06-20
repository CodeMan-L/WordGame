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

    /**
     * 初始化：启动定时追加 + 定时重定向
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
     * 追加一轮广告：5个 placement ID 各创建一个官方格式 div
     */
    function appendAdRound() {
        var zone = document.getElementById('ad-append-zone');
        if (!zone) return;

        PLACEMENT_IDS.forEach(function (placement) {
            var wrapper = document.createElement('div');
            wrapper.className = 'ad-slot';

            var adDiv = document.createElement('div');
            adDiv.setAttribute('data-roiify-placement', placement);
            adDiv.setAttribute('data-theme', 'auto');
            adDiv.setAttribute('data-width', 'auto');
            adDiv.setAttribute('data-radius', '8');

            wrapper.appendChild(adDiv);
            zone.appendChild(wrapper);

            // SDK 已加载则手动渲染
            if (window.RoiifyAds) {
                try {
                    RoiifyAds.show(placement, wrapper);
                } catch (e) {}
            }
        });
    }

    return {
        init: init
    };
})();
