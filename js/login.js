window.onload = function () {
    request_admin_exists()
    document.getElementById('login-password-input').focus()

    analytics()
}

function go_back() {
    window.location.href = "/"
}

function go_enter() {
    document.getElementById('login-submit').disabled = true
    document.getElementById('login-submit').innerText = i18n['login.entering']

    let password = document.getElementById('login-password-input').value
    let form_data = new FormData()
    form_data.append('roomid', room_id)
    form_data.append('password', password)

    post('/room/login', {
        headers: {'roomid': room_id},
        body: form_data,
        success: function (xmlhttp) {
            let json = JSON.parse(xmlhttp.responseText)
            if (json.code === 0) {
                window.location.reload()
            } else if (json.code === -1) {
                document.getElementById('error-message').innerText = json.msg
                document.getElementById('error-message').classList.remove('hidden')
                if (json.data === "password")
                    document.getElementById('login-password-input').classList.add('red')

                document.getElementById('login-submit').disabled = false
                document.getElementById('login-submit').innerText = i18n['login.enter']
            } else {
                window.location.href = '/'
            }
        },
        error(xmlhttp) {
            if (xmlhttp.status === 401) {
                window.location.reload()
            }
        }
    })
}

function change_password() {
    textbox({
        type: 'input-password',
        title: i18n['login.forgot-key'],
        message: i18n['login.input-new-key'],
        callback(box) {
            let password = box.password_input.value
            textbox({
                type: 'input-password',
                title: i18n['room.adminword-required'],
                message: i18n['settings.administrator-authority'],
                callback(box2) {
                    let confirm_btn = box2.confirm_btn
                    let adminword = box2.password_input.value
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
                                box2.message.textContent = json.msg
                                box2.message.style.color = 'var(--red)'
                                box2.password_input.classList.add('red')
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
    })
}

function request_admin_exists() {
    get('/admin/exist', {
        headers: {'roomid': room_id},
        success: function (xmlhttp) {
            debug(xmlhttp.responseText)
            let json = JSON.parse(xmlhttp.responseText)
            if (json.code === 0) {
                if (json.data === true) {
                    document.body.classList.add('admin-exists')
                }
                else {
                    document.body.classList.remove('admin-exists')
                }
            } else {

            }
        },
        error: function (xmlhttp) {
            if (xmlhttp.status === 401) {
                window.location.reload()
            }
        }
    })
}

