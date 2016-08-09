/*!
 * @brief Find phone numbers and add the click to call property
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

/*Fonction qui enleve les doublon d'un tableau*/
var cleanArray = function (array) {
    var i, j, len = array.length, out = [], obj = {};
    for (i = 0; i < len; i++) {
      obj[array[i]] = 0;
    }
    for (j in obj) {
      out.push(j);
    }
    return out;
};

var oldHtml = '';

var setClickToCall = function() {
    if(oldHtml !== document.body.innerHTML) {
        $('body').addClass('bouygues-clic-to-call');
        var tab = [];
        $('*:not(html,head,script,link,meta,title,iframe,style,body)')  
          .contents()
          .filter(function(){
        	  /*On filtre le document HTML pour ne garder que les éléments texte*/
              return this.nodeType === 3;
          })
          .each(function() {
        	  /*Pour chacun des textes trouvés*/
              var self = this;
              var regexp = /((\+33|0033|0)([0-9])[\s|.]{0,1}([0-9]{2}[\s|.]{0,1}){3}[0-9]{2})|(appelez le [0-9]{0,8})/g;
              /*On teste l'expression régulière repérant les numéros de téléphone*/
              if(regexp.test(self.textContent)) {
            	  /*Si un numéro de téléphone est trouvé alors on remplace le texte par du html*/
                  $(self.parentNode).html($(self.parentNode).html().replace( regexp,function() {
                      var html;
                      var num = arguments[0].replace(/\s/g,'').split('.').join('').match(/[0-9]{1,12}/)[0];
                      /*Si l'élément a déjà été parsé on ne change rien*/
                      if($(self.parentNode).hasClass('clic-to-call')) {
                          html= arguments[0];
                      }
                      else {
                    	  /*Sinon on rajoute une balise avec la classe clic-to-call pour afficher l'image du téléphone et souligné le numéro*/
                          tab.push(num);
                          html = '<span class="clic-to-call" name="' + num + '">' + arguments[0] + '</span>';
                      }
                      return html;
                  })); 
              }
          });

        tab = cleanArray(tab);
        var length = tab.length;
        for(var i=0;i<length;i++) {
        	/*Ajout de l'évnement onclick à chaque fois que l'ontrouve un n° de tel*/
        	$('span[name="' + tab[i] + '"]').off('click');
            $('span[name="' + tab[i] + '"]').click(function() {
            	/*Appel de l'api clickToCall*/
                Bbox.api.voip.clicktocall($(this).attr('name'), function(response) {
                });
            });
        }
        oldHtml = document.body.innerHTML;
    }
}

setClickToCall();
setInterval(setClickToCall,2000);
