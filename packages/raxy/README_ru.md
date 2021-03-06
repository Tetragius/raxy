[![Build Status](https://travis-ci.org/Tetragius/raxy.svg?branch=master)](https://travis-ci.org/Tetragius/raxy) [![npm version](https://badge.fury.io/js/%40tetragius%2Fraxy.svg)](https://badge.fury.io/js/%40tetragius%2Fraxy) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![IE](https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png) | ![Opera](https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![Opera](https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png) |
--- | --- | --- | --- | --- |
49+ ✔ | 18+ ✔ | 18+ ✔ | 36+ ✔ | 10+ ✔ | 


В **IE** может работать с использованием полифила [`@tetragius/raxy-polyfill`](https://github.com/Tetragius/raxy/tree/master/packages/raxy-polyfill)

# Raxy

Простой менеджер состояний, для реализации подхода [SSOT](https://en.wikipedia.org/wiki/Single_source_of_truth), может применяться c [React](https://reactjs.org/) или [Vue](https://vuejs.org/)

Работает на основе Proxy API, во всех поддерживающих его браузерах.
 
Основное отличие от большинства менеджеров состояний - работа с хранилищем, как с обычным объектом, без использования сложных механизмов событий и селекторов.

Поддерживает отладку [`Redux dev-tools`](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=ru)

---
Оглавление:
- [Установка](#установка)
- [Демонстрация](#демонстрация)
- [API](#api)
- [Polyfill](#polyfill)
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
  - [DEMO: Todo list - long](https://codesandbox.io/s/raxy-demo-longlist-cl837)
- Vue
  - [DEMO](https://codesandbox.io/s/raxy-vue-example-e74vn)
  - [DEMO: TODO list](https://codesandbox.io/s/raxy-vue-example-xsrtu)


# API

## raxy

```javascript
raxy(initState)
```

Возвращает объект с полями:
- `store` - проксированное хранилище
- `transaction` - метод для проведения транзакций
- `subscribe` - метод для подписки на события изменения хранилища (`update`, `transactionstart`, `transactionend`)
- `unsubscribe` - метод отмены подписки на события обновления хранилища
- `transactions` - очередь транзакций

Каждая транзакция в очереди имеет метод `abort`, который прерывает транзакцию и переходит к следующей.

## transaction

```typescript
transaction<Store>(name: string, async (store: Store, progress: (n: number) => void)) => boolean
```

Создает транзакцию для изменения нескольких значений хранилища, в случае если транзакция не успешна (если функция возвращает `false`) - все действия будут отменены.

Транзакции ставятся в очередь и выполняются строго в порядке вызова.

Транзакции являются `Promise`-функциями и могут быть объединены в цепочку.

```typescript
transaction('transaction A', updater_A).then(transaction('transaction B', updater_B));

// или

await transaction('transaction A', updater_A);
await transaction('transaction B', updater_B);
```

Успешно выполненная транзакция возвращает - `true`.

Имя транзакции носит чисто информативный  характер и может быть выбрано на усмотрение разработчика.

Метод `progress` - принимает число и задает прогресс выполнения, также вызывает событие `transactionprogress`

Метод `progress` содержит:
 - поле `progress.target` с типом `ITransaction`
 - поле `progress.prev` с типом `ITransaction` - результат предыдущей транзакции

```typescript
interface ITransaction<S> {
    name: string; // имя транзакции
    pending: boolean; // статус выполнения
    aborted?: any; // причина прерывания
    progress: number; // этап выполнения
    rollback: Rollback[]; // массив обратных операций
    store: S; // ссылка на хранилище
    updater: Updater<S>; // метод обновления хранилища
    resolve?: Resolver<S> // массив обратных операций
    abort: Abort; // метод для завершения транзакции - завпускает процедуру отката
}
```

## subscribe/unsubscribe

```typescript
export interface IDetail<S> {
    name?: string;
    complete?: string;
    store: S;
}
subscribe(on: 'update'|'transactionstart'|'transactionend'|'addtransaction'|'transactionaborted'|'transactionprogress'|'connected', (event: CustomEvent<IDetail>) => void)
```

Подписывается или отменяет подписку на обновление хранилища. 

Объект `event` содержит поле `detail` интерфейса `IDetail`.

- `update` - Любое обновление хранилища.
- `transactionstart` - Транзакция начата.
- `transactionend` - Транзакция завершена.
- `addtransaction` - Транзакция добавлена в очередь
- `transactionaborted` - Транзакция отменена
- `transactionprogress` - Прогресс выполнения транзакции
- `connected`- К хранилищу подключен новый объект

Для `transactionstart` и `transactionend` задаются дополнительно поля:
- `name` - имя транзакции
- `complete` - статус транзакции (`true` - завершена)

Для `transactionaborted` задаются дополнительно поля:
- `aborted` - {status: any} - объект описывающий причину отмены

Для `transactionaborted` задаются дополнительно поля:
- `progress` - Процент выполнения, задается пользователем - тип число

Для `connected` задаются дополнительно поля:
- `value` - Ссылка на новое подключенное хранилище

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
- `transaction` - метод для осуществления транзакций
- `mountCallback` - метод который следует вызвать для включения подписки
- `unmountCallback` - метод который следует вызвать для отключения подписки

## createConnector

```typescript
createConnector: <Store = any>(initStore: Store) => IRaxyWithConnector<Store>;

interface IRaxyWithConnector<S> extends IRaxy<S> {
    connect: Connector<S>;
}
```

Создает типизированный экземпляр функции `connect` может быть использован вместо вызова `raxy`

## logger

```typescript
logger: (subscribe: IRaxy<any>['subscribe']) => void;
```

Выводит в консоль лог событий `update`, `transactionstart`, `transactionend`, `addtransaction`, `transactionaborted`, `transactionprogress`, `connected`;

## connectDevTools

```typescript
connectDevTools: (instanse: IRaxy<any>) => void;
```

Активирует поддержку [`Redux dev-tools`](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=ru)

## Polyfill

```typescript
// Добавьте в начало первого файла в сборке
import "@babel/polyfill";
import '@tetragius/raxy-polyfill';
```

В IE есть ряд ограничений
- Не корректно работают мутации - изменения должны быть имутабельны
- Надо подписываться на изменяемое свойство, так как не работает подписка на оюъект