const ChainedMap = require("./ChainedMap");
const Rule = require("./Rule");

module.exports = class extends ChainedMap {
  constructor(parent) {
    super(parent);

    this.rules = new ChainedMap(this);
    this.defaultRules = new ChainedMap(this);

    // 生成快捷方法
    this.extend(["noParse", "strictExportPresence"]);
  }

  // 生成默认rule
  defaultRule(name) {
    return this.defaultRules.getOrCompute(
      name,
      () => new Rule(this, name, "defaultRule")
    );
  }

  // 生成一个新rule
  rule(name) {
    return this.rules.getOrCompute(name, () => new Rule(this, name, "rule"));
  }

  // 生成config
  toConfig() {
    return this.clean(
      Object.assign(this.entries() || {}, {
        defaultRules: this.defaultRules.values().map(r => r.toConfig()),
        rules: this.rules.values().map(r => r.toConfig())
      })
    );
  }

  // 合并
  merge(obj, omit = []) {
    if (!omit.includes("rule") && "rule" in obj) {
      Object.keys(obj.rule).forEach(name =>
        this.rule(name).merge(obj.rule[name])
      );
    }

    if (!omit.includes("defaultRule") && "defaultRule" in obj) {
      Object.keys(obj.defaultRule).forEach(name =>
        this.defaultRule(name).merge(obj.defaultRule[name])
      );
    }

    return super.merge(obj, ["rule", "defaultRule"]);
  }
};
