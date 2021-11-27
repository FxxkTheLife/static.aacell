
let ws_status = "DISCONNECTED"
const ws_status_img_off = `${baseurl}/assets/room/bolt-off.svg`
const ws_status_img_on = `${baseurl}/assets/room/bolt-on.svg`
const ws_status_img = `${baseurl}/assets/room/bolt.svg`

// WebSocket Connection Manager

function ws_connection_btn_clicked() {
    switch (ws_status) {
        case "DISCONNECTED":
            connect()
            break
        case "CONNECTED":
            disconnect()
            break
        case "CONNECTING" || "DISCONNECTING":
            break
    }
}

function ws_show_reconnect_textbox(){
    textbox({
        type: 'text',
        title: i18n['room.room-disconnected'],
        message: i18n['room.textbox_disconnect_content'],
        button_text: i18n['room.textbox_reconnect'],
        callback: function () {
            connect()
            return true
        }
    })
    document.getElementById('ws-connect-status-img').classList.remove('ws-connecting')

}
function ws_connection_change(new_status) {
    switch (new_status) {
        case "DISCONNECTED":
            ws_status = "DISCONNECTED"
            document.getElementById('ws-connect-status-img').src = ws_status_img_off
            ws_show_reconnect_textbox()
            break
        case "CONNECTED":
            ws_status = "CONNECTED"
            document.getElementById('ws-connect-status-img').src = ws_status_img_on
            document.getElementById('ws-connect-status-img').classList.remove('ws-connecting')
            break
        case "CONNECTING":
            ws_status = "CONNECTING"
            document.getElementById('ws-connect-status-img').src = ws_status_img
            document.getElementById('ws-connect-status-img').classList.add('ws-connecting')
            break
        case "DISCONNECTING":
            ws_status = "DISCONNECTING"
            document.getElementById('ws-connect-status-img').src = ws_status_img
            document.getElementById('ws-connect-status-img').classList.add('ws-connecting')
            break
    }
}

function connect(callback) {
    if (ws_status !== 'DISCONNECTED')
        return
    ws_connection_change("CONNECTING")
    ws_connect( function (stompClient) {
        ws_connection_change("CONNECTED")
        request_message()
        request_category()
        request_file()
        request_admin_exists()
        request_navigation_info()

        stompClient.subscribe('/topic/message/' + room_id, function (data) {
            receive_message(data)
            data.ack()
        })
        stompClient.subscribe('/topic/file/' + room_id, function (data) {
            receive_file(data)
            data.ack()
        }, {ack: 'client'})
        stompClient.subscribe('/topic/category/' + room_id, function (data) {
            receive_category(data)
            data.ack()
        })
        // users count & battery
        stompClient.subscribe('/topic/info/' + room_id, function (data) {
            receive_navigation_info(data)
            data.ack()
        })
        if (callback !== undefined) {
            callback(stompClient)
        }
    }, function (error_frame) {
        ws_connection_change("DISCONNECTED")
    }, function (close_frame) {
        ws_connection_change("DISCONNECTED")
    })
}

function disconnect() {
    ws_connection_change("DISCONNECTING")
    ws_disconnect(function () {
        ws_connection_change("DISCONNECTED")
    })
}