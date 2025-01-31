// ==UserScript==
// @name         Asura's Bloxgame
// @version      999
// @description  sigma boy sigma girl
// @author       Asura
// @match        https://bloxgame.com/mines
// @match        https://bloxgame.us/mines
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';
    window.addEventListener('load', function () {
        const startGameButton = document.querySelector('.gameBetSubmit');
        if (startGameButton) {
            const container = document.createElement('div');
            container.className = 'TextBar';
            const menuText = document.createElement('span');
            menuText.textContent = "Asura's Predictor - v1.3Beta - loader";
            menuText.className = 'menuText';
            const menuText1 = document.createElement('span');
            menuText1.textContent = "Safe Amount";
            menuText1.className = 'menuText1';
            const menuText2 = document.createElement('span');
            menuText2.textContent = "Mines Method";
            menuText2.className = 'menuText2';
            const algorithmSelect = document.createElement('select');
            algorithmSelect.id = 'algorithm-select';
            algorithmSelect.className = 'AlgorithmHolder';
            const algorithms = ['Algorithm', 'Logarithm', 'Pastgame','adgiMines','patternshift'];
            algorithms.forEach(alg => {
                const option = document.createElement('option');
                option.value = alg;
                option.textContent = alg;
                algorithmSelect.appendChild(option);
            });
            const safeAmountInput = document.createElement('input');
            safeAmountInput.type = 'number';
            safeAmountInput.min = '1';
            safeAmountInput.max = '24';
            safeAmountInput.placeholder = 'Enter safe amount here!';
            safeAmountInput.id = 'safe-amount-input';
            safeAmountInput.className = 'safeInput';
            safeAmountInput.value = 1;
            const predictSafeButton = document.createElement('button');
            predictSafeButton.id = 'predict-safespot-button';
            predictSafeButton.textContent = 'Predict';
            predictSafeButton.className = 'mainGuiButton';
            predictSafeButton.addEventListener('click', function () {
                const selectedAlgorithm = algorithmSelect.value;
                const safeAmount = parseInt(safeAmountInput.value);
                if (isNaN(safeAmount) || safeAmount < 1 || safeAmount > 24) {
                    alert('safeamount should be 1 - 24 :(');
                    return;
                }
                CheckGame()
                    .then((isGameStarted) => {
                        if (isGameStarted) {
                            getPredction(selectedAlgorithm, safeAmount);
                        } else {
                            showNotification('Start da mines game first!', true);
                        }
                    })
                    .catch(() => {
                        showNotification('Failed to check game. Please try reloading the page.', true);
                    });
            });

            const unrigButton = document.createElement('button');
            unrigButton.id = 'unrig-button';
            unrigButton.textContent = 'Unrig';
            unrigButton.className = 'mainGuiButton';
            unrigButton.addEventListener('click', unrig);
            container.appendChild(menuText);
            container.appendChild(predictSafeButton);
            container.appendChild(menuText1);
            container.appendChild(safeAmountInput);
            container.appendChild(menuText2);
            container.appendChild(algorithmSelect);
            container.appendChild(unrigButton);
            startGameButton.parentNode.insertBefore(container, startGameButton.nextSibling);
            const style = document.createElement('style');
            style.textContent = `
                .menuText {
                    font-size: 16px;
                    font-weight: bold;
                    display: inline-block;
                    color: #cbb035;
                }
                .menuText1 {
                    font-size: 16px;
                    font-weight: bold;
                    display: inline-block;
                    color: rgb(255, 255, 255);
                }
                .menuText2 {
                    font-size: 16px;
                    font-weight: bold;
                    display: inline-block;
                    color: rgb(255, 255, 255);
                }
                .mainGuiButton {
                    width: 100%;
                    padding: 10px;
                    margin: 5px 0;
                    color: #000000;
                    background: #ceaa07;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 1.4rem;
                }
                .AlgorithmHolder {
                    width: 100%;
                    color: #ffffff;
                    background: #2b294f;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 1.5rem;
                    height: 37px;
                    margin-bottom: 5px;
                }
                .safeInput {
                    padding-left: 10px;
                    padding-right: 10px;
                    width: 100%;
                    color: #ffffff;
                    background: #2b294f;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 1.5rem;
                    height: 37px;
                    margin-bottom: 5px;
                }
                .gameBetSubmit {
                    margin-top: 20px;
                }
            `;
            document.head.appendChild(style);

            let irip = false;

            function getPredction(selectedAlgorithm, safeAmount) {
                if (irip) return;
                irip = true;
                clearHighlights();
                showNotification('Predicting your minesGame...');
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: 'https://api.bloxgame.com/games/mines/history?size=50&page=0',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': localStorage.getItem("_DO_NOT_SHARE_BLOXGAME_TOKEN"),
                        'User-Agent': 'Mozilla/5.0',
                        'x-client-version': '1.0.0'
                    },
                    onload: function (response) {
                        if (response.status === 200) {
                            const data = JSON.parse(response.responseText);
                            const mine = data.data.map(game => game.mineLocations || []);
                            const uncover = data.data.map(game => game.uncoveredLocations || [])
                            GM_xmlhttpRequest({
                                method: 'POST',
                                url: 'http://ro-premium.pylex.xyz:9244/algorithm',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                data: JSON.stringify({
                                    safe_amount: safeAmount,
                                    mineLocations: mine,
                                    uncoveredLocations : uncover,
                                    algorithm: selectedAlgorithm
                                }),
                                onload: function (apiResponse) {
                                    irip = false;
                                    if (apiResponse.status === 200) {
                                        const apiData = JSON.parse(apiResponse.responseText);
                                        const board = apiData.gird;
                                        highlightBoard(board);
                                        showNotification('Successfully predicted your minesGame');
                                    } else {
                                        showNotification('something went wrong');
                                    }
                                },
                                onerror: function () {
                                    irip = false;
                                    showNotification('something went wrong');
                                }
                            });
                        } else {
                            irip = false;
                            showNotification('something went wrong');
                        }
                    },
                    onerror: function () {
                        irip = false;
                        showNotification('something went wrong');
                    }
                });
            }

            function clearHighlights() {
                const tiles = document.querySelectorAll('.mines_minesGameItem__S2ytQ');
                tiles.forEach(tile => {
                    tile.style.outline = '';
                    tile.style.boxShadow = '';
                    tile.style.backgroundImage = '';
                    tile.style.backgroundSize = '';
                });
            }

            function highlightBoard(board) {
                const tiles = document.querySelectorAll('.mines_minesGameItem__S2ytQ');
                if (tiles.length !== 25) {
                    console.error(tiles.length);
                    return;
                }

                board.forEach((row, rowIndex) => {
                    row.forEach((value, colIndex) => {
                        const index = rowIndex * 5 + colIndex;
                        if (value === 1) {
                            const tile = tiles[index];
                            if (tile) {
                                tile.style.outline = `4px solid white`;
                                tile.style.boxShadow = `0 0 10px white`;
                                tile.style.backgroundImage = 'url("https://raw.githubusercontent.com/asurawhite1/MainJS/refs/heads/main/fire.gif")';
                                tile.style.backgroundSize = '155%';

                            }
                        }
                    });
                });
            }

            function CheckGame() {
                return new Promise((resolve, reject) => {
                    GM_xmlhttpRequest({
                        method: 'GET',
                        url: 'https://api.bloxgame.com/games/mines',
                        headers: {
                            'Content-Type': 'application/json',
                            'Referer': 'https://bloxgame.com/',
                            'x-auth-token': localStorage.getItem("_DO_NOT_SHARE_BLOXGAME_TOKEN"),
                            'User-Agent': 'Mozilla/5.0',
                            'x-client-version': '1.0.0'
                        },
                        onload: function (response) {
                            if (response.status === 200) {
                                try {
                                    const data = JSON.parse(response.responseText);
                                    if (data.success && data.hasGame) {
                                        resolve(true);
                                    } else {
                                        resolve(false);
                                    }
                                } catch (error) {
                                    reject(error);
                                }
                            } else {
                                reject(new Error('Something went wrong'));
                            }
                        },
                        onerror: function () {
                            reject(new Error('Something went wrong'));
                        }
                    });
                });
            }

          function unrig() {
              const randomSeed = generateRandomSeed();
              GM_xmlhttpRequest({
                  method: 'POST',
                  url: 'https://api.bloxgame.com/provably-fair/clientSeed',
                  headers: {
                      'Content-Type': 'application/json',
                      'Referer': 'https://bloxgame.com/',
                      'x-auth-token': localStorage.getItem("_DO_NOT_SHARE_BLOXGAME_TOKEN"),
                      'User-Agent': 'Mozilla/5.0',
                      'x-client-version': '1.0.0'
                  },
                  data: JSON.stringify({ clientSeed: randomSeed }),
                  onload: function(response) {
                      if (response.status === 200) {
                          showNotification('Successfully unrig', false);
                      } else {
                          showNotification('Something went wrong. Please try reloading the page!', true);
                      }
                  },
                  onerror: function() {
                      showNotification('Something went wrong. Please try reloading the page!', true);
                  },
              });
          }

          function generateRandomSeed() {
              const chars = 'abcdefghij01234567890';
              let seed = '';
              for (let i = 0; i < 36; i++) {
                  seed += chars[Math.floor(Math.random() * chars.length)];
              }
              return seed;
          }

          function showNotification(message, isError = false) {
              const notification = document.createElement('div');
              notification.id = 'notification';
              notification.style.background = isError ? '#ceaa07' : '#ceaa07';
              notification.style.color = '#000000';
              notification.style.padding = '10px';
              notification.style.position = 'fixed';
              notification.style.top = '10%';
              notification.style.right = '50%';
              notification.style.borderRadius = '8px';
              notification.style.boxShadow = 'rgba(0, 0, 0, 0.2) 0px 2px 5px';
              notification.style.width = 'auto';
              notification.style.zIndex = '1000';
              notification.style.fontWeight = '600';
              notification.style.fontSize = '2.0rem';
              notification.style.transform = 'translate(50%, -50%)';
              notification.style.opacity = '0';
              notification.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
              notification.textContent = message;
              document.body.appendChild(notification);
              setTimeout(() => {
                  notification.style.opacity = '1';
                  notification.style.transform = 'translate(50%, -50%)';
              }, 10);
              setTimeout(() => {
                  notification.style.opacity = '0';
                  notification.style.transform = 'translate(50%, -60%)';
                  notification.addEventListener('transitionend', function handleTransitionEnd(event) {
                      if (event.propertyName === 'opacity') {
                          notification.remove();
                          notification.removeEventListener('transitionend', handleTransitionEnd);
                      }
                  });
              }, 3000);
          }
      }
  });
})();
