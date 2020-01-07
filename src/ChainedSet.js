const Chainable = require("./Chainable");

module.exports = class extends Chainable {
  constructor(parent) {
    super(parent);
    this.store = new Set();
  }

  // Set的尾部添加一个value（类似Array.prototype.push）
  add(value) {
    this.store.add(value);
    return this;
  }

  // Set的开始位置添加一个value（类似Array.prototype.unshift)
  prepend(value) {
    this.store = new Set([value, ...this.store]);
    return this;
  }

  // 清除Set
  clear() {
    this.store.clear();
    return this;
  }

  // 删除某个值
  delete(value) {
    this.store.delete(value);
    return this;
  }

  // 返回Set中值的数组
  values() {
    return [...this.store];
  }

  // 是否有某值
  has(value) {
    return this.store.has(value);
  }

  // 连接给定的数组到 Set 尾部
  merge(arr) {
    this.store = new Set([...this.store, ...arr]);
    return this;
  }

  // 条件判断
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
