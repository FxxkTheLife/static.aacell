window.onload = function () {
    analytics()
}

function go_back() {
    window.location.href = "/" + room_id
}

function change_adminword() {
    let adminword = document.getElementById('room-settings-change-adminword-input').value
    textbox({
        type: 'input-password',
        title: i18n['room.adminword-required'],
        message: i18n['settings.administrator-authority'],
        callback: function (box) {
            let confirm_btn = box.confirm_btn
            let old_word = box.password_input.value
            let form_data = new FormData()
            form_data.append('oldWord', old_word)
            form_data.append('newWord', adminword)
            post('/-/admin/adminword', {
                headers: {'token': window.localStorage.getItem('token'), 'roomid': room_id},
                body: form_data,
                success: function (xmlhttp) {
                    let json = JSON.parse(xmlhttp.responseText)
                    if (json.code === 0) {
                        window.location.reload()
                    } else if (json.code === -1) {
                        box.message.textContent = json.msg
                        box.message.style.color = 'var(--red)'
                        box.password_input.classList.add('red')
                    }
                    confirm_btn.innerHTML = i18n['room.confirm']
                    confirm_btn.disabled = false
                }
            })
            confirm_btn.innerHTML = i18n['room.please-wait']
            confirm_btn.disabled = true
        }
    })
}

function change_password() {
    let password = document.getElementById('room-settings-change-password-input').value
    textbox({//
        type: 'input-password',
        title: i18n['room.adminword-required'],
        message: i18n['settings.administrator-authority'],
        callback: function (box) {
            let confirm_btn = box.confirm_btn
            let adminword = box.password_input.value
            let form_data = new FormData()
            form_data.append('adminword', adminword)
            form_data.append('password', password)
            post('/admin/password', {
                headers: {'roomid': room_id},
                body: form_data,
                success: function (xmlhttp) {
                    let json = JSON.parse(xmlhttp.responseText)
                    if (json.code === 0) {
                        window.location.reload()
                    } else if (json.code === -1) {
                        box.message.textContent = json.msg
                        box.message.style.color = 'var(--red)'
                        box.password_input.classList.add('red')
                    }
                    confirm_btn.innerHTML = i18n['room.confirm']
                    confirm_btn.disabled = false
                }
            })
            confirm_btn.innerHTML = i18n['room.please-wait']
            confirm_btn.disabled = true
        }
    })
}

function destroy_cell() {
    textbox({
        type: 'text',
        title: i18n['settings.destroy-room-confirm'],
        message: i18n['settings.destroy-room-desc'],
        callback: function () {
            textbox({
                type: 'input-password',
                title: i18n['room.adminword-required'],
                message: i18n['settings.administrator-authority'],
                callback: function (box) {
                    let confirm_btn = box.confirm_btn
                    let adminword = box.password_input.value
                    let form_data = new FormData()
                    form_data.append('adminword', adminword)
                    post('/-/admin/destroy', {
                        headers: {'token': window.localStorage.getItem('token'), 'roomid': room_id},
                        body: form_data,
                        success: function (xmlhttp) {
                            let json = JSON.parse(xmlhttp.responseText)
                            if (json.code === 0) {
                                window.location.href = '/'
                            } else if (json.code === -1) {
                                box.message.textContent = json.msg
                                box.message.style.color = 'var(--red)'
                                box.password_input.classList.add('red')
                            }
                            confirm_btn.innerHTML = i18n['room.confirm']
                            confirm_btn.disabled = false
                        },
                        error: function (xmlhttp) {
                            if (xmlhttp.status === 401) {
                                window.location.reload()
                            }
                            confirm_btn.innerHTML = i18n['room.confirm']
                            confirm_btn.disabled = false
                        }
                    })
                    confirm_btn.innerHTML = i18n['room.please-wait']
                    confirm_btn.disabled = true
                }
            })
            return true
        }
    })

}
