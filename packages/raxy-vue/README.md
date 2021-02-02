
[Подробное описание](https://github.com/Tetragius/raxy)

# Демонстрация
   - [DEMO: Todo list - complex](https://codesandbox.io/s/raxy-demo-complex-5syo0)


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

Vue.use(Raxy); // Подключаем Raxy

new Vue({
  raxy: instanse, // Передаем экземпляр IRaxy
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
    this.$raxy.filter = (store) => ({ // Функция определяющая, когда обновлять компонет
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
      this.$raxy.store.countA = this.$raxy.store.countA + 1; // Обновляем значение хранилища
    },
    incrementB() {
      this.$raxy.store.countB = this.$raxy.store.countB + 1;
    },
  },
};
</script>
```