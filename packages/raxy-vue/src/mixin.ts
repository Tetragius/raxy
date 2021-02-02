export default function Raxy(Vue: any) {
  const version = Number(Vue.version.split(".")[0]);

  if (version >= 2) {
    Vue.mixin({
      beforeCreate: raxyInit,
      created: raxyOn,
      deactivated: raxyOff
    });
  }

  function raxyInit() {
    const options = this.$options;

    if (options.raxy) {
      this.$raxy = options.raxy;
    } else if (options.parent && options.parent.$raxy) {
      this.$raxy = options.parent.$raxy;
    }
  }

  function raxyOn() {
    if (this.$raxy && this.$raxy.filter) {
      Object.assign(this.$data, this.$raxy.filter(this.$raxy.store));
      const callback = (state) => Object.assign(this.$data, state);
      this.$raxyConnector = this.$raxy.connect(callback, this.$raxy.filter);
      this.$raxyConnector.mountCallback();
    }
  }

  function raxyOff() {
    if (this.$raxy && this.$raxyConnector) {
      this.$raxyConnector.unmountCallback();
    }
  }
}
