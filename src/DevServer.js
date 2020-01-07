const ChainedMap = require("./ChainedMap");
const ChainedSet = require("./ChainedSet");

module.exports = class extends ChainedMap {
  constructor(parent) {
    super(parent);

    // 允许的host
    this.allowedHosts = new ChainedSet(this);

    // 生成快捷方法
    this.extend([
      "after",
      "before",
      "bonjour",
      "clientLogLevel",
      "color",
      "compress",
      "contentBase",
      "disableHostCheck",
      "filename",
      "headers",
      "historyApiFallback",
      "host",
      "hot",
      "hotOnly",
      "http2",
      "https",
      "index",
      "info",
      "inline",
      "lazy",
      "mimeTypes",
      "noInfo",
      "open",
      "openPage",
      "overlay",
      "pfx",
      "pfxPassphrase",
      "port",
      "proxy",
      "progress",
      "public",
      "publicPath",
      "quiet",
      "setup",
      "socket",
      "staticOptions",
      "stats",
      "stdin",
      "useLocalIp",
      "watchContentBase",
      "watchOptions",
      "writeToDisk"
    ]);
  }

  // 生成DevServer的config对象
  toConfig() {
    return this.clean({
      allowedHosts: this.allowedHosts.values(),
      ...(this.entries() || {})
    });
  }

  // 合并选项
  merge(obj, omit = []) {
    if (!omit.includes("allowedHosts") && "allowedHosts" in obj) {
      this.allowedHosts.merge(obj.allowedHosts);
    }

    return super.merge(obj, ["allowedHosts"]);
  }
};
