import type { Schema, Attribute } from '@strapi/strapi';

export interface FaqFaq extends Schema.Component {
  collectionName: 'components_faq_faqs';
  info: {
    displayName: 'FAQ';
    icon: 'question';
    description: '';
  };
  attributes: {
    domanda: Attribute.Text;
    risposta: Attribute.Text;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'faq.faq': FaqFaq;
    }
  }
}
