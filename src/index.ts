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
import { OrdersDelivery } from './components/OrdersDelivery';
import { OrdersContacts } from './components/OrdersContacts';
import { Success } from './components/Success';
import { IOrdersContacts, IOrdersDelivery } from './types';

const events = new EventEmitter();
const api = new LarekApi(CDN_URL, API_URL);

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const ordersDeliveryTemplate = ensureElement<HTMLTemplateElement>('#order');
const ordersContactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модель данных приложения
const appStatus = new AppStatus({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const ordersDelivery = new OrdersDelivery(cloneTemplate(ordersDeliveryTemplate), events, {
  onClick: (event) => {
    events.emit('payment:changed', event.target)
  }
});
const ordersContacts = new OrdersContacts(cloneTemplate(ordersContactsTemplate), events);

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
    });
  });
});

//Выбор товара
events.on('card:select', (item: CardItem) => {
  appStatus.setPreview(item);
});

//Открытие попапа с превью
events.on('preview:changed', (item: CardItem) => {
  const card = new Card(cloneTemplate(cardPreviewTemplate), {
    onClick: () => {
      events.emit('item:check', item);
      card.buttonText = appStatus.basket.indexOf(item) < 0 ? 
      'В корзину' : 
      'Убрать из корзины';
    }
  })

  modal.render({
    content: card.render({
      category: item.category,
      title: item.title,
      image: item.image,
      description: item.description,
      price: item.price,
      buttonText: appStatus.basket.indexOf(item) < 0 ? 
      'В корзину' : 
      'Убрать из корзины',
    })
  })
});

//Проверка нахождения товара в корзине
events.on('item:check', (item: CardItem) => {
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

//Изменение состояния заказа и счетчика
events.on('basket:changed', (items: CardItem[]) => {
  basket.items = items.map((item, count) => {
    const card = new Card(cloneTemplate(cardBasketTemplate), {
      onClick: () => {events.emit('item:delete', item)}
    });
    return card.render({
      title: item.title,
      price: item.price,
      count: (count++).toString(),
    });
  });
  let total = 0;
  items.forEach(item => {
    total = total + item.price;
  });
  basket.total = total;
  appStatus.order.total = total;
});

//Изменение счетчика
events.on('count:changed', () => {
  page.counter = appStatus.basket.length;
});

//Открытие корзины
events.on('basket:open', () => {
  modal.render({
    content: basket.render({})
  });
});

//Открытие формы доставки
events.on('order:open', () => {
  modal.render({
    content: ordersDelivery.render({
      payment: '',
      address: '',
      valid: false,
      errors: [],
    })
  });
  appStatus.order.items = appStatus.basket.map((item) => item.id);
});

//Изменение способа оплаты
events.on('payment:changed', (target: HTMLElement) => {
  if(!target.classList.contains('button_alt-active')) {
    appStatus.order.payment = 'online'
    console.log(appStatus.order)
  } else {
    appStatus.order.payment = 'cash'
    console.log(appStatus.order)
  }
});

//Изменения в поле ввода адреса
events.on(/^order\..*:change/, (data: { field: keyof IOrdersDelivery, value: string }) => {
  appStatus.setOrdersDelivery(data.field, data.value);
});

//Валидация формы ввода адреса
events.on('deliveryForm:changed', (errors: Partial<IOrdersDelivery>) => {
  const { payment, address } = errors;
  ordersDelivery.valid = !payment && !address;
  ordersDelivery.errors = Object.values({payment, address}).filter(i => !!i).join('; ');
});

//Валидация формы доставки выполнена
events.on('ordersDelivery:changed' , () => {
  ordersDelivery.valid = true;
  console.log(appStatus.order)
});

events.on('order:submit', () => {
  modal.render({
    content: ordersContacts.render({
      email: '',
      phone: '',
      valid: false,
      errors: [],
    })
  });
  appStatus.order.items = appStatus.basket.map((item) => item.id);
});

//Изменения в полях ввода контактов
events.on(/^contacts\..*:change/, (data: {field: keyof IOrdersContacts, value: string}) => {
  appStatus.setOrdersContacts(data.field, data.value)
})

//Валидация формы ввода контактов
events.on('contactsForm:changed', (errors: Partial<IOrdersContacts>) => {
  const { email, phone } = errors;
  ordersContacts.valid = !email && !phone;
  ordersContacts.errors = Object.values({email, phone}).filter(i => !!i).join('; ');
});

//Валидация формы контактов выполнена
events.on('ordersContacts:changed' , () => {
  ordersContacts.valid = true;
  console.log(appStatus.order)
});

//Отправка заказа на сервер
events.on('contacts:submit', () => {
  api.orderProducts(appStatus.order)
  .then(result => {
    appStatus.clearBasket();
    const success = new Success(cloneTemplate(successTemplate), {
      onClick: () => {
        modal.close();
      }
    });
    success.total = result.total.toString();
    console.log(result)
    modal.render({
      content: success.render({})
    });
  })
  .catch(error => {
      console.error(error);
  });
});

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