[![Build Status](https://travis-ci.org/Tetragius/raxy.svg?branch=master)](https://travis-ci.org/Tetragius/raxy) [![npm version](https://badge.fury.io/js/%40tetragius%2Fraxy.svg)](https://badge.fury.io/js/%40tetragius%2Fraxy) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![IE](https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png) | ![Opera](https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![Opera](https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png) |
--- | --- | --- | --- | --- |
49+ ✔ | 18+ ✔ | 18+ ✔ | 36+ ✔ | 10+ ✔ | 

# Raxy

Простой менеджер состояний, для реализации подхода [SSOT](https://en.wikipedia.org/wiki/Single_source_of_truth), может применться [React](https://reactjs.org/) или [Vue](https://vuejs.org/)

Работает на основе Proxy API, во всех поддерживающих его брузерах.

Основное отличие от большинства менеджеров состояний - работа с хранилищем, как с обычным объектом, без использования сложных механизмов событий и селекторов.

Поддерживает отладку [`Redux dev-tools`](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=ru)

---
Оглавление:
- [Установка](#demo)
- [Демонстрация](#simple-usage)
- [API](#installation)
- Фреймворки
  - [React](https://github.com/Tetragius/raxy/tree/master/packages/raxy-react)
  - [Vue](https://github.com/Tetragius/raxy/tree/master/packages/raxy-vue)


# Установка

```sh
npm install --save @tetragius/raxy
```

## Для React

```sh
npm install --save @tetragius/raxy-react
```

## Для Vue

```sh
npm install --save @tetragius/raxy @tetragius/raxy-vue
```

# Демонстрация

- React
  - [DEMO: Todo list](https://codesandbox.io/s/raxy-demo-3mur7)
  - [DEMO: Todo list - complex](https://codesandbox.io/s/raxy-demo-complex-5syo0)
- Vue
  - [DEMO: Todo list - complex](https://codesandbox.io/s/raxy-demo-complex-5syo0)


# API

## raxy

```javascript
raxy(initState)
```

Возвращает объект с полями:
- `store` - проксированое хранилище
- `transaction` - метод для проведения транзакций
- `subscribe` - метод для подписки на события изменения хранилища (`update`, `transactionstart`, `transactionend`)
- `unsubscribe` - метод отмены подписки на события обновления хранилища

## transaction

```typescript
transaction<Store>(name: string, async (store: Store)) => boolean
```

Создает транзакцию для изменения нескольких значений хранилища, в случае если транзакция не успешна (если фунция возвращает `false`) - все действия будут отменены.

Транзакции ставятся в очередь и выполняются строго в порядке вызова.

Транзакции являются `Promise`-функциями и могут быть объединены в цепочку.

```typescript
transaction('transaction A', updater_A).then(transaction('transaction B', updater_B));

// или

await transaction('transaction A', updater_A);
await transaction('transaction B', updater_B);
```

Успешно выполненная транзакция возвращает - `true`.

Имя транзакции носит чисто иннформативный характер и может быть выбрано на усмотрение разработчика.

## subscribe/unsobscribe

```typescript
export interface IDetail<S> {
    name?: string;
    complete?: string;
    store: S;
}
subscribe(on: 'update'|'transactionstart'|'transactionend', (event: CustomEvent<IDetail>) => void)
```

Подписывается или отменяет подписку на обновление хранилища. 

Объект `event` содержит поле `detail` интерфейса `IDetail`.

- `update` - Любое обновление хранилища.
- `transactionstart` - Транзакция начата.
- `transactionend` - Транзакция завершена.

Для `transactionstart` и `transactionend` задаются дополнительно поля:
- `name` - имя транзакции
- `complete` - статус транзакции (`true` - завершена)

## connect

```typescript
connect: <Store = any, State = any>(instanse: IRaxy<Store>, updateCallback: (state: State) => void, filter?: Filter<Store, State>, options?: IConnectorOptions<any> & Options<State>) => IConnector<Store, State>;

type Connector<S> = <State = any>(updateCallback: (state: State) => void, filter?: Filter<S, State>, options?: IConnectorOptions & Options<State>) => IConnector<S, State>;
```

Создает подключение к хранилищу

- `instanse` - экземпляр созданный вызовом метода `raxy`
- `updateCallback` - функция которая будет вызываться каждый раз при изменении состояния
- `filter` - функция которая определяет при изменении каких частей хранилища вызывать `updateCallback`
- `options` - набор опций для оптимизации работы

```typescript
type Options<State = any> = {
    [P in keyof State]?: {
        ignoreTimeStamp?: boolean;
    };
};
interface IConnectorOptions<T = any> {
    elementRef?: RefObj<T>;
}
```

Пример опций

```typescript
connect(
    (store) => ({
      todos: store.todos, /
      length: store.todos.length 
    }),
    {
      todos: { ignoreTimeStamp: true } // рендер не учитывает изменения состояния дочерних элеиентов
      elementRef: element // ссылка на DOM ноду для оптимизации вызова updateCallback
    }
  );
```

При указании `elementRef` - автоматически отключает проверку изменния состояния хранилища, если указанный элемент не виден на странице или в любом вьюпорте.

Метод `connect` возвращает объект с полями

- `state` - ссылка на состояние возвращаемое методом `filter`
- `store` - ссылка на `store`
- `transaction` - метод для лсуществления транзакций
- `mountCallback` - метод который следует вызвать для включения подписки
- `unmountCallback` - метод который следует вызвать для отключения подписки

## createConnector

```typescript
createConnector: <Store = any>(initStore: Store) => IRaxyWithConnector<Store>;

interface IRaxyWithConnector<S> extends IRaxy<S> {
    connect: Connector<S>;
}
```

Создает типизированый экземпляр функции `connect` может быть использован вместо вызова `raxy`

## logger

```typescript
logger: (subscribe: IRaxy<any>['subscribe']) => void;
```

Выводит в консоль лог событий `update`, `transactionstart`, `transactionend`;

## connectDevTools

```typescript
connectDevTools: (instanse: IRaxy<any>) => void;
```

Активирует поддержку [`Redux dev-tools`](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=ru)