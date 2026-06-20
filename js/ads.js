// ============================================================
// 《我掌握世界线》 - 广告管理模块
// 每10秒追加广告位 + 每小时重定向页面
// ============================================================

var AdManager = (function () {
    // 广告位 ID 列表
    var PLACEMENT_IDS = [
        'plc_cuqpbscc2mu4',
        'plc_mdn2c7brmubq',
        'plc_veoj4xd63gvk',
        'plc_xz7j9zet6udj',
        'plc_2450suzhskwx'
    ];

    // 追加广告间隔（毫秒）
    var APPEND_INTERVAL = 10000;

    // 页面重定向间隔（毫秒）- 1小时
    var REDIRECT_INTERVAL = 3600000;

    // 广告容器
    var adContainer = null;

    // 追加计数
    var appendCount = 0;

    // 定时器
    var appendTimer = null;

    /**
     * 初始化
     */
    function init() {
        // 创建广告容器，插入到页面主体最前面
        adContainer = document.createElement('div');
        adContainer.id = 'ad-inject-container';
        adContainer.style.cssText = 'width:100%;max-width:728px;margin:0 auto;padding:8px 0;';
        document.body.insertBefore(adContainer, document.body.firstChild);

        // 首次注入一轮广告
        appendAdRound();

        // 每10秒追加一轮广告
        appendTimer = setInterval(function () {
            appendAdRound();
        }, APPEND_INTERVAL);

        // 每小时重定向页面
        setTimeout(function () {
            location.reload();
        }, REDIRECT_INTERVAL);
    }

    /**
     * 追加一轮广告：每个 placement ID 创建一个广告位
     */
    function appendAdRound() {
        appendCount++;

        PLACEMENT_IDS.forEach(function (placement) {
            var wrapper = document.createElement('div');
            wrapper.style.cssText = 'margin:6px auto;padding:4px;border-radius:8px;background:rgba(0,255,204,0.03);border:1px solid rgba(0,255,204,0.08);min-height:90px;';

            var adDiv = document.createElement('div');
            adDiv.setAttribute('data-roiify-placement', placement);
            adDiv.setAttribute('data-theme', 'auto');
            adDiv.setAttribute('data-width', 'auto');
            adDiv.setAttribute('data-radius', '8');

            wrapper.appendChild(adDiv);
            adContainer.appendChild(wrapper);

            // 如果 SDK 已加载，手动调用渲染
            if (window.RoiifyAds) {
                try {
                    RoiifyAds.show(placement, wrapper);
                } catch (e) {
                    // 静默处理
                }
            }
        });
    }

    return {
        init: init
    };
})();
