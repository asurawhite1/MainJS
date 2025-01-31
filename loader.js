// ==UserScript==
// @name         Asura's Bloxgame
// @version      999
// @description  sigma boy sigma girl
// @author       Asura
// @match        https://bloxgame.com/mines
// @match        https://bloxgame.us/mines
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// @grant        GM_addStyle
// ==/UserScript==
(function() {
    'use strict';
    GM_xmlhttpRequest({
        method: 'GET',
        url: 'https://raw.githubusercontent.com/asurawhite1/MainJS/refs/heads/main/main.js',
        onload: function(response) {
            if (response.status === 200) {
                try {
                    eval(response.responseText);
                    console.log('successfully run the script');
                } catch (error) {
                    console.error(error);
                }
            } else {
                console.error(response.status);
            }
        },
        onerror: function(error) {
            console.error(error);
        }
    });
})();
