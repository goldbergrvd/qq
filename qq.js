(function(global) {
  var doc = global.document,
      arr = Array.prototype,
      htmlRegex = /^\s*<([a-zA-Z0-9]+)(?: .*)>.*<\/\1>\s*$/,
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
    this.evt = {};

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
        var divEle = doc.createElement('div');
        var docFrag = doc.createDocumentFragment();
        docFrag.appendChild(divEle);
        var queryDiv = docFrag.querySelector('div');
        queryDiv.innerHTML = target;
        pushNodes(queryDiv.children, this);

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
    return this;
  };

  qq.fn.rmAtts = function (atts) {
    var that = this;
    atts.forEach(function (att) {
      that.each(function (ele) { ele.removeAttribute(att); });
    });
    return this;
  };

  qq.fn.datas = function () {
    var args = arguments,
        val;
    if (args.length == 2) { // key, value
      val = args[1];
      if (typeof val === 'function') {
        this.each(function (ele, i) { ele.dataset[args[0]] = val(ele, i); });
      } else {
        this.each(function (ele) { ele.dataset[args[0]] = val; });
      }
    } else { // obj
      for (var key in args[0]) {
        val = args[0][key];
        if (typeof val === 'function') {
          this.each(function (ele, i) { ele.dataset[key] = val(ele, i); });
        } else {
          this.each(function (ele) { ele.dataset[key] = val; });
        }
      }
    }
    return this;
  };

  qq.fn.rmDatas = function (datas) {
    var that = this;
    datas.forEach(function (data) {
      that.each(function (ele) { delete ele.dataset[data]; });
    });
    return this;
  };

  qq.fn.text = function (strOrNum) {
    if (strOrNum) {
      if (typeof strOrNum === 'function') {
        this.each(function (ele, i) { ele.textContent = strOrNum(ele, i); });
        return this;
      } else if (typeof strOrNum === 'string') {
        this.each(function (ele) { ele.textContent = strOrNum; });
        return this;
      } else {
        try {
          return this[strOrNum].textContent;
        } catch (e) {
          return '';
        }
      }
    } else {
      return this.map(function (ele) { return ele.textContent; });
    }
  };

  qq.fn.on = function (evtName, evtTag, evtCallback) {
    if (this.evt[evtName]) {
      if (this.evt[evtName][evtTag]) {
        throw new Error('Event ' + evtName + ' with tag ' + evtTag + ' has already binded.');
      }
    } else {
      this.evt[evtName] = {};
    }
    this.evt[evtName][evtTag] = evtCallback;
    return this.each(function (ele) { ele.addEventListener(evtName, evtCallback, false) });
  };

  qq.fn.off = function (evtName, evtTagOrCallback) {
    var evt = evtTagOrCallback;
    if (typeof evt !== 'function') {
      if (this.evt[evtName] && this.evt[evtName][evtTagOrCallback]) {
        evt = this.evt[evtName][evtTagOrCallback];
        delete this.evt[evtName][evtTagOrCallback];
      } else {
        throw new Error('No such event ' + evtName + ' with tag ' + evtTagOrCallback + ' in this Q_Q object.');
      }
    }
    return this.each(function (ele) { ele.removeEventListener(evtName, evt, false); });
  };

  qq.fn.before = function (strOrEleOrCb) {
    if (typeof strOrEleOrCb === 'string') {
      this.each(function (ele) {
        ele.parentNode.insertBefore(qq(strOrEleOrCb)[0], ele);
      });
    } else if (strOrEleOrCb instanceof HTMLElement) {
      this.each(function (ele) {
        ele.parentNode.insertBefore(strOrEleOrCb.cloneNode(true), ele);
      });
    } else {
      this.each(function (ele, i) {
        var result = strOrEleOrCb(ele, i);
        if (result) {
          if (typeof result === 'string') {
            ele.parentNode.insertBefore(qq(result)[0], ele);
          } else {
            ele.parentNode.insertBefore(result, ele);
          }
        }
      });
    }
    return this;
  };

  qq.fn.after = function (strOrEleOrCb) {
    function appendEleAfterTarget(ele, target) {
      var nextEleSibling = target.nextElementSibling;
      if (nextEleSibling == null) {
        target.parentNode.appendChild(ele);
      } else {
        target.parentNode.insertBefore(ele, nextEleSibling);
      }
    }

    if (typeof strOrEleOrCb === 'string') {
      this.each(function (ele) {
        appendEleAfterTarget(qq(strOrEleOrCb)[0], ele);
      });
    } else if (strOrEleOrCb instanceof HTMLElement) {
      this.each(function (ele) {
        appendEleAfterTarget(strOrEleOrCb.cloneNode(true), ele);
      });
    } else {
      this.each(function (ele, i) {
        var result = strOrEleOrCb(ele, i);
        if (result) {
          if (typeof result === 'string') {
            appendEleAfterTarget(qq(result)[0], ele);
          } else {
            appendEleAfterTarget(result, ele);
          }
        }
      });
    }
    return this;
  };

  qq.fn.remove = function() {
    this.each(function (ele) { ele.parentNode.removeChild(ele); });
  };

}(this));
