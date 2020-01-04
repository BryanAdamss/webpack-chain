// 主要被ChainedSet、ChainedMap子类继承
// 实现了batch、end方法
module.exports = class {
  constructor(parent) {
    this.parent = parent;
  }

  // 对当前配置上下文执行函数
  batch(handler) {
    handler(this);
    return this;
  }

  // 返回上一实例；ChainedSet、ChainedMap实例可以用其返回上一层
  end() {
    return this.parent;
  }
};
