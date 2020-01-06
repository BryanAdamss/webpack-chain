const ChainedMap = require("./ChainedMap");
const Orderable = require("./Orderable");

// plugin是有顺序的
module.exports = Orderable(
  class extends ChainedMap {
    constructor(parent, name, type = "plugin") {
      super(parent);

      this.name = name;
      this.type = type;

      // 生成快捷方法init
      this.extend(["init"]);

      // 设置this.init的值为一个函数，此函数主要生成Plugin的实例
      this.init((Plugin, args = []) => {
        if (typeof Plugin === "function") {
          return new Plugin(...args);
        }
        return Plugin;
      });
    }

    use(plugin, args = []) {
      return this.set("plugin", plugin).set("args", args);
    }

    // 修改plugin实例的参数
    tap(f) {
      this.set("args", f(this.get("args") || []));
      return this;
    }

    // 合并
    merge(obj, omit = []) {
      if ("plugin" in obj) {
        this.set("plugin", obj.plugin);
      }

      if ("args" in obj) {
        this.set("args", obj.args);
      }

      return super.merge(obj, [...omit, "args", "plugin"]);
    }

    // 生成config
    toConfig() {
      const init = this.get("init"); // 取到constructor中设置的init方法
      let plugin = this.get("plugin"); // 拿到保存的plugin
      const args = this.get("args"); // 参数
      let pluginPath = null;

      // 支持使用插件的路径而不是插件本身，允许在插件或web包配置不被使用的情况下不执行昂贵的require（）s
      // Support using the path to a plugin rather than the plugin itself,
      // allowing expensive require()s to be skipped in cases where the plugin
      // or webpack configuration won't end up being used.
      // 插件路径
      if (typeof plugin === "string") {
        pluginPath = plugin;
        // eslint-disable-next-line global-require, import/no-dynamic-require
        plugin = require(pluginPath);
      }

      const constructorName = plugin.__expression
        ? `(${plugin.__expression})`
        : plugin.name;

      // 初始化plugin
      const config = init(plugin, args);

      Object.defineProperties(config, {
        __pluginName: { value: this.name },
        __pluginType: { value: this.type },
        __pluginArgs: { value: args },
        __pluginConstructorName: { value: constructorName },
        __pluginPath: { value: pluginPath }
      });

      return config;
    }
  }
);
