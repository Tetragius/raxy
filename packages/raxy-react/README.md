
[Подробное описание](https://github.com/Tetragius/raxy)

# Демонстрация
  - [DEMO: Todo list](https://codesandbox.io/s/raxy-demo-3mur7)
  - [DEMO: Todo list - complex](https://codesandbox.io/s/raxy-demo-complex-5syo0)


# API

## Raxy

```tsx
import React from "react";
import { Raxy } from "@tetragius/raxy-react";
import instanse from "./store"; // экземпляр IRaxy

export default function App() {
  return (
    <Raxy value={instanse}>
      {...}
    </Raxy>
  );
}
```

Провайдер для использование хука `useRaxy`

## useRaxy

```typescript
type Filter<Store = typeof context, State = any> = (sotre: Store) => State;

useRaxy<Store, State>(filter: Filter<Store, State>, options?): { state: State, store: Store, transaction: Transaction<Store> }
```

Создает подключение к хранилищу

- `filter` - функция которая определяет при изменении каких частей хранилища вызывать перерисовку компонента
- `options` - набор опций для оптимизации работы

```typescript
type Options<State = any> = {
    [P in keyof State]?: {
        ignoreTimeStamp?: boolean;
    };
};
interface IConnectorOptions<T = any> {
    elementRef?: React.RefObj<T>;
}
```

Пример опций

```typescript
useRaxy(
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

## raxyReact

```typescript
interface IRaxyWithHook<S> extends IRaxy<S> {
    useRaxy: Hook<S>;
}
raxyReact: <Store = any>(initStore: Store) => IRaxyWithHook<Store>;
```
Создает типизированый экземпляр функции `useRaxy` может быть использован вместо вызова `raxy`