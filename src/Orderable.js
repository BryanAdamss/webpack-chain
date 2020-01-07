// 一个函数，接收一个父类
// 返回一个继承了父类的子类
// 主要实现顺序调用
module.exports = Class =>
  class extends Class {
    // 规定当前实例应该在name之前执行
    // 主要用在Plguin、Rule、Use中；
    // 例如当同时存在多个Plugin时，可以使用before、after控制Plugin的执行顺序
    // ! 不能在同一个实例上同时使用 .before() 和 .after()
    // 当前实例应该在name之前
    before(name) {
      if (this.__after) {
        throw new Error(
          `Unable to set .before(${JSON.stringify(
            name
          )}) with existing value for .after()`
        );
      }

      this.__before = name;
      return this;
    }

    // 规定当前实例应该在name之后执行
    // ! 不能在同一个实例上同时使用 .before() 和 .after()
    // 当前实例应该在name之后
    after(name) {
      if (this.__before) {
        throw new Error(
          `Unable to set .after(${JSON.stringify(
            name
          )}) with existing value for .before()`
        );
      }

      this.__after = name;
      return this;
    }

    merge(obj, omit = []) {
      if (obj.before) {
        this.before(obj.before);
      }

      if (obj.after) {
        this.after(obj.after);
      }

      return super.merge(obj, [...omit, "before", "after"]);
    }
  };
