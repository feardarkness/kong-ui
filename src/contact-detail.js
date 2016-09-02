import {EventAggregator} from 'aurelia-event-aggregator';
import {ContactUpdated, ContactViewed} from './messages';
import {WebAPI} from './web-api';
import {areEqual} from './utility';



export class ContactDetail {
  static inject() { return [WebAPI, EventAggregator]; }

  constructor(api, ea) {
    this.api = api;
    this.ea = ea;
  }

// called before enterign the view
  activate(params, routeConfig) {
    this.routeConfig = routeConfig;

    return this.api.getContactDetails(params.id).then(contact => {
      this.contact = contact;
      this.routeConfig.navModel.setTitle(contact.firstName);
      this.originalContact = JSON.parse(JSON.stringify(contact));
      this.ea.publish(new ContactViewed(this.contact));
    });
  }

  get canSave() {
    return this.contact.firstName && this.contact.lastName && !this.api.isRequesting;
  }

  save() {
    this.api.saveContact(this.contact).then(contact => {
      this.contact = contact;
      this.routeConfig.navModel.setTitle(contact.firstName);
      this.originalContact = JSON.parse(JSON.stringify(contact));
      this.ea.publish(new ContactUpdated(this.contact));
    });
  }
// called before navigating away from current view
  canDeactivate() {
    if (!areEqual(this.originalContact, this.contact)) {
      let result = 'You have unsaved changes. Are you sure you wish to leave?';

      if(!result) {
        this.ea.publish(new ContactViewed(this.contact));
      }

      return result;
    }

    return true;
  }
}
