const ChainedMap = require("./ChainedMap");
const Plugin = require("./Plugin");

module.exports = class extends ChainedMap {
  constructor(parent) {
    super(parent);

    // 保存minimizer实例
    this.minimizers = new ChainedMap(this);

    // 生成快捷方法
    this.extend([
      "concatenateModules",
      "flagIncludedChunks",
      "mergeDuplicateChunks",
      "minimize",
      "namedChunks",
      "namedModules",
      "nodeEnv",
      "noEmitOnErrors",
      "occurrenceOrder",
      "portableRecords",
      "providedExports",
      "removeAvailableModules",
      "removeEmptyChunks",
      "runtimeChunk",
      "sideEffects",
      "splitChunks",
      "usedExports"
    ]);
  }

  // 生成optimization.minimizer
  minimizer(name) {
    return this.minimizers.getOrCompute(
      name,
      () => new Plugin(this, name, "optimization.minimizer")
    );
  }

  // 生成config
  toConfig() {
    return this.clean(
      Object.assign(this.entries() || {}, {
        minimizer: this.minimizers.values().map(plugin => plugin.toConfig())
      })
    );
  }

  // 合并
  merge(obj, omit = []) {
    if (!omit.includes("minimizer") && "minimizer" in obj) {
      Object.keys(obj.minimizer).forEach(name =>
        this.minimizer(name).merge(obj.minimizer[name])
      );
    }

    return super.merge(obj, [...omit, "minimizer"]);
  }
};
