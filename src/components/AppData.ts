import { CardId, FormErrors, IAppStatus, ICard, IOrder, IOrdersContacts, IOrdersDelivery } from '../types/index';
import { Model } from './base/Model';
import _ from "lodash";

export class Card extends Model<ICard> {
    id: CardId;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}

export class AppStatus extends Model<IAppStatus> {
    basket: Card[] = [];
    cards: ICard[];
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

    addItemToBasket(item: Card) {
        this.basket.push(item);
    }

    deleteItemFromBasket(item: Card) {
        this.basket = this.basket.filter(elem => elem != item)
        this.emitChanges('count:changed', this.basket)
    }

    setCards(items: ICard[]) {
        this.cards = items.map(item => new Card(item, this.events))
        this.emitChanges('cards:changed', {cards: this.cards})
    }

    setPreview(item: Card) {
        this.preview = item.id;
        this.emitChanges('preview:changed', item)
    }

    setOrdersDelivery(field: keyof IOrdersDelivery, value: string) {
        this.order[field] = value;
        this.emitChanges('ordersDelivery:changed', this.basket)
    }

    setOrdersContacts(field: keyof IOrdersContacts, value: string) {
        this.order[field] = value;
        this.emitChanges('ordersContacts:changed', this.basket)
    }

    checkOrdersValidation() {

    }
}