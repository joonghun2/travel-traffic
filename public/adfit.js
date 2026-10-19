// Kakao AdFit loader for the static test pages (/event1, /event2).
// Call window.mountAdfit('<container id>') when the container becomes visible;
// it renders the ad once per page view.
(function () {
  var UNIT = 'DAN-1KAy0L6HlzeWlDlY';

  window.mountAdfit = function (containerId) {
    var container = document.getElementById(containerId);
    if (!container || container.getAttribute('data-ad-mounted')) return;
    container.setAttribute('data-ad-mounted', '1');

    var ins = document.createElement('ins');
    ins.className = 'kakao_ad_area';
    ins.style.display = 'none';
    ins.setAttribute('data-ad-unit', UNIT);
    ins.setAttribute('data-ad-width', '300');
    ins.setAttribute('data-ad-height', '250');
    container.appendChild(ins);

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = '//t1.kakaocdn.net/kas/static/ba.min.js';
    container.appendChild(script);
  };
})();
