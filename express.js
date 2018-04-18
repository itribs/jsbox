var _ = require("lodash")

var EXPRESS_COMS = { 'shunfeng': "顺丰", 'yuantong': "圆通速递", 'shentong': "申通", 'zhongtong': "中通速递", 'yunda': "韵达快运", 'tiantian': "天天快递", 'huitongkuaidi': "汇通快运", 'youshuwuliu': "优速物流", 'ems': "ems快递", 'guangdongyouzhengwuliu': "广东邮政物流", 'youzhengguonei': "邮政包裹挂号信", 'youzhengguoji': "邮政国际包裹挂号信", 'debangwuliu': "德邦物流", 'aae': "aae全球专递", 'anjie': "安捷快递", 'anxindakuaixi': "安信达快递", 'biaojikuaidi': "彪记快递", 'bht': "bht", 'baifudongfang': "百福东方国际物流", 'coe': "中国东方（COE）", 'changyuwuliu': "长宇物流", 'datianwuliu': "大田物流", 'dhl': "dhl", 'dpex': "dpex", 'dsukuaidi': "d速快递", 'disifang': "递四方", 'fedex': "fedex（国外）", 'feikangda': "飞康达物流", 'fenghuangkuaidi': "凤凰快递", 'feikuaida': "飞快达", 'guotongkuaidi': "国通快递", 'ganzhongnengda': "港中能达物流", 'gongsuda': "共速达", 'hengluwuliu': "恒路物流", 'huaxialongwuliu': "华夏龙物流", 'haihongwangsong': "海红", 'haiwaihuanqiu': "海外环球", 'jiayiwuliu': "佳怡物流", 'jinguangsudikuaijian': "京广速递", 'jixianda': "急先达", 'jjwl': "佳吉物流", 'jymwl': "加运美物流", 'jindawuliu': "金大物流", 'jialidatong': "嘉里大通", 'jykd': "晋越快递", 'kuaijiesudi': "快捷速递", 'lianb': "联邦快递（国内）", 'lianhaowuliu': "联昊通物流", 'longbanwuliu': "龙邦物流", 'lijisong': "立即送", 'lejiedi': "乐捷递", 'minghangkuaidi': "民航快递", 'meiguokuaidi': "美国快递", 'menduimen': "门对门", 'ocs': "OCS", 'peisihuoyunkuaidi': "配思货运", 'quanchenkuaidi': "全晨快递", 'quanfengkuaidi': "全峰快递", 'quanjitong': "全际通物流", 'quanritongkuaidi': "全日通快递", 'quanyikuaidi': "全一快递", 'rufengda': "如风达", 'santaisudi': "三态速递", 'shenghuiwuliu': "盛辉物流", 'sue': "速尔物流", 'shengfeng': "盛丰物流", 'saiaodi': "赛澳递", 'tiandihuayu': "天地华宇", 'tnt': "tnt", 'ups': "ups", 'wanjiawuliu': "万家物流", 'wenjiesudi': "文捷航空速递", 'wuyuan': "伍圆", 'wxwl': "万象物流", 'xinbangwuliu': "新邦物流", 'xinfengwuliu': "信丰物流", 'yafengsudi': "亚风速递", 'yibangwuliu': "一邦速递", 'yuanchengwuliu': "远成物流", 'yuanweifeng': "源伟丰快递", 'yuanzhijiecheng': "元智捷诚快递", 'yuntongkuaidi': "运通快递", 'yuefengwuliu': "丰物流", 'yad': "源安达", 'yinjiesudi': "银捷速递", 'zhaijisong': "宅急送", 'zhongtiekuaiyun': "中铁快运", 'zhongyouwuliu': "中邮物流", 'zhongxinda': "忠信达", 'zhimakaimen': "芝麻开门" }

var code = $context.text || $clipboard.text
if (!(/^\d*$/.test(code))) {
  code = ""
}

var comkeys = Object.keys(EXPRESS_COMS)
var comvalues = Object.values(EXPRESS_COMS)
var comCode = ""

var comCurrent = 0
var comPagesize = $app.env == $env.today ? 2 : 7
var comPages = _.chunk(comvalues, comPagesize)
for (var idx in comPages) {
  comPages[idx].splice(0, 0, "自动")
  comPages[idx].push("下一页")
}

function selectCom(complete) {
  $ui.menu({
    items: comPages[comCurrent],
    handler: function(title, idx) {
      if (title == "下一页") {
        comCurrent++
        if (comCurrent > comPages.length - 1) {
          comCurrent = 0
        }
        selectCom(complete)
        return
      } else if (title == "自动") {
        comCode = ""
        if (complete) {
          complete()
        }
      } else {
        var index = comvalues.indexOf(title)
        comCode = comkeys[index]
        if (complete) {
          complete()
        }
      }
      comCurrent = 0
    }
  })
}

function updateComTitle() {
  if (!comCode) {
    $("com").title = "自动"
  } else {
    $("com").title = EXPRESS_COMS[comCode]
  }
}

function queryCom(code, complete) {
  if (!code || !(/^\d*$/.test(code))) {
    return
  }
  if (comCode) {
    if (complete) {
      complete()
    }
    return
  }

  $http.get({
    url: "https://www.kuaidi100.com/autonumber/autoComNum?text=" + code,
    handler: function(resp) {
      var auto = resp.data["auto"]
      if (auto.length > 0) {
        comCode = auto[0]['comCode']
        if (complete) {
          complete()
        }
      } else {
        selectCom(function() {
          if (complete) {
            complete()
          }
        })
      }
    }
  })
}

function queryData(code, complete) {
  queryCom(code, function() {
    $http.get({
      url: "https://m.kuaidi100.com/query?type=" + comCode + "&postid=" + code + "&id=1&valicode=&temp=",
      handler: function(resp) {
        var data = resp.data["data"]
        var result = ""
        for (var i in data) {
          result += data[i]["time"] + " " + data[i]["location"] + " " + data[i]["context"] + "\n\n"
        }
        if (!result) {
          result = "无结果"
        }
        if (complete) {
          complete(result)
        }
      }
    })
  })
}

$ui.render({
  props: {
    title: "快递"
  },
  views: [{
      type: "button",
      props: {
        id: "com",
        font: $font(14),
        title: "自动",
        radius: 18,
        contentEdgeInsets: $insets(0,10,0,10)
      },
      layout: function(make, view) {
        make.left.top.equalTo(view.super).offset(8)
        make.height.equalTo(36)
        make.width.greaterThanOrEqualTo(60)
      },
      events: {
        tapped: function(sender) {
          selectCom(function() {
            updateComTitle()
          })
        }
      }
    },
    {
      type: "input",
      props: {
        id: "code",
        radius: 18,
        text: code,
        font: $font(14)
      },
      layout: function(make, view) {
        make.left.equalTo($("com").right).offset(8)
        make.top.equalTo(view.super).offset(8)
        make.height.equalTo(36)
        make.width.equalTo(500).priority(1)
      }
    },
    {
      type: "button",
      props: {
        id: "query",
        radius: 18,
        title: "查询",
        font: $font(14),
        bgcolor: $color("#5288B1"),
        titleColor: $color("#ffffff")
      },
      layout: function(make, view) {
        make.top.equalTo(view.super).offset(8)
        make.left.equalTo($("code").right).offset(8)
        make.right.equalTo(view.super).offset(-8)
        make.size.equalTo($size(60, 36))
      },
      events: {
        tapped: function(sender) {
          queryData($("code").text, function(result) {
            updateComTitle()
            $("result").text = result
          })
        }
      }
    },
    {
      type: "text",
      props: {
        id: "result",
        bgcolor: $color("#eeeeee"),
        radius: 8,
        align: $align.left,
        font: $font(12)
      },
      layout: function(make, view) {
        make.top.equalTo($("query").bottom).offset(8)
        make.left.equalTo(view.super).offset(8)
        make.right.bottom.equalTo(view.super).offset(-8)
      }
    }
  ]
})

queryData($("code").text, function(result) {
  updateComTitle()
  $("result").text = result
})