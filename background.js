/*!
 * @brief Initialize click-to-call
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
 * @author Patrice Borne <paborne@bouyguestelecom.fr>
 */
Bbox.api.xdsl.info(function(response) {
	/*En fonction de la réponse de cette API, s'il n'y a pas d'erreur on active le parsing*/
    if(!response.error) {
    	/*Rajout du listner pour voir les modifications des onglets de chrome*/
        chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
            if (changeInfo.status == 'complete' && tab.active) {
                chrome.tabs.getSelected(null,function(tab) {
                    if(tab.url.indexOf('http://192.168.1.254') === -1 && 
                            tab.url.indexOf('http://bbox') === -1 && 
                            tab.url.indexOf('http://gestionbbox.lan') === -1) {
                    	/*On execute le script matchPhoneNumber.js uniquement pour les pages non ihm de la gateway*/
                        chrome.tabs.executeScript(tab.id, {
                            file: 'matchPhoneNumber.js'
                          }, function() { 
                        });
                    }
                });
            }
          })
    }
    else {
    	/*Si une erreur est retournée, ie on n'arrive pas à joindre la box, on affiche une icone rouge*/
        chrome.browserAction.setIcon({path:'iconred.png'})
    }
});
