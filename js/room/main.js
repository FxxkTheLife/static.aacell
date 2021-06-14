debug(room_id)

let admin_exists = false

window.onload = function (ev) {
    document.getElementById('menu-settings-btn').href = '/' + room_id + '/settings'
    document.getElementById('navigation-bar-cell-id-span').innerHTML = room_id
    add_file_paste()
    load_local_layout()
    load_style()

    connect(function () {

    })

    analytics()
}

window.onclick = function (ev) {
    file_list_deselect_clicked(ev.target)
}

window.onmousedown = function (ev) {
    close_message_click_down(ev.target)
}


// Messages & Files

// Tabs

let current_tab = 'files'

function content_menu_tab_onclick() {
    content_tab_onclick('files')
    document.getElementById('menu-div').classList.toggle('invisible')
}

function content_tab_onclick(tab) {
    if (tab === current_tab) {
        return
    }
    current_tab = tab
    switch (tab) {
        case 'files':
            document.getElementById('content-file-tab').classList.add('active')
            document.getElementById('content-message-tab').classList.remove('active')
            document.getElementById('file-div').classList.remove('inactive')
            document.getElementById('message-div').classList.add('inactive')
            break
        case 'messages':
            document.getElementById('menu-div').classList.add('invisible')
            document.getElementById('content-file-tab').classList.remove('active')
            document.getElementById('content-message-tab').classList.add('active')
            document.getElementById('file-div').classList.add('inactive')
            document.getElementById('message-div').classList.remove('inactive')
            message_red_dot_off()
            break
    }
}

// Admin allowed

function request_admin_exists() {
    get('/admin/exist', {
        headers: {'roomid': room_id},
        success: function (xmlhttp) {
            debug(xmlhttp.responseText)
            let json = JSON.parse(xmlhttp.responseText)
            if (json.code === 0) {
                if (json.data === true) {
                    admin_exists = true
                    document.body.classList.add('admin-exists')
                }
                else {
                    admin_exists = false
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


