import { CardId, FormErrors, IAppStatus, ICard, IOrder, IOrdersContacts, IOrdersDelivery, Payment } from '../types/index';
import { Model } from './base/Model';
import _ from "lodash";

export type CatalogChangeEvent = {
    catalog: CardItem[]
};

export class CardItem extends Model<ICard> {
    id: CardId;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}

export class AppStatus extends Model<IAppStatus> {
    basket: CardItem[] = [];
    cards: CardItem[];
    order: IOrder = {
        payment: '',
        email: '',
        phone: '',
        address: '',
        total: 0,
        items: [],
    }
    preview: string | null;
    formErrors: FormErrors = {}

    clearBasket() {
        this.basket = [];
        this.emitChanges('basket:changed', this.basket)
    }

    addItemToBasket(item: CardItem) {
        this.basket.push(item);
    }

    deleteItemFromBasket(item: CardItem) {
        this.basket = this.basket.filter(elem => elem != item)
        this.emitChanges('count:changed', this.basket)
    }

    setCards(items: ICard[]) {
        this.cards = items.map(item => new CardItem(item, this.events))
        this.emitChanges('cards:changed', {cards: this.cards})
    }

    setPreview(item: CardItem) {
        this.preview = item.id;
        this.emitChanges('preview:changed', item)
    }

    setPayment(method: Payment) {
        this.order.payment = method;
        this.checkDeliveryValidation();
    }

    setOrdersDelivery(field: keyof IOrdersDelivery, value: string) {
        this.checkDeliveryValidation() ? this.order[field] = value : false;
        this.emitChanges('ordersDelivery:changed', this.basket)
    }

    setOrdersContacts(field: keyof IOrdersContacts, value: string) {
        this.checkContactsValidation() ? this.order[field] = value : false;
        this.emitChanges('ordersContacts:changed', this.basket)
    }

    checkDeliveryValidation() {
        const error: typeof this.formErrors = {};
        !this.order.address ? error.address = 'Введите адрес' : false;
        !this.order.payment ? error.payment = 'Выберите спопосб оплаты' : false;

        this.formErrors = error;
        this.events.emit('deliveryForm:changed', this.formErrors)
        return Object.keys(error).length === 0;
    }

    checkContactsValidation() {
        const error: typeof this.formErrors = {};
        !this.order.email ? error.email = 'Введите email' : false;
        !this.order.phone ? error.phone = 'Введите номер телефона' : false;

        this.formErrors = error;
        this.events.emit('contactsForm:changed', this.formErrors)
        return Object.keys(error).length === 0;
    }
}