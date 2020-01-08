const ChainedMap = require("./ChainedMap");
const ChainedSet = require("./ChainedSet");
const Orderable = require("./Orderable");
const Use = require("./Use");

const Rule = Orderable(
  class extends ChainedMap {
    constructor(parent, name, ruleType = "rule") {
      super(parent);

      this.name = name;
      this.names = [];
      this.ruleType = ruleType;
      this.ruleTypes = [];

      let rule = this;
      while (rule instanceof Rule) {
        this.names.unshift(rule.name);
        this.ruleTypes.unshift(rule.ruleType);
        rule = rule.parent;
      }

      this.uses = new ChainedMap(this);
      this.include = new ChainedSet(this);
      this.exclude = new ChainedSet(this);
      this.rules = new ChainedMap(this);
      this.oneOfs = new ChainedMap(this);

      // 生成快捷方法
      this.extend([
        "enforce",
        "issuer",
        "parser",
        "resource",
        "resourceQuery",
        "sideEffects",
        "test",
        "type"
      ]);
    }

    // 生成具名use
    use(name) {
      return this.uses.getOrCompute(name, () => new Use(this, name));
    }

    // 设置具名rule
    rule(name) {
      return this.rules.getOrCompute(name, () => new Rule(this, name, "rule"));
    }

    // 设置具名oneof
    oneOf(name) {
      return this.oneOfs.getOrCompute(
        name,
        () => new Rule(this, name, "oneOf")
      );
    }

    // 设置pre
    pre() {
      return this.enforce("pre");
    }

    // 设置post
    post() {
      return this.enforce("post");
    }

    // 生成config
    toConfig() {
      const config = this.clean(
        Object.assign(this.entries() || {}, {
          include: this.include.values(),
          exclude: this.exclude.values(),
          rules: this.rules.values().map(rule => rule.toConfig()),
          oneOf: this.oneOfs.values().map(oneOf => oneOf.toConfig()),
          use: this.uses.values().map(use => use.toConfig())
        })
      );

      Object.defineProperties(config, {
        __ruleNames: { value: this.names },
        __ruleTypes: { value: this.ruleTypes }
      });

      return config;
    }

    // 合并
    merge(obj, omit = []) {
      if (!omit.includes("include") && "include" in obj) {
        this.include.merge(obj.include);
      }

      if (!omit.includes("exclude") && "exclude" in obj) {
        this.exclude.merge(obj.exclude);
      }

      if (!omit.includes("use") && "use" in obj) {
        Object.keys(obj.use).forEach(name =>
          this.use(name).merge(obj.use[name])
        );
      }

      if (!omit.includes("rules") && "rules" in obj) {
        Object.keys(obj.rules).forEach(name =>
          this.rule(name).merge(obj.rules[name])
        );
      }

      if (!omit.includes("oneOf") && "oneOf" in obj) {
        Object.keys(obj.oneOf).forEach(name =>
          this.oneOf(name).merge(obj.oneOf[name])
        );
      }

      if (!omit.includes("test") && "test" in obj) {
        this.test(
          obj.test instanceof RegExp || typeof obj.test === "function"
            ? obj.test
            : new RegExp(obj.test)
        );
      }

      return super.merge(obj, [
        ...omit,
        "include",
        "exclude",
        "use",
        "rules",
        "oneOf",
        "test"
      ]);
    }
  }
);

module.exports = Rule;
