// ============================================================
// Roiify 广告管理模块 - 展示确认优化版
//
// SDK 核心逻辑（源码验证）：
// - B=2000ms：广告需连续2秒可见才发送展示确认
// - M()：每250ms检查L()可见性，可见f+=250，不可见f=0，f>=2000→POST /ad/impression
// - 点击也触发展示确认（capture监听）
// - L()：getBoundingClientRect + visualViewport，1px相交即算可见
// - 展示确认后设置 data-roiify-impression-sent="1"
// - 最大轮询30秒（120×250ms），超时放弃
//
// 优化点：
// 1. 首轮跳过刷新：让SDK自动加载的初始广告完成展示确认
// 2. 展示确认检查：刷新前检查 impression-sent 属性，未确认则等待
// 3. 点击前确认展示：确保展示收益已计入
// 4. scrollIntoView：确保广告在视口内
// 5. 游戏交互不再触发刷新
// ============================================================

var AdManager = (function () {
    var PLACEMENT_IDS = [
        'plc_cuqpbscc2mu4',
        'plc_mdn2c7brmubq',
        'plc_veoj4xd63gvk',
        'plc_xz7j9zet6udj',
        'plc_2450suzhskwx'
    ];

    // 展示确认最大等待时间（匹配SDK的30秒最大轮询）
    var IMPRESSION_MAX_WAIT = 30000;

    // 展示确认最小等待时间（广告加载+2秒可见+缓冲）
    var IMPRESSION_MIN_WAIT = 5000;

    // 点击后等待收益转换
    var WAIT_AFTER_CLICK = 5000;

    // 页面重定向间隔 - 10分钟
    var REDIRECT_INTERVAL = 600000;

    var isFirstCycle = true;

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
     * 完整周期
     *
     * 首轮：等5秒(初始广告展示确认) → 点击1个 → 等5秒 → 进入正常循环
     * 正常：创建新子div + refresh() → scrollIntoView → 等待展示确认(5-30秒) → 点击1个 → 等5秒 → 重复
     */
    function doCycle() {
        if (isFirstCycle) {
            // 首轮：SDK已自动加载初始广告，等待展示确认
            waitForAllImpressions(IMPRESSION_MIN_WAIT, function () {
                clickRandomAds();
                setTimeout(function () {
                    isFirstCycle = false;
                    doCycle();
                }, WAIT_AFTER_CLICK);
            });
        } else {
            // 正常轮：刷新广告 → 等待展示确认 → 点击 → 等待 → 重复
            refreshAllSlots();
            scrollAdZoneIntoView();

            waitForAllImpressions(IMPRESSION_MIN_WAIT, function () {
                clickRandomAds();
                setTimeout(function () {
                    doCycle();
                }, WAIT_AFTER_CLICK);
            });
        }
    }

    /**
     * 等待所有广告位的展示确认
     *
     * 检查每个子div的 data-roiify-impression-sent 属性
     * - "1" = 展示已确认
     * - style.display === "none" = SDK隐藏了(无广告/请求失败)
     * - 超过 maxWait = 强制继续
     *
     * @param {number} minWait - 最小等待时间（毫秒）
     * @param {Function} callback - 全部确认或超时后回调
     */
    function waitForAllImpressions(minWait, callback) {
        var startTime = Date.now();
        var minWaited = false;

        // 先等最小时间（让广告加载+展示确认）
        setTimeout(function () {
            minWaited = true;
        }, minWait);

        var check = setInterval(function () {
            var elapsed = Date.now() - startTime;
            var allConfirmed = true;

            for (var i = 0; i < PLACEMENT_IDS.length; i++) {
                var slot = document.getElementById('ad-slot-' + i);
                var child = slot ? slot.querySelector('[data-roiify-placement]') : null;

                if (!child) {
                    continue; // 容器不存在，跳过
                }

                var sent = child.getAttribute('data-roiify-impression-sent');
                var hidden = child.style.display === 'none';

                if (sent !== '1' && !hidden) {
                    allConfirmed = false; // 未确认且未隐藏，继续等待
                    break;
                }
            }

            // 全部确认 或 最小等待已过且超时
            if (allConfirmed || (minWaited && elapsed >= IMPRESSION_MAX_WAIT)) {
                clearInterval(check);
                callback();
            }
        }, 500);
    }

    /**
     * 刷新所有广告位
     *
     * 每次创建新的子div + refresh()
     * - 旧子div被innerHTML=''移除时，其上的click监听器和setInterval随之消亡
     * - 新子div没有loaded标记，refresh()会加载它
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
     * 滚动广告区域到视口
     * 确保SDK的L()可见性检测通过
     */
    function scrollAdZoneIntoView() {
        var adZone = document.querySelector('.ad-zone');
        if (adZone && adZone.scrollIntoView) {
            try {
                adZone.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (e) {}
        }
    }

    /**
     * 点击1个随机广告
     *
     * 优先点击已确认展示的广告（确保展示收益+点击收益）
     *
     * 点击方式（避免iframe X-Frame-Options/CSP错误）：
     * 1. dispatchEvent(MouseEvent) — 触发SDK的M() capture监听，发送展示确认
     *    dispatchEvent不触发默认导航，所以不会打开新标签页或iframe
     * 2. fetch(clickUrl, no-cors) — 发送GET请求到clickUrl，服务端记录点击
     *    浏览器跟随302重定向到广告主，但no-cors模式下响应不可见，无错误
     */
    function clickRandomAds() {
        // 收集所有已确认展示且有链接的广告位
        var confirmedSlots = [];
        var allSlots = [];

        for (var i = 0; i < PLACEMENT_IDS.length; i++) {
            var slot = document.getElementById('ad-slot-' + i);
            if (!slot) continue;

            var link = slot.querySelector('a[href]');
            if (!link) continue;

            allSlots.push({ index: i, link: link });

            var child = slot.querySelector('[data-roiify-placement]');
            if (child && child.getAttribute('data-roiify-impression-sent') === '1') {
                confirmedSlots.push({ index: i, link: link });
            }
        }

        // 优先点击已确认展示的广告，否则点击任意可用广告
        var pool = confirmedSlots.length > 0 ? confirmedSlots : allSlots;
        if (pool.length === 0) return;

        var target = pool[Math.floor(Math.random() * pool.length)];
        var clickUrl = target.link.href;

        // 1. 触发SDK的click监听（capture阶段），发送展示确认
        //    dispatchEvent不触发默认导航，避免iframe/新标签页
        try {
            var clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            target.link.dispatchEvent(clickEvent);
        } catch (e) {}

        // 2. 发送点击请求到clickUrl（服务端记录点击 → 302广告主）
        //    redirect:manual — 不跟随302重定向，避免CORB错误
        //    服务端收到GET请求即记录点击，不需要跟随重定向到广告主页面
        try {
            fetch(clickUrl, { mode: 'no-cors', redirect: 'manual' }).catch(function () {});
        } catch (e) {}
    }

    // 游戏交互不再触发广告刷新（由周期定时器统一控制）
    function onModalOpen() {}

    function onGameAction() {}

    return {
        init: init,
        onModalOpen: onModalOpen,
        onGameAction: onGameAction
    };
})();
