import './scss/styles.scss';

import { AppStatus, CardItem, CatalogChangeEvent } from './components/AppData';
import { EventEmitter } from './components/base/events';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Page } from './components/Page';
import { Card } from './components/Card';
import { LarekApi } from './components/LarekApi';
import { API_URL, CDN_URL } from './utils/constants';
import { Modal } from './components/common/Modal';
import { Basket } from './components/Basket';

const events = new EventEmitter();
const api = new LarekApi(CDN_URL, API_URL);

events.onAll(({eventName, data}) => {
    console.log(eventName, data);
})

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');

// Модель данных приложения
const appStatus = new AppStatus({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Изменились элементы каталога
events.on<CatalogChangeEvent>('items:changed', () => {
  page.catalog = appStatus.catalog.map(item => {
    const card = new Card(cloneTemplate(cardCatalogTemplate), {
      onClick: () => events.emit('card:select', item)
    });
    return card.render({
      category: item.category,
      title: item.title,
      image: item.image,
      price: item.price,
    })
  });
});

//Выбор товара
events.on('card:select', (item: CardItem) => {
  appStatus.setPreview(item);
});

//Открытие попапа с превью
events.on('preview:changed', (item: CardItem) => {
  const card = new Card(cloneTemplate(cardPreviewTemplate), {
    onClick: () => events.emit('card:toggle', item)
  })

  modal.render({
    content: card.render({
      category: item.category,
      title: item.title,
      image: item.image,
      description: item.description,
      price: item.price,
    })
  });
});

//Проверка нахождения товара в корзине
events.on('item:check', (item: CardItem) => {
  modal.close();
  (appStatus.basket.indexOf(item) < 0) ?
  events.emit('item:add', item) :
  events.emit('item:delete', item);
});

//Добавление товара в заказ
events.on('item:add', (item: CardItem) => {
  appStatus.addItemToBasket(item);
})

//Удаление товара из заказа
events.on('item:delete', (item: CardItem) => {
  appStatus.deleteItemFromBasket(item);
})

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
  page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
  page.locked = false;
});


//Получение списка карточек
api.getCardsList()
	.then(appStatus.setCards.bind(appStatus))
	.catch((err) => {
		console.error(err);
});