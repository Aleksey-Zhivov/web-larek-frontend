import './scss/styles.scss';

import { AppStatus } from './components/AppData';
import { EventEmitter } from './components/base/events';
import { ensureElement } from './utils/utils';

const events = new EventEmitter();

events.onAll(({eventName, data}) => {
    console.log(eventName, data);
})

//Шаблоны
const successTamplate = ensureElement<HTMLTemplateElement>('#success')
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog')
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview')
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket')
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket')
const orderTemplate = ensureElement<HTMLTemplateElement>('#order')
const contsctsTemplate = ensureElement<HTMLTemplateElement>('#contacts')

const appStatus = new AppStatus({}, events)