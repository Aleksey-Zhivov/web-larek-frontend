# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/styles/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```ts
npm install
npm run start
```

или

```ts
yarn
yarn start
```
## Сборка

```ts
npm run build
```

или

```ts
yarn build
```

## Архитектура
![Схема архитектуры проекта](./src/images/architectures_schema.png)

## Базовый код
### 1. Класс EventEmitter
Реализует паттерн «Наблюдатель» и позволяет подписываться на события и уведомлять подписчиков о наступлении события.
Класс имеет методы `on` ,  `off` ,  `emit`  — для подписки на событие, отписки от события и уведомления подписчиков о наступлении события соответственно.
Дополнительно реализованы методы  `onAll` и  `offAll`  — для подписки на все события и сброса всех подписчиков.

### 2. Класс Api
Данный класс осуществляет работу с базовыми запросами к серверу (GET, POST, PUT, DELETE) и занимается обработкой ответов, полученных от сервера.
Класс имеет методы: 
- `get` и `post` - для выполнения самх запросов к серверу, 
- `handleRespons` - для обработки ответа сервера, его парсинга и обработки ошибок.

### 3. Класс Component
Базовый класс, который наследуется всеми компонентами - страница, корзина, карточки товаров, модальные окна. Назначение - создание HTML элементов и управление их свойствами.

В состав класса входят методы:
- `toggleClass` - для переключения класса конкретного DOM-элемента,
- `setText` - для установки текста в свойство textContent конкретного DOM-элемента,
- `setDisabled` - для "отключения" переданного DOM-элемента,
- `setHidden` - для скрытия конкретного DOM-элемента,
- `setVisible` - для показа конкретного DOM-элемента,
- `setImage` - для установки изображения (src) и альтернативного текста (alt) для конкретного DOM-элемента,
- `render` - для генерации компонента и "отрисовки" его в разметке.

### 4. Класс Model
Базовый класс, предназначенный для создания модельных данных, используемых для управления данными приложения. Напрямую "общается" с EventEmitter, принимая в конструктор данные модели и аргумент `events`.

Включает в себя только один метод:
- `emitChanges` - для сообщения всем подписчикам о том, что модель изменилась. 

## Компоненты модели данных
### 1. Класс AppStatus
Класс необходим для хранения данных модели, а так же для передачи в конструкторы дочерних классов данных для отрисовки изменений.
Методы класса:
- `clearBasket` - для очистки данных корзины,
- `addItemToBasket` - для добавления конкретного товара в корзину,
- `deleteItemFromBasket` - для удаления конкретного товара из корзины,
- `setCard` - для отрисовки каталога товаров,
- `setPreview` - для открытия предпросмотра товара,
- `setOrderData` - для установки данных по заказу,
- `checkOrdersValidation` - для валидации формы заказа.

## Компоненты представления
Гипотетические классы:
- класс Basket - корзина,
- класс Card - карточка товара,
- класс Form - форма оформления заказа (поля ввода, валидация формы, сабмит),
- класс Modal - универсальное модальное окно,
- класс Success - отображает информационное сообщение об успешной покупке,
- класс Page - собирает на главную страницу корзину со счетчиком и товары.

## Ключевые типы данных
```ts
type CardId = string; //uuid?

//Интерфейсы базовых классов

export type EventName = string | RegExp;
export type Subscriber = Function;
export type EmitterEvent = {
    eventName: string,
    data: unknown
};

export interface IEvents {
    on<T extends object>(event: EventName, callback: (data: T) => void): void;
    emit<T extends object>(event: string, data?: T): void;
    trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void;
}

export type ApiListResponse<Type> = {
    total: number,
    items: Type[]
};

export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';


//Интерфейсы моделей данных
export interface IAppStatus {
    basket: string[],
    cards: ICard[],
    order: IOrder,
    preview: string | null,
}

//Интерфейсы компонентов представления

export interface ICard {
    id: CardId,
    description: string,
    image: string,
    title: string,
    category: string,
    price: number | null,
}

export interface IOrder {
    payment: string,
    email: string,
    phone: string,
    address: string,
    total: number | null,
    items: CardId[],
}

export interface IOrderSuccess {
    id: string, //uuid?
    total: number | null,
}

export interface ISuccess {
    image: string,
    title: string,
    description: string,
    total: number | null,
}

export interface IBasket {
    items: HTMLElement[];
    total: number;
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;
```