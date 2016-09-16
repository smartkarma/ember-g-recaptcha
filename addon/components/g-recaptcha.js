import Ember from 'ember';
import Configuration from '../configuration';

export default Ember.Component.extend({

  classNames: ['g-recaptcha'],

  sitekey: Configuration.siteKey,

  tabindex: Ember.computed.alias('tabIndex'),

  renderReCaptcha() {
    if (Ember.isNone(window.grecaptcha)) {
      this.renderTimer = Ember.run.later(() => {
        this.renderReCaptcha();
      }, 500);
    } else {
      this.renderTimer = null;
      let container = this.$()[0];
      let properties = this.getProperties(
        'sitekey',
        'theme',
        'type',
        'size',
        'tabindex'
      );
      let parameters = Ember.merge(properties, {
        callback: this.get('successCallback').bind(this),
        'expired-callback': this.get('expiredCallback').bind(this)
      });
      let widgetId = window.grecaptcha.render(container, parameters);
      this.set('widgetId', widgetId);
      this.set('ref', this);
    }
  },

  resetReCaptcha() {
    if (Ember.isPresent(this.get('widgetId'))) {
      window.grecaptcha.reset(this.get('widgetId'));
    }
  },

  successCallback(reCaptchaResponse) {
    let action = this.get('onSuccess');
    if (Ember.isPresent(action)) {
      action(reCaptchaResponse);
    }
  },

  expiredCallback() {
    let action = this.get('onExpired');
    if (Ember.isPresent(action)) {
      action();
    } else {
      this.resetReCaptcha();
    }
  },


  // Lifecycle Hooks

  didInsertElement() {
    this._super(...arguments);
    this.renderTimer = Ember.run.next(() => {
      this.renderReCaptcha();
    });
  },

  willDestroyElement() {
    if (this.renderTimer) {
      Ember.run.cancel(this.renderTimer);
    }
  }

});
