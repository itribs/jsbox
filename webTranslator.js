var webUrl = ($context.safari ? $context.safari.items.baseURI : null) || $context.link || $clipboard.link

var script = function() {
  var doms = [];
  var domsArr = [];
  var srcs = [];
  var srcsArr = [];

  function getText(dom) {
    for (var i = 0; i < dom.childNodes.length; i++) {
      if (dom.childNodes[i].nodeType == 1) {
        getText(dom.childNodes[i])
      } else if (dom.childNodes[i].nodeType == 3) {
        var value = dom.childNodes[i].nodeValue.replace(/\s/g, "").replace(/\n/g, "")
        if (!value || !/[a-z]/i.test(value)) {
          continue;
        }

        var values = dom.childNodes[i].nodeValue.split("\n");
        for (var j = 0; j < values.length; j++) {
          if (!values[j].replace(/\s/g, "")) {
            continue;
          }

          doms.push(dom.childNodes[i])
          srcs.push(values[j].replace(/(^\s*)|(\s*$)/g, ""))
        }
      }
    }
  }

  function split() {
    for (var i = 0, len = srcs.length; i < len; i += 30) {
      domsArr.push(doms.slice(i, i + 30));
      srcsArr.push(srcs.slice(i, i + 30));
    }
  }

  function replace(results, index) {  
    var ds = domsArr[index]
    var ss = srcsArr[index]
    for (var i in ss) {
      ds[i].nodeValue = results[i].TranslatedText
    }
  }

  getText(document.body)
  split()
  for (var i in srcsArr) {
    $notify("request", {
      index: i,
      srcs: srcsArr[i]
    })
  }
}

$ui.render({
  props: {
    title: "网页翻译"
  },
  views: [{
    type: "web",
    props: {
      id: "webview",
      toolbar: true,
      url: webUrl,
      script: script
    },
    layout: $layout.fill,
    events: {
      didFinish: function(sender, navigation) {

      },
      request: function(obj) {
        var url = getUrl(obj.srcs)
        query(url, function(results) {
          $("webview").eval({
            script: "replace(" + JSON.stringify(results) + ", " + obj.index + ")"
          })
        })
      },
      console: function(obj) {
        $console.info(obj)
      }
    }
  }]
})

function filter(value) {
  var pattern = new RegExp("[`‘；：”“。，、？]", "g")
  var matchResults = value.match(pattern)
  for (var n in matchResults) {
    value = value.replace(matchResults[n], "\\u" + matchResults[n].charCodeAt(0).toString(16))
  }
  return encodeURI(value)
}

function getUrl(srcs) {
  var url = ""
  for (var i in srcs) {
    if (url != "") {
      url += ","
    }
    url += "%22" + filter(srcs[i]).replace(/\s+/g, "+") + "%22"
  }
  url = "https://api.microsofttranslator.com/v2/ajax.svc/TranslateArray?appId=%22000000000A9F426B41914349A3EC94D7073FF941%22&to=%22zh%22&oncomplete=&onerror=_mste3&loc=en&ctr=&ref=WidgetV3&rgp=12275a37&texts=[" + url + "]"
  return url
}

function query(url, complete) {
  $http.request({
    method: "GET",
    url: url,
    header: {
      "Accept": "*/*",
      "Accept-Encoding": "br, gzip, deflate",
      "Accept-Language": "zh-cn",
      "Connection": "keep-alive",
      "DNT": "1",
      "Host": "api.microsofttranslator.com",
      "Referer": "https://wiki.keyboardmaestro.com/Home_Page",
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 11_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1",
      "Content-Type": ""
    },
    handler: function(resp) {
      var data = resp.data
      $console.info(url)
      $console.info(resp.error)
      complete(data)
    }
  })
}