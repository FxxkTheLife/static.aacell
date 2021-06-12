var stompClient = null;

function ws_connect(connectCallback, errorCallback, closeEventCallback) {
    //var socket = new WebSocket('wss://aacell.me/socket/connect/websocket')
    var socket = new SockJS('/socket/connect')
    // stompClient = Stomp.client('ws://localhost:8888/socket/connect')
    stompClient = Stomp.over(socket)

    stompClient.connect({roomid:room_id}, function (frame) {
        debug('Connected: ' + frame)
        if (connectCallback !== undefined) {
            connectCallback(stompClient)
        }
    }, errorCallback, closeEventCallback)
    // stompClient.ws.bufferedAmount
}

function ws_disconnect(disconnectCallback) {
    if (stompClient !== null) {
        stompClient.disconnect(disconnectCallback)
    }
}

function ws_send(msg) {
    var tx = stompClient.begin()
    stompClient.send('/app/message/' + room_id, {transaction: tx.id}, JSON.stringify({'message': msg}))
    tx.commit()
}

// FILE

// function send_file(input) {
//     for (let file of input.files) {
//         // post('/storage/upload', file, )
//         // if (window.Worker) {
//         //     send_worker = new Worker('ws_send.js')
//         //     send_worker.onmessage = function (ev) {
//         //         debug(ev.data)
//         //     }
//         //     send_worker.postMessage({'client': stompClient, 'file': file})
//         // }
//         read(file, (result => {
//             let data = JSON.stringify({'name': file.name, 'size': file.size, 'content': arrayBufferToBase64(result)})
//             stompClient.send('/app/res', {}, data)
//         }))
//     }
// }

// function arrayBufferToBase64(buffer) {
//     let binary = '';
//     const bytes = new Uint8Array(buffer);
//     const len = bytes.byteLength;
//     for (let i = 0; i < len; i++) {
//         binary += String.fromCharCode(bytes[i]);
//     }
//     return window.btoa(binary);
// }
//
// function read(file, result) {
//     // let send_file = document.getElementById('send-file')
//     const reader = new FileReader()
//     reader.addEventListener('load', (ev => {
//         result(ev.target.result)
//     }))
//     reader.readAsArrayBuffer(file)
// }