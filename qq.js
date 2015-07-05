(function(global) {
  var doc = global.document,
      arr = Array.prototype,
      htmlRegex = /^\s*<([a-zA-Z0-9]+)>.*<\/\1>\s*$/,
      querySelectableEles = [doc.ELEMENT_NODE, doc.DOCUMENT_NODE, doc.DOCUMENT_FRAGMENT_NODE],
      qq = function (target, ctx) {
        if (!target) throw new Error("Please indicate target dom rule by first parameter!");
        return new Q_Q(target, ctx);
      },
      pushNodes = function (nodes, container) {
        arr.forEach.call(nodes, function(node) {
          container[container.length++] = node;
        });
      };

  global.qq = qq;
  qq.fn = Q_Q.prototype;

  function Q_Q(target, ctx) {
    var currCtx = doc,
        that = this;

    this.length = 0;
    this.target = target;
    this.context = ctx;

    if (ctx) {
      if (querySelectableEles.indexOf(ctx.nodeType) !== -1 ||
          ctx instanceof NodeList ||
          ctx instanceof HTMLCollection ||
          ctx instanceof Q_Q) {
        currCtx = ctx;
      } else {
        currCtx = doc.querySelectorAll(ctx);
      }
    }

    if (typeof target === 'string') {
      // html syntax
      if (htmlRegex.test(target)) {
        throw new Error("HTML syntax not support currently.")

      // suppose it is css selector
      } else {
        if (currCtx.length) {
          arr.forEach.call(currCtx, function (eachCtx) {
            pushNodes(eachCtx.querySelectorAll(target), that);
          });
        } else {
          pushNodes(currCtx.querySelectorAll(target), this);
        }
      }
      return this;

    // Element node
    } else if (target.nodeType === doc.ELEMENT_NODE) {
      this[this.length++] = target;
      return this;

    // NodeList or HTMLCollection
    } else if (target instanceof NodeList || target instanceof HTMLCollection) {
      pushNodes(target, this);
      return this;

    } else {
      throw new Error("Target incorrect, it must be css selector, html syntax, element node, NodeList or HTMLCollection.");
    }
  }

  qq.fn.each = function (callback) {
    arr.forEach.call(this, callback);
    return this;
  };

  qq.fn.map = function (callback) {
    return arr.map.call(this, callback);
  };

  qq.fn.addClass = function () {
    var args = arguments;
    this.each(function (ele) {
      arr.forEach.call(args, function(className) {
        ele.classList.add(className);
      });
    });
    return this;
  };

  qq.fn.removeClass = function () {
    var args = arguments;
    this.each(function (ele) {
      arr.forEach.call(args, function(className) {
        ele.classList.remove(className);
      });
    });
    return this;
  };

  qq.fn.toggleClass = function () {
    var args = arguments;
    this.each(function (ele) {
      arr.forEach.call(args, function(className) {
        ele.classList.toggle(className);
      });
    });
    return this;
  };

  qq.fn.atts = function () {
    var args = arguments,
        val;
    if (args.length == 2) { // key, value
      val = args[1];
      if (typeof val === 'function') {
        this.each(function (ele) { ele.setAttribute(args[0], val(ele)); });
      } else {
        this.each(function (ele) { ele.setAttribute(args[0], val); });
      }
    } else { // obj
      for (var key in args[0]) {
        val = args[0][key];
        if (typeof val === 'function') {
          this.each(function (ele) { ele.setAttribute(key, val(ele)); });
        } else {
          this.each(function (ele) { ele.setAttribute(key, val); });
        }
      }
    }
  };

  qq.fn.rmAtts = function (atts) {
    var that = this;
    atts.forEach(function (att) {
      that.each(function (ele) { ele.removeAttribute(att); });
    });
  };

  qq.fn.datas = function () {
    var args = arguments,
        val;
    if (args.length == 2) { // key, value
      val = args[1];
      if (typeof val === 'function') {
        this.each(function (ele) { ele.dataset[args[0]] = val(ele); });
      } else {
        this.each(function (ele) { ele.dataset[args[0]] = val; });
      }
    } else { // obj
      for (var key in args[0]) {
        val = args[0][key];
        if (typeof val === 'function') {
          this.each(function (ele) { ele.dataset[key] = val(ele); });
        } else {
          this.each(function (ele) { ele.dataset[key] = val; });
        }
      }
    }
  };

  qq.fn.rmDatas = function (datas) {
    var that = this;
    datas.forEach(function (data) {
      that.each(function (ele) { delete ele.dataset[data]; });
    });
  };

}(this));
