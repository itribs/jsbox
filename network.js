var l_r = l_s = 0

function getIfaData() {
  r = 0
  s = 0
  data = $network.ifa_data
  for (key in data) {
    item = data[key]
    r += item["received"]
    s += item["sent"]
  }
  return {
    "received": r,
    "sent": s
  }
}

function bytesToSize(bytes) {　　
  if (bytes === 0) return '0 B'
  var k = 1024
  sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  i = Math.floor(Math.log(bytes) / Math.log(k))　　
  return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i]
}

function refresh() {
  data = getIfaData()
  r = data["received"] - l_r
  s = data["sent"] - l_s
  $("networkRate").get("upLabel").text = bytesToSize(s) + " /s"
  $("networkRate").get("downLabel").text = bytesToSize(r) + " /s"
  l_r = data["received"]
  l_s = data["sent"]
  $delay(1, refresh)
}

$ui.render({
  props: {
    id: "networkRate"
  },
  views: [{
      type: "label",
      props: {
        id: "upLabel",
        text: "0 B/s",
        align: $align.center,
        textColor: $color("#666666"),
        font: $font(26)
      },
      layout: function(make, view) {
        make.centerY.equalTo(view.super)
        make.centerX.equalTo(view.super).dividedBy(2)
      }
    },
    {
      type: "label",
      props: {
        id: "downLabel",
        text: "0 B/s",
        align: $align.center,
        textColor: $color("#333333"),
        font: $font(26)
      },
      layout: function(make, view) {
        make.centerY.equalTo(view.super)
        make.centerX.equalTo(view.super).multipliedBy(1.5)
      }
    },
    {
      type: "label",
      props: {
        text: "▲",
        alpha: 0.6,
        font: $font(10)
      },
      layout: function(make, view) {
        upLabel = view.super.get("upLabel")
        make.centerX.equalTo(upLabel)
        make.top.equalTo(upLabel.bottom)
      }
    },
    {
      type: "label",
      props: {
        text: "▼",
        font: $font(10)
      },
      layout: function(make, view) {
        downLabel = view.super.get("downLabel")
        make.centerX.equalTo(downLabel)
        make.top.equalTo(downLabel.bottom)
      }
    }
  ],
  layout: function(make, view) {
    make.size.equalTo($size(150, 32))
    make.left.top.equalTo(8)
  }
})

refresh()