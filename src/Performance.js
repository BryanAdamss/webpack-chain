const ChainedMap = require("./ChainedMap");

module.exports = class extends ChainedMap {
  constructor(parent) {
    super(parent);

    // 生成快捷方法
    this.extend(["assetFilter", "hints", "maxAssetSize", "maxEntrypointSize"]);
  }
};
