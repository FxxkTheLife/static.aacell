// Messages

let messages = {}

function send() {
    let data = document.getElementById('chat-box-textarea').value
    if (data.length === 0) {
        return
    }
    if (data.length > 1000 || Base64.encode(data).length > 1000) {
        textbox({
            type: 'text',
            title: i18n['room.message-sent-error'],
            message: i18n['room.message-size-warning'],
            callback() { return true }
        })
        return;
    }
    ws_send(data)
    document.getElementById('chat-box-textarea').value = ''
    document.getElementById('chat-box-textarea').focus()
}

function save_as_file() {
    let data = document.getElementById('chat-box-textarea').value
    if (data.length === 0) {
        return
    }
    textbox({
        type: 'input',
        title: i18n['room.save-as-file'],
        message: i18n['room.save-as-file-desc'],
        callback() {
            let confirm_btn = document.getElementById('text-box-confirm-btn')
            let filename = document.getElementById('text-box-text-input').value
            let form_data = new FormData()
            form_data.append('filename', Base64.encode(filename))
            form_data.append('content', data)
            form_data.append('category',curr_category)
            post('/-/res/file/create', {
                headers: {
                    'token': window.localStorage.getItem('token'),
                    'roomid': room_id
                },
                body: form_data,
                success(xmlhttp) {
                    debug(xmlhttp.responseText)
                    let json = JSON.parse(xmlhttp.responseText)
                    if (json.code === 0) {
                        hide_textbox()
                    } else if (json.code === -1) {
                        document.getElementById('text-box-message').textContent = json.msg
                        document.getElementById('text-box-message').style.color = 'var(--red)'
                    }
                    confirm_btn.innerHTML = i18n['room.confirm']
                    confirm_btn.disabled = false
                },
                error(xmlhttp) {
                    if (xmlhttp.status === 401) {
                        window.location.reload()
                    }
                }
            })
            confirm_btn.innerHTML = i18n['room.please-wait']
            confirm_btn.disabled = true
        }
    })
}

function delete_message(id) {
    textbox({
        type: 'input-password',
        title: i18n['room.adminword-required'],
        message: i18n['settings.administrator-authority'],
        callback: function () {
            let confirm_btn = document.getElementById('text-box-confirm-btn')
            let adminword = document.getElementById('text-box-password-input').value
            post('/-/res/message/delete', {
                headers: {
                    'token': window.localStorage.getItem('token'),
                    'roomid': room_id,
                    'messageid': id,
                    'adminword': adminword
                },
                success(xmlhttp) {
                    debug(xmlhttp.responseText)
                    let json = JSON.parse(xmlhttp.responseText)
                    if (json.code === 0) {
                        hide_textbox()
                    } else if (json.code === -1) {
                        document.getElementById('text-box-message').textContent = json.msg
                        document.getElementById('text-box-message').style.color = 'var(--red)'
                        document.getElementById('text-box-password-input').classList.add('red')
                    }
                    confirm_btn.innerHTML = i18n['room.confirm']
                    confirm_btn.disabled = false
                },
                error(xmlhttp) {
                    if (xmlhttp.status === 401) {
                        window.location.reload()
                    }
                }
            })
            confirm_btn.innerHTML = i18n['room.please-wait']
            confirm_btn.disabled = true
            return false
        }
    })
}

// display

let display_message_div = true

function display_message_btn_clicked(btn) {
    display_message_div = !display_message_div

    if (display_message_div) {
        btn.classList.add('active')
        document.getElementById('message-div').classList.remove('invisible')
    } else {
        btn.classList.remove('active')
        document.getElementById('message-div').classList.add('invisible')
    }
}

function close_message_click_down(target) {
    if (!display_message_div)
        return
    if (document.getElementById('message-div').contains(target) ||
        document.getElementById('floating-bar').contains(target) ||
        document.getElementById('navigation-bar').contains(target) ||
        document.getElementById('text-box-div').contains(target)
    )
        return;
    document.getElementById('display-message-btn').click()
}

// get messages when login

function request_message() {
    get('/-/res/messages', {
        headers: {'token': window.localStorage.getItem('token'), 'roomid': room_id},
        success: function (xmlhttp) {
            let json = JSON.parse(xmlhttp.responseText)
            if (json.code === 0) {
                let data = json.data
                let chat_box_list = document.getElementById('chat-box-list')
                chat_box_list.innerHTML = ''
                for (let message_dict of data) {
                    debug(message_dict)
                    chat_box_list.innerHTML += message_item(message_dict)
                }
            }
        }
    })
}

// Message item

function message_item(json) {
    let content = json.message
    let id = json.id
    messages[id] = content
    return `
    <li tabindex="-1" id="message-item-${id}-li">
        <pre class="message-content">${urlify(htmlencode(content))}</pre>
        <span class="message-btn-wrapper">
            <button onclick="copy(messages['${id}'])">${i18n['room.copy']}</button>
            <button class="message-delete-btn" onclick="delete_message('${id}')">${i18n['room.delete']}</button>
        </span>
    </li>
    `
}

