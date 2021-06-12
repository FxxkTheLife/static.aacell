
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

function ws_connection_change(new_status) {
    switch (new_status) {
        case "DISCONNECTED":
            ws_status = "DISCONNECTED"
            document.getElementById('ws-connect-status-img').src = ws_status_img_off
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
    ws_connection_change("CONNECTING")
    ws_connect( function (stompClient) {
        ws_connection_change("CONNECTED")
        request_message()
        request_category()
        request_file()
        request_admin_exists()
        request_navigation_info()

        stompClient.subscribe('/topic/message/' + room_id, function (data) {
            let json = JSON.parse(data.body)
            if (json.isDelete === false) {
                let chat_box_list = document.getElementById('chat-box-list')
                chat_box_list.innerHTML += message_item(json)
                // resize_textarea(json.id)
            } else {
                document.getElementById(`message-item-${json.id}-li`).remove()
            }
            data.ack()
        })
        stompClient.subscribe('/topic/file/' + room_id, function (data) {
            let json = JSON.parse(data.body)
            if (json.state === 'add') {
                let category = json.category
                if (typeof all_files[category] === "undefined")
                    all_files[category] = []
                add_file(json)
                document.getElementById('empty-hint-img').style.opacity = '0'
            } else if (json.state === 'delete') {
                delete_listed_file(json.name, json.category)
            } else if (json.state === 'rename') {
                let category = json.category
                let prev_name = json['prevName']

                if (typeof all_files[category] === "undefined")
                    all_files[category] = []
                let index = all_files[category].findIndex(ele => { return ele.name === prev_name })
                if (index === -1) return
                all_files[category][index] = json

                if (category === curr_category) {
                    let base64_prevName = Base64.encode(json['prevName'])
                    let item = document.getElementById(`file-item-${base64_prevName}`)
                    item.outerHTML = file_item(json)
                }
            }
            data.ack()
        }, {ack: 'client'})
        stompClient.subscribe('/topic/category/' + room_id, function (data) {
            let json = JSON.parse(data.body)
            let category_name = json.name
            if (json.state === 'add') {
                all_categories.push(json)
                if (typeof all_files[category_name] === "undefined")
                    all_files[category_name] = []
                document.getElementById('category-list').innerHTML += category_item(json)
            } else if (json.state === 'delete') {
                delete_listed_category(category_name)
            } else if (json.state === 'rename') {
                let prev_name = json['prevName']
                if (curr_category === prev_name)
                    curr_category = json.name

                // all_categories
                let index = all_categories.findIndex(ele => { return ele.name === prev_name })
                if (index === -1) return
                all_categories[index] = json

                // all_files
                all_files[category_name] = all_files[prev_name]

                let base64_prev_name = Base64.encode(prev_name)
                document.getElementById(`category-item-${base64_prev_name}`).outerHTML = category_item(json)
            }
            data.ack()
        })
        //statistic users count & battery
        stompClient.subscribe('/topic/info/' + room_id, function (data) {
            let json = JSON.parse(data.body)
            debug("ws from: " + json)
            if (json.user !== null) {
                let user_count = document.getElementById('user-count-value')
                user_count.innerHTML = json.user
            }
            if (json.battery !== null && json.birth !== null) {
                update_battery(json.battery, json.birth)
            }

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