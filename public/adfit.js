// Kakao AdFit loader for the static test pages (/event1, /event2).
// Call window.mountAdfit('<container id>') when the result is shown. AdFit skips
// slots that are hidden when its script runs, so this waits until the container
// is actually visible, then renders the ad once per page view (with one retry).
(function () {
  var UNIT = 'DAN-1KAy0L6HlzeWlDlY';
  var SCRIPT_SRC = '//t1.kakaocdn.net/kas/static/ba.min.js';

  function isVisible(el) {
    return el.offsetWidth > 0 && el.getClientRects().length > 0;
  }

  function loadScript(container) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = SCRIPT_SRC;
    container.appendChild(script);
  }

  function render(container) {
    var ins = document.createElement('ins');
    ins.className = 'kakao_ad_area';
    ins.style.display = 'none';
    ins.setAttribute('data-ad-unit', UNIT);
    ins.setAttribute('data-ad-width', '300');
    ins.setAttribute('data-ad-height', '250');
    container.appendChild(ins);
    loadScript(container);

    // If AdFit still has not filled the slot, run its script once more.
    setTimeout(function () {
      if (!ins.querySelector('iframe')) loadScript(container);
    }, 3000);
  }

  window.mountAdfit = function (containerId) {
    var container = document.getElementById(containerId);
    if (!container || container.getAttribute('data-ad-mounted')) return;
    container.setAttribute('data-ad-mounted', '1');

    var waited = 0;
    (function waitUntilVisible() {
      if (isVisible(container) || waited >= 10000) return render(container);
      waited += 200;
      setTimeout(waitUntilVisible, 200);
    })();
  };
})();
