const app = getApp()
var page = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    text: "Page animation",
    goodsList: [],
    btn:false,
    animation: '',
    pinpaiOff: -1,
    pinleiOff: -1,
    qualityOff: -1,
    isfq: [{
        name: '有降价',
        is: false
      },
      {
        name: '支持分期',
        is: false
      },
    ],
    form_obj: {
      // pinpai: '',
      // pinlei: '',
      // xinjiu: '',
      // isfq: '',
      // zdj: '',
      // zgj: '',
    },
    seekObj: {},
    sortId: 0,
    zdj: '',
    zgj: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    page = 0
    console.log('page', page)
    console.log('options', options)
    let that = this;
    that.setData({
      options
    })
    let form_obj = that.getFormData(that)
    console.log('form_obj', form_obj)
    that.setData({
      form_obj
    })
    that.getObjs(that,false, form_obj)
    wx.$http('Index/searchInfo').then(res => {
      that.setData({
        seekObj: res.data.data
      })
      console.log(res.data.data)
    })
  },
  getFormData(that){
    let form_obj = {};
    let options = that.options;

    if (options.keywords) {
      form_obj.keywords = options.keywords;
    } else if (options.brand_id) {
      form_obj.brand_id = options.brand_id;
    } else if (options.cate_id) {
      form_obj.cate_id = options.cate_id;
    } else if (options.activity_id) {
      form_obj.activity_id = options.activity_id;
    } else if (options.is_credit) {
      wx.showModal({
        title: '提示',
        showCancel:false,
        confirmText: '知道了',
        content: '下载奢物APP才能分期付款哦～',
        success (res) {
          if (res.confirm) {
            console.log('用户点确认')
          } 
        }
      })
      form_obj.is_credit = options.is_credit;
    }
    form_obj.sort = options.sort || 0;
    return form_obj
  },
  bindinput(e) {
    page = 0;
    let that = this;
    let form_obj = that.data.form_obj;
    form_obj.keywords = e.detail.value;
    that.setData({
      form_obj
    })
    wx.$http('Goods/getList', {
      keywords: e.detail.value,
    }).then(res => {
      that.setData({
        goodsList: res.data.data.goods_list
      })
      console.log(res.data.data)
    })
  },
  getObjs(that,p,data) {
    const list = that.data.goodsList || [];
    data = data? data : that.data.form_obj;
    data.p = page;
    wx.$http('Goods/getList', data).then(res => {
      let goodsList;
      if(p){
        goodsList = list.concat(res.data.data.goods_list)
      }else{
        goodsList = res.data.data.goods_list
      }
      
      that.setData({
        goodsList
      })
      setTimeout(()=>{
        wx.hideLoading()
      },2000)
    })
  },
  sort(e) {
    let that = this;
    const sort = e.currentTarget.dataset.sort
    // let sortId = e.currentTarget.dataset.sort;
    let form_obj = that.data.form_obj;
    form_obj.sort = sort;
    that.setData({
      form_obj
    })
    that.getObjs(that)

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    //实例化一个动画
    this.animation = wx.createAnimation({
      // 动画持续时间，单位ms，默认值 400
      duration: 300,
      /**
       * http://cubic-bezier.com/#0,0,.58,1  
       *  linear  动画一直较为均匀
       *  ease    从匀速到加速在到匀速
       *  ease-in 缓慢到匀速
       *  ease-in-out 从缓慢到匀速再到缓慢
       * 
       *  http://www.tuicool.com/articles/neqMVr
       *  step-start 动画一开始就跳到 100% 直到动画持续时间结束 一闪而过
       *  step-end   保持 0% 的样式直到动画持续时间结束        一闪而过
       */
      timingFunction: 'linear',
      // 延迟多长时间开始
      delay: 0,
      /**
       * 以什么为基点做动画  效果自己演示
       * left,center right是水平方向取值，对应的百分值为left=0%;center=50%;right=100%
       * top center bottom是垂直方向的取值，其中top=0%;center=50%;bottom=100%
       */
      success: function (res) {
        console.log(res)
      }
    })
  },

  filtrate(e) {
    this.setData({btn:true})
    this.animation.translateX(-100 + '%').step()
    // this.animation.rotate(150).step()
    this.setData({
      //输出动画
      animation: this.animation.export()
    })
  },
  filtrateEnd() {
    let that = this;
    this.setData({btn:false})

    that.getObjs(that,false, that.data.form_obj)
    this.animation.translateX(0).step()
    // this.animation.rotate(150).step()
    this.setData({
      //输出动画
      animation: this.animation.export()
    })
  },
  zdj(e) {
    let form_obj = this.data.form_obj;
    // form_obj.zdj = e.detail.value;
    form_obj.min_price = e.detail.value;
    this.setData({
      form_obj,
      zdj: e.detail.value
    })
  },
  zgj(e) {
    let form_obj = this.data.form_obj;
    // form_obj.zgj = e.detail.value;
    form_obj.max_price = e.detail.value;
    this.setData({
      form_obj,
      zgj: e.detail.value
    })
  },
  toGoods(e) {
    console.log(e.currentTarget.dataset.id)
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/shop/goods/goods?id=' + id
    })
  },
  /**
   *选择品类封装函数
   *
   * @param {name} 传入需要筛选的种类
   */
  ispl(e) {
    let that = this;
    let id = e.currentTarget.dataset.id; //获取id
    let cls = e.currentTarget.dataset.cls; //获取哪一个种类

    let leixing = that.data.seekObj; //获取种类内容
    // let leixing = that.data.seekObj[cls]; //获取种类内容
    let form_obj = that.data.form_obj;
    // leixing.forEach(e => {
    //   e.is = false /* 排他 */
    // });
    if (cls == "brand_list") {
      // form_obj[cls] = leixing[cls][id].keywords;
      // form_obj.keywords = leixing[cls][id].keywords;
      if (form_obj.brand_id == leixing[cls][id].brand_id) {
        form_obj.brand_id = '';
        id = '-1';
      } else {
        form_obj.brand_id = leixing[cls][id].brand_id;
      }
      that.setData({
        pinpaiOff: id,
        form_obj,
        seekObj: leixing
      })
    } else if (cls == "cate_list") {
      // form_obj[cls] = leixing[cls][id].cate_name;
      // form_obj.cate_id = leixing[cls][id].cate_id;
      if (form_obj.cate_id == leixing[cls][id].cate_id) {
        form_obj.cate_id = '';
        id = '-1';
      } else {
        form_obj.cate_id = leixing[cls][id].cate_id;
      }
      that.setData({
        pinleiOff: id,
        form_obj,
        seekObj: leixing
      })
    } else if (cls == "quality_list") {
      // form_obj[cls] = leixing[cls][id].quality_name;
      if (form_obj.quality_id == leixing[cls][id].quality_id) {
        form_obj.quality_id = '';
        id = '-1';
      } else {
        form_obj.quality_id = leixing[cls][id].quality_id;
      }
      that.setData({
        qualityOff: id,
        form_obj,
        seekObj: leixing
      })
    } else {
      let isfq = that.data.isfq;
      // form_obj[cls] = isfq[id].name;
      isfq.forEach((e, i) => {
        if (id == i) return;
        e.is = false /* 排他 */
      });
      isfq[id].is = !isfq[id].is; //改变状态
      if (id == 0) {
        console.log(id)
        form_obj.is_sales = isfq[id].is ? 1 : 0;
        form_obj.is_credit = 0;
      } else {
        form_obj.is_sales = 0;
        form_obj.is_credit = isfq[id].is ? 1 : 0;
      }
      that.setData({
        [cls]: isfq,
        form_obj
      })
    }
  },
  reset() {
    let that = this;
    let isfq = [{
        name: '有降价',
        is: false
      },
      {
        name: '支持分期',
        is: false
      },
    ];
    let form_obj = that.getFormData(that)
    that.setData({
      form_obj,
      pinpaiOff: '-1',
      pinleiOff: '-1',
      qualityOff: '-1',
      zdj: '',
      zgj: '',
      isfq,
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    wx.showLoading({
      title: '加载中',
    })

    const that = this;
    page++
    that.getObjs(that,true)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})