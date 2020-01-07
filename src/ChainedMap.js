const merge = require("deepmerge");
const Chainable = require("./Chainable");

module.exports = class extends Chainable {
  constructor(parent) {
    super(parent);

    // 一个普通map
    this.store = new Map();
  }

  // 生成快捷方法
  extend(methods) {
    this.shorthands = methods;
    methods.forEach(method => {
      this[method] = value => this.set(method, value);
    });
    return this;
  }

  // 从 Map 移除所有 配置
  clear() {
    this.store.clear();
    return this;
  }

  // 从 Map 移除 key 对应的配置
  delete(key) {
    this.store.delete(key);
    return this;
  }

  // 根据__before、__after排序
  order() {
    // 将map转plain object entries
    const entries = [...this.store].reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

    // 将plain object的keys数组拷贝一份，用在删除
    const names = Object.keys(entries);
    const order = [...names];

    names.forEach(name => {
      if (!entries[name]) {
        return;
      }

      const { __before, __after } = entries[name];

      if (__before && order.includes(__before)) {
        // 删除当前name
        order.splice(order.indexOf(name), 1);
        // 将name添加到__before之前
        order.splice(order.indexOf(__before), 0, name);
      } else if (__after && order.includes(__after)) {
        order.splice(order.indexOf(name), 1);
        // 将name添加到__after之后
        order.splice(order.indexOf(__after) + 1, 0, name);
      }
    });

    return { entries, order };
  }

  // 返回Map中全部配置的一个对象, 其中 键是这个对象属性，值是相应键的值，
  // 如果Map是空，返回 `undefined`
  entries() {
    const { entries, order } = this.order();

    if (order.length) {
      return entries;
    }

    return undefined;
  }

  // 返回 Map中已存储的所有值的数组
  values() {
    const { entries, order } = this.order();

    return order.map(name => entries[name]);
  }

  // 获取对应key的值
  get(key) {
    return this.store.get(key);
  }

  // 获取map中的对应key的值，若无对应key，则调用fn先生成一个值，再返回对应key值
  getOrCompute(key, fn) {
    // map 无对应key
    if (!this.has(key)) {
      // 设置key的值为fn返回值
      this.set(key, fn());
    }
    return this.get(key);
  }

  // 是否存在某key
  has(key) {
    return this.store.has(key);
  }

  // 设置某key的值
  set(key, value) {
    this.store.set(key, value);
    return this;
  }

  // 将obj合并到Map中,omit中的key会被忽略
  merge(obj, omit = []) {
    Object.keys(obj).forEach(key => {
      if (omit.includes(key)) {
        return;
      }

      const value = obj[key];

      if (
        (!Array.isArray(value) && typeof value !== "object") ||
        value === null ||
        !this.has(key)
      ) {
        // value不为数组、对象
        // value为null
        // key不存在时
        // 设置对应值
        this.set(key, value);
      } else {
        // 否则，递归合并
        this.set(key, merge(this.get(key), value));
      }
    });

    return this;
  }

  // 剔除obj中的空值、空数组、空对象，并返回一个新对象
  clean(obj) {
    return Object.keys(obj).reduce((acc, key) => {
      const value = obj[key];

      if (value === undefined) {
        return acc;
      }

      if (Array.isArray(value) && !value.length) {
        return acc;
      }

      if (
        Object.prototype.toString.call(value) === "[object Object]" &&
        !Object.keys(value).length
      ) {
        return acc;
      }

      acc[key] = value;

      return acc;
    }, {});
  }

  // 条件执行一个函数去继续配置
  when(
    condition,
    whenTruthy = Function.prototype,
    whenFalsy = Function.prototype
  ) {
    if (condition) {
      whenTruthy(this);
    } else {
      whenFalsy(this);
    }

    return this;
  }
};
