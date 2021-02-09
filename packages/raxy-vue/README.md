[![npm version](https://badge.fury.io/js/%40tetragius%2Fraxy-vue.svg)](https://badge.fury.io/js/%40tetragius%2Fraxy-vue)

[Main](https://github.com/Tetragius/raxy)

# Demo
   - [DEMO](https://codesandbox.io/s/raxy-vue-example-e74vn)
   - [DEMO: TODO list](https://codesandbox.io/s/raxy-vue-example-xsrtu)


# API

## Raxy

`./store`
```tsx
import { createConnector, connectDevTools, logger } from "@tetragius/raxy";

const initState = { countA: 1, countB: 3 };

export const instanse = createConnector(initState);

connectDevTools(instanse);
logger(instanse.subscribe);

```

`index.js`
```tsx
import Vue from "vue";
import App from "./App.vue";
import Raxy from "@tetragius/raxy-vue";
import { instanse } from "./store";

Vue.config.productionTip = false;

Vue.use(Raxy); // Connecting Raxy

new Vue({
  raxy: instanse, // Pass the IRaxy instance
  render: (h) => h(App)
}).$mount("#app");

```

`Component A`
```tsx
<template>
  <div>
    <h3>Counter A</h3>
    <p>{{ countA }}</p>
  </div>
</template>

<script>
export default {
  data: () => ({
    countA: 0,
  }),
  beforeCreate() {
    this.$raxy.filter = (store) => ({ // A function that determines when to update a component
      countA: store.countA,
    });
  },
};
</script>
```

```tsx
<template>
  <div>
    <button @click="incrementA">increment A</button>
    <button @click="incrementB">increment B</button>
  </div>
</template>

<script>
export default {
  methods: {
    incrementA() {
      this.$raxy.store.countA = this.$raxy.store.countA + 1; // Updating the store value
    },
    incrementB() {
      this.$raxy.store.countB = this.$raxy.store.countB + 1;
    },
  },
};
</script>
```
