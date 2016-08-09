/*!
 * @brief Common definitions and support for the UI
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
var Bbox = Bbox || {};

var header = $('header'),
    headerHeight = header.height() + 25,
    treshold = 0,
    lastScroll = 0;

Bbox.PendingErrors = false;
Bbox.refresh_delay = {
    default2: 10000,
    devices: 10000,
    wps_devices: 1000,
    stats: 1000,
    cpu_graph_delay: 10000,
    temp_graph_delay: 10000,
    xdsl_graph_delay: 60000
};
/**
 * @brief Install the tooltip on a form.
 *
 * @param form the form where the tooltip must be activated.
 */
Bbox.tooltip = function(form) {
    $(form).find('.help-focus').focusin(function() {
        $(this).find('.help-bloc').show().css({visibility:'visible'});
        $(this).find('.help-bloc.bottom:not(.dhcp-help)').css({visibility:'visible',width:'100%'});
    }).focusout(function() {
          $(this).find('.help-bloc:not(.bottom)').hide();
          $(this).find('.help-bloc.bottom').css({visibility:'hidden'});
    });
    $(form).find('.help-focus').focusin(function() {
          $(form).find('.help-bloc-small').show();
    }).focusout(function() {
          $(form).find('.help-bloc-small').hide();
    });
};

/**
 * @brief Get the message box or create it if necessary.
 *
 * @return the message box div.
 */
Bbox.createMessageBox = function() {
    var div;

    div = document.getElementById('message-box');
    if (div) {
        return div;
    }
    div = document.createElement('div');
    div.id = 'message-box';
    div.className = 'message-box message';

    var block = document.createElement('div');
    block.className = 'row';
    div.appendChild(block);

    var span = document.createElement('span');
    span.className = 'close';

    block.appendChild(span);

    var header = document.createElement('div');
    header.className = 'message-header';
    block.appendChild(header);

    var msg = document.createElement('p');
    msg.className = 'message-content';
    block.appendChild(msg);
    document.body.appendChild(div);
    return div;
};

Bbox.closeMessage = function() {
    $('#message-box').fadeOut(800);
    $('.margin-message-box').css( 'margin-top', 120 );
};

/**
 * @brief Print a message on the top of the page.
 *
 * @param title the message title.
 * @param message the message text.
 */
Bbox.printMessage = function(title, message,NoClose) {
    var box = Bbox.createMessageBox();

    $('.margin-message-box').css( 'margin-top', $('.message-box').height() + 120 );
    $(box).find('.message-header').text(title);
    $(box).find('.message-content').text(message);
    $(box).find('.close').click(Bbox.closeMessage);
    $('#message-box').fadeIn(100);
    if(!NoClose) {
        setTimeout(Bbox.closeMessage, 5000);
    }
};

/**
 * @brief Display the login popup modal when we detect that the user's session expired.
 */
Bbox.login = function() {
    var login = document.getElementById('login-modal');
    var bool = false;

    if (login === null) {
        login = document.createElement('div');
        login.className = 'md-modal';
        login.id = 'login-modal';
        document.body.appendChild(login);
        bool = true;
    }

    bool = (bool || $(login).css('visibility')==='hidden');
    if(bool) {
        Bbox.api.get(Bbox.api.server + '/forms/form-login.html', null, function(response) {
            if (!response.error) {
                $(login).html(response.data);

                /**
                 * Build the login modal box.
                 */
                $(login).modal({
                    allow_close: false,
                    rules: {
                        password: { required: true }
                    },
                    messages: {
                        password: Bbox.Messages.password_required
                    },
                    /**
                     * @brief Action when submitting the form
                     * @param e event
                     * @return nothing
                     */
                    submit: function(e) {
                        var passwd = $(login).find('.text-input').val();
                        var remember = $('#cbox-login').val();

                        Bbox.api.login(passwd, remember === 'on' ? true : false, function(response) {
                            if (!response.error) {
                                $(login).close();
                                Bbox.printMessage('Information', 'Vous êtes reconnecté...');
                                Bbox.api.operation.apply(Bbox.api,Bbox.api.lastError);
                            } else if (response.status === 401) {
                                $('#password-message').html(Bbox.Messages.invalid_password);
                                $('#password-message').show();
                            }
                        });
                    }
                }).showModal();
            }
        });
    }
};
