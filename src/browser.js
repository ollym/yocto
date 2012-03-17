
/** @type {{version:string, webkit:boolean}} */
Yocto.browser = {
  version: null,
  webkit: false
};

/** @enum {boolean} */
Yocto.os = {
  android: false,
  ios: false,
  webos: false,
  touchpad: false,
  blackberry: false
};

(function(agent) {
  
  var webkit = agent.match(/WebKit\/([\d.]+)/),
      android = agent.match(/(Android)\s+([\d.]+)/),
      ipad = agent.match(/(iPad).*OS\s([\d_]+)/),
      iphone = ! ipad && agent.match(/(iPhone\sOS)\s([\d_]+)/),
      webos = agent.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
      touchpad = webos && agent.match(/TouchPad/),
      blackberry = agent.match(/(BlackBerry).*Version\/([\d.]+)/);
  
  if (webkit) Yocto.browser.version = webkit[1];
  Yocto.browser.webkit = !!webkit;
  
  if (android) Yocto.os.android = true, Yocto.os.version = android[2];
  if (iphone) Yocto.os.ios = true, Yocto.os.version = iphone[2].replace(/_/g, '.'), Yocto.os.iphone = true;
  if (ipad) Yocto.os.ios = true, Yocto.os.version = ipad[2].replace(/_/g, '.'), Yocto.os.ipad = true;
  if (webos) Yocto.os.webos = true, Yocto.os.version = webos[2];
  if (touchpad) Yocto.os.touchpad = true;
  if (blackberry) Yocto.os.blackberry = true, Yocto.os.version = blackberry[2];
  
})(navigator.userAgent);