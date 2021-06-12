// Navigation Bar

// Back

function go_back() {
    window.location.href = "/"
}

// Share

let qrcode;

function update_share_qrcode() {
    const curr_link = window.location.href
    document.getElementById('share-div-link-input').value = curr_link

    if (qrcode !== undefined) {
        document.getElementById('qrcode').innerHTML = ''
        qrcode.clear()
    }

    qrcode = new QRCode(document.getElementById('qrcode'), {
        text: curr_link,
        width: 160,
        height: 160,
        colorDark: getComputedStyle(document.body).getPropertyValue('--foreground'),
        colorLight: getComputedStyle(document.body).getPropertyValue('--background')
    })
}

function copy_share_link() {
    document.getElementById('share-div-link-input').select()
    document.execCommand('copy')
}

function share_link_clicked() {
    document.getElementById('share-div').classList.toggle('invisible')
}

function hide_share_div() {
    document.getElementById('share-div').classList.add('invisible')
}

// Battery

let battery = 100
let battery_timer = null
let battery_interval = null

function request_navigation_info() {
    get('/-/res/roominfo', {
        headers: {'token': window.localStorage.getItem('token'), 'roomid': room_id},
        success: function (xmlhttp) {
            let data = JSON.parse(xmlhttp.responseText).data
            let birthtime = data['birth']
            let user_count = document.getElementById('user-count-value')
            user_count.innerHTML = data['user']
            let battery_count = data['battery']
            update_battery(birthtime, battery_count)
        }
    })
}

function update_battery(birthtime, battery_count) {
    let now = new Date().getTime()
    let battery_change_remain = (birthtime + 604800 * 1000 * battery_count - now) % (6048 * 1000)
    battery = Math.floor((birthtime + 604800 * 1000 * battery_count - now) / (6048 * 1000)) + 1
    update_battery_view()
    if (battery_timer !== null) {
        clearTimeout(battery_timer)
        battery_timer = null
    }
    if (battery_interval !== null) {
        clearInterval(battery_interval)
        battery_interval = null
    }
    battery_timer = setTimeout(function () {
        if (battery > 0) battery -= 1
        update_battery_view()
        set_battery_interval()
    }, battery_change_remain)
}

function set_battery_interval() {
    if (battery_interval !== null) {
        clearInterval(battery_interval)
        battery_interval = null
    }
    battery_interval = setInterval(function () {
        if (battery > 0) battery -= 1
        update_battery_view()
    }, 6048 * 1000)
}

function update_battery_view() {
    if (battery <= 100)
        document.getElementById('battery-status-value').textContent = battery + '%'
    else {
        document.getElementById('battery-status-value').textContent = 'x' + parseFloat((battery / 100).toPrecision(3))
    }

    if (battery >= 87.5) {
        document.getElementById('battery-status').style.backgroundColor = 'var(--clear-green)'
        document.getElementById('battery-status-value').style.color = 'var(--green)'
        document.getElementById('battery-status-img').src = `${baseurl}/assets/room/battery-100.svg`
    } else if (battery >= 62.5) {
        document.getElementById('battery-status').style.backgroundColor = 'var(--clear-green)'
        document.getElementById('battery-status-value').style.color = 'var(--green)'
        document.getElementById('battery-status-img').src = `${baseurl}/assets/room/battery-75.svg`
    } else if (battery >= 37.5) {
        document.getElementById('battery-status').style.backgroundColor = 'var(--clear-green)'
        document.getElementById('battery-status-value').style.color = 'var(--green)'
        document.getElementById('battery-status-img').src = `${baseurl}/assets/room/battery-50.svg`
    } else if (battery >= 12.5) {
        document.getElementById('battery-status').style.backgroundColor = 'var(--clear-yellow)'
        document.getElementById('battery-status-value').style.color = 'var(--yellow)'
        document.getElementById('battery-status-img').src = `${baseurl}/assets/room/battery-25.svg`
    } else {
        document.getElementById('battery-status').style.backgroundColor = 'var(--clear-red)'
        document.getElementById('battery-status-value').style.color = 'var(--red)'
        document.getElementById('battery-status-img').src = `${baseurl}/assets/room/battery-0.svg`
    }
    if (battery <= 0) {
        ws_disconnect()
        textbox({
            type: 'no-cancel',
            title: i18n['room.room-disconnected'],
            message: i18n['room.room-battery-is-exhausted'],
            callback: function () {
                window.location.reload()
            }
        })
    }
}
