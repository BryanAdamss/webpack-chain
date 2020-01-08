const merge = require("deepmerge");
const ChainedMap = require("./ChainedMap");
const Orderable = require("./Orderable");

module.exports = Orderable(
  class extends ChainedMap {
    constructor(parent, name) {
      super(parent);
      this.name = name;

      // 设置快捷方法
      this.extend(["loader", "options"]);
    }

    // 修改该rule
    tap(f) {
      this.options(f(this.get("options")));
      return this;
    }

    // 合并
    merge(obj, omit = []) {
      if (!omit.includes("loader") && "loader" in obj) {
        this.loader(obj.loader);
      }

      if (!omit.includes("options") && "options" in obj) {
        this.options(merge(this.store.get("options") || {}, obj.options));
      }

      return super.merge(obj, [...omit, "loader", "options"]);
    }

    // 生成use的config对象
    toConfig() {
      const config = this.clean(this.entries() || {});

      Object.defineProperties(config, {
        __useName: { value: this.name },
        __ruleNames: { value: this.parent && this.parent.names },
        __ruleTypes: { value: this.parent && this.parent.ruleTypes }
      });

      return config;
    }
  }
);
