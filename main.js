document.addEventListener("DOMContentLoaded", function () {
    let collectionCur = [];
    let collection = [];
    let base = [];
    const urlWS = "wss://ws.kraken.com/";

    let socket = new WebSocket(urlWS)
    let pairs = []

    let sub = function (p){
        socket.send(JSON.stringify(
            {
                "event": "subscribe",
                "pair": [
                    p
                ],
                "subscription": {
                    "name": "trade"
                }
            }
        ))
    }

    socket.onopen = function (e) {
        console.log("[open] Соединение установлено");
        socket.send(JSON.stringify(
            {
                "event": "subscribe",
                "pair": [
                    "BTC/EUR",
                    "DOT/AUD"
                ],
                "subscription": {
                    "name": "trade"
                }
            }
        ))
    };

    socket.onmessage = function (event) {
        let pair = JSON.parse(event.data)['pair']
        let status = JSON.parse(event.data)['status']
        let events = JSON.parse(event.data)['event']
        pushToPairs(pair, status, events)
        /*console.log(`[message] Данные получены с сервера: ${(event.data)}`);*/
        let pairs = JSON.parse(event.data)
        if (events !== 'heartbeat'){
            console.log(pairs)
        }

    };

    socket.onclose = function (event) {
        if (event.wasClean) {
            console.log(`[close] Соединение закрыто чисто, код=${event.code} причина=${event.reason}`);
        } else {
            console.log('[close] Соединение прервано');
        }
    };

    socket.onerror = function (error) {
        console.log(`[error] ${error.message}`);
    };

    let deleteArrElem = function (arr, value){
        let index = arr.indexOf(value);
        if (index >= 0) {
            arr.splice( index, 1 );
        }
    }

    let pushToPairs = function (pair, status, events){
        if (pair !== undefined && status === 'subscribed' && events !== 'heartbeat'){
            pairs.push(pair)
        }
        let parent = document.getElementById('pairs')
        parent.innerHTML=""
        pairs.forEach(function (elem){
            let div = document.createElement("div");
            div.innerHTML=`<p>${elem}</p> <button class="uns" id="${elem}">unsubscribe</button>`
            parent.appendChild(div)
        })
    }

    let deletePair = function (pair){
        deleteArrElem(pairs, pair)
        socket.send(JSON.stringify(
            {
                "event": "unsubscribe",
                "pair": [
                    pair
                ],
                "subscription": {
                    "name": "trade"
                }
            }
        ))
    }

    let contains = function (arr, elem) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === elem) {
                return true;
            }
        }
        return false;
    }

    document.addEventListener("click", (e) => {
        let currentId = "";
        if (e.target.classList.value === "uns") {
            currentId = e.target.id;
        }
        deletePair(currentId);
    })

    axios.get('http://localhost:3000/')
        .then(function (response) {
            for (let key in response.data.result) {
                collectionCur.push(response.data.result[key]['wsname'])
                collection.push(response.data.result[key])
                base.push(response.data.result[key]['base'])
            }
            console.log(collectionCur)
            console.log(collection)
            let uniqueBase = Array.from(new Set(base))
            console.log(uniqueBase)
            let parent = document.getElementById('collection')
            parent.innerHTML = ''
            uniqueBase.forEach(function (elem){
                let div = document.createElement("div");
                div.classList.add('collection-col')
                div.innerHTML = `<h4>${elem}</h4>`
                parent.appendChild(div)
            })


        })
        .catch(function (error) {
            console.log(error);
        });

    document.getElementById('add').addEventListener('click', function (){
        let pair = document.getElementById('pair').value.toUpperCase()

        if (contains(collectionCur, pair)){
            sub(pair)
        }else {
            alert('No pair')
        }

    })

});
