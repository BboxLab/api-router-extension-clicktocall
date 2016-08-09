/*!
 * @brief Form management utilities
 *
 * Copyright (c) 2013, 2014 Bouygues Telecom
 *
 * The computer program contained herein contains proprietary
 * information which is the property of Bouygues Telecom.
 * The program may be used and/or copied only with the written
 * permission of Bouygues Telecom or in accordance with the
 * terms and conditions stipulated in the agreement/contract under
 * which the programs have been supplied.
 *
 * @author Stephane Carrez <stcarrez@bouyguestelecom.fr>
 */
/**
 * @brief A modal panel.
 */
$.extend($.fn, {
    /**
     * @brief Singleton of a modal
     * @param options the parameters caracterizing the modal
     * @returns the object modal
     */
    modal: function( options ) {
        // if nothing is selected, return nothing; can't chain anyway
        if (!this.length ) {
            if (options && options.debug && window.console) {
                console.warn( 'Nothing selected, can\'t validate, returning nothing.' );
            }
            return null;
        }

        var obj = $.data(this[0], 'modal');
        if (!obj) {
            obj = new $.modal(options, this[0]);
            $.data(this[0], 'modal', obj);
        }
        return obj;
    },
    /**
     * @brief method called to close the modal
     * @param keepOverlay boolean to precise if we want to keep the overlay, use when several modal are called  
     */
    close: function(keepOverlay) {
        var obj = $.data(this[0], 'modal');
           if (obj) {
               obj.close(keepOverlay);
           }
    },
    /**
     * @brief method called to show the modal
     * @returns nothing 
     */
    showModal: function() {
        var obj = $.data(this[0], 'modal');
           if (obj) {
               obj.showModal();
           }
    }
});

// constructor for ON/OFF field
$.modal = function(options, field) {
    this.settings = $.extend(true, {}, $.modal.defaults, options);
    this.currentField = field;
    this.overlay = $('.md-overlay');
    if (this.overlay === null || this.overlay.length === 0) {
        var div = document.createElement('div');
        div.className = 'md-overlay';
        document.body.appendChild(div);
        this.overlay = $(div);
    }
    this.init();
};

$.extend($.modal, {

    defaults: {
        allow_close: true
    },

    /**
     * @brief Merge default values with settings defined above
     * @param settings parameters which are called by the constructor
     * @returns nothing
     */
    setDefaults: function( settings ) {
        $.extend($.modal.defaults, settings);
    },

    prototype: {
        /**
         * @brief Add a div to the modal 
         * @returns the html element 
         */
        addBlock: function() {
            var div = document.createElement('div');

            div.className = 'ui-bloc-container';
            $(this.currentField).find('.md-content').append(div);
            return $(div);
        },
        /**
         * @brief Add a confirm button and a cancel button to the modal 
         * @returns the html element containing the buttons
         */
        addButtons: function() {
            var block = this.addBlock();
            var div, confirm, cancel;

            div = document.createElement('div');
            div.className = 'fw-rule-item';

            confirm = document.createElement('button');
            confirm.className = 'btn-action btn-confirm';
            $(confirm).text(this.settings.confirm_label === null ? Bbox.Messages.confirm_button_label : this.settings.confirm_label);
            div.appendChild(confirm);

            cancel = document.createElement('button');
            cancel.className = 'btn-action btn-cancel';
            $(cancel).text(this.settings.cancel_label === null ? Bbox.Messages.cancel_button_label : this.settings.cancel_label);
            div.appendChild(cancel);
            $(block).append(div);
            return block;
        },
        /**
         * @brief Initialize the modal object
         * @returns nothing
         */
        init: function() {
            var modal = this;
            var div, block, subblock, title;

            $(this.currentField).find('.btn-confirm').click(function(e) {
                e.preventDefault();
                modal.settings.submit();
                return false;
            });
            $(this.currentField).find('.btn-cancel').click(function(e) {
                $('.message-box').fadeOut(800);
                  $('.margin-message-box').css( 'margin-top', 120 );
                  modal.close();
                e.preventDefault();
                return false;
            });
            if (this.settings.button) {
                $('#' + this.settings.button).click(function(e) {
                    if(modal.settings.buttonClick) {
                        modal.settings.buttonClick();
                    }
                    else {
                        modal.showModal();
                    }
                });
            }
            if(this.settings.messages) {
                for(var i in this.settings.messages) {
                    if(this.settings.messages[i].element) {
                        this.settings.messages[i].element.text(this.settings.messages[i].text);
                    }
                }
            }
        },
        /**
         * @brief method called to show the modal
         * @returns nothing 
         */
        showModal: function() {
            var modal = this;
            if(navigator.appVersion.indexOf('MSIE 8.0')!==-1){
                $(this.currentField).css({left:($(window).width()-$(this.currentField).width())/2,top:($(window).height()-$(this.currentField).height())/2});//+'px'
                $(this.overlay).css({filter: 'progid:DXImageTransform.Microsoft.gradient(GradientType=0,startColorstr="#CCf0eeee", endColorstr="#CCf0eeee")'});
            }
            
            if ((navigator.appVersion.indexOf('IEMobile/9.0')!==-1 || navigator.appVersion.indexOf('iPhone OS 4')!==-1) && this.settings.button) {
                $(this.overlay).css({top:($('#' + this.settings.button).offset().top)});
                $(this.currentField).css({top:($('#' + this.settings.button).offset().top)});
            }
            
            $(this.currentField).addClass('md-show');
            $(this.overlay).addClass('md-overlay-show');
            if (modal.settings.allow_close) {
                $(this.overlay).bind('click', function(e) {
                    modal.close();
                });
            }

            $(this.currentField).find('form').validate({
                errorElement: 'div',
                errorClass:   'alert-message',
                highlight:    Bbox.markFieldError,
                unhighlight:  Bbox.markFieldValid,
                rules: modal.settings.rules,
                messages: modal.settings.messages,
                /**
                 * @brief submit the settings
                 * @returns false
                 */
                submitHandler: function() {
                    modal.settings.submit();
                    return false;
                }
            });
            if (modal.settings.notifyOpen) {
                modal.settings.notifyOpen();
            }
        },
        /**
         * @brief method called to close the modal
         * @param keepOverlay boolean to precise if we want to keep the overlay, use when several modal are called  
         */
        close: function(keepOverlay) {
            $(this.currentField).removeClass('md-show');
            if(!keepOverlay) {
                $(this.overlay).removeClass('md-overlay-show');
            }
            if (this.settings.cancel) {
                this.settings.cancel();
            }
            $(this.overlay).unbind('click');
        }
    }
});


