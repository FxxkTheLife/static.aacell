// document.getElementById('create-room-id').addEventListener('change', function (e) {
//     let room_id_value = e.target.value
//     document.getElementById('create-room-link-anchor').href = 'https://example.com/' + room_id_value
//     document.getElementById('create-room-link-anchor').innerText = 'xxx.com/' + room_id_value
// })

window.onload = function () {
    create_room_id_changed(document.getElementById('create-room-id'))
}

function go_back() {
    window.location.href = "/"
}

function create_room_id_changed(input) {
    let room_id_value = input.value
    document.getElementById('create-room-link-anchor').href = window.location.origin + '/' + room_id_value
    document.getElementById('create-room-link-anchor').innerText = window.location.host + '/' + room_id_value
}

// CREATE ROOM

function go_create() {
    let create_room_id = document.getElementById('create-room-id').value
    debug(create_room_id)
    let adminword = document.getElementById('create-room-admin-password').value
    let password = document.getElementById('create-room-join-password').value

    let only_num_alpha = /^[0-9a-zA-Z]*$/;
    if (!only_num_alpha.test(create_room_id)) {
        document.getElementById('error-message').innerText = i18n['create.roomid-must-valid']
        document.getElementById('error-message').classList.remove('hidden')
        document.getElementById('create-room-id').classList.add('red')
        return
    }

    document.getElementById('create-room-submit').disabled = true
    document.getElementById('create-room-submit').innerText = i18n['create.creating']

    let form_data = new FormData()
    form_data.append('roomid', create_room_id)
    form_data.append('adminword', adminword)
    form_data.append('password', password)

    post('/room/create', {
        body: form_data,
        success: function (xmlhttp) {
            debug(xmlhttp.responseText)
            let json = JSON.parse(xmlhttp.responseText)
            if (json.code === 0) {
                window.location.href = '/' + create_room_id
            } else if (json.code === -1) {
                document.getElementById('error-message').innerText = json.msg
                document.getElementById('error-message').classList.remove('hidden')
            }

            document.getElementById('create-room-submit').disabled = false
            document.getElementById('create-room-submit').innerText = i18n['create.create']
        }
    })
}
