// Navigation Bar

// Back

function go_back() {
    window.location.href = "/"
}

// Subscribe

function receive_navigation_info(data) {
    let json = JSON.parse(data.body)
    debug("ws from: " + json)
    if (json.user !== null && json.user !== 0) {
        let user_count = document.getElementById('user-count-value')
        user_count.innerHTML = json.user
    }
    if (json.battery !== null && json.birth !== null && json.expiredTime) {
        update_battery(json.birth, json.battery, json.expiredTime)
    }
    if (json.order_id !== null && json.order_id === payment_order_id) {
        payment_boxes.forEach(box => {
            box.destroy()
        })
        textbox({
            type: 'text',
            title: '支付成功',
            message: '您已支付成功，感谢支持 / locale'
        })
    }
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

let battery = 100.0
let battery_timer = null
let battery_interval = null

function request_navigation_info() {
    get('/-/res/roominfo', {
        headers: {'token': window.localStorage.getItem('token'), 'roomid': room_id},
        success: function (xmlhttp) {
            let data = JSON.parse(xmlhttp.responseText).data
            debug(data)
            let birthtime = data['birth']
            let user_count = document.getElementById('user-count-value')
            user_count.innerHTML = data['user']
            let battery_count = data['battery']
            let expiredTime = data['expiredTime']
            update_battery(birthtime, battery_count, expiredTime)
        }
    })
}
let battery_life_unit = 6048 * 1000         // 1 percent of the battery life
let battery_refresh_interval = 6048 * 10    // 1 percent of the battery_life_unit
function update_battery(birthtime, battery_count, expiredTime) {
    debug(`birthtime: ${birthtime}, battery_count: ${battery_count}, expiredTime: ${expiredTime}`)
    let now = new Date().getTime()
    let battery_change_remain = (expiredTime - now) % battery_life_unit
    battery = parseFloat((expiredTime - now) / 1.0 /  battery_life_unit).toFixed(2)
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
        if (battery > 0) battery = parseFloat(battery - 0.01).toFixed(2)
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
        if (battery > 0) battery = parseFloat(battery - 0.01).toFixed(2)
        update_battery_view()
    }, battery_refresh_interval)
}

function update_battery_view() {
    if (battery <= 100)
        document.getElementById('battery-status-value').textContent = battery + '%'
    else {
        document.getElementById('battery-status-value').textContent = 'x' + parseFloat((battery / 100).toPrecision(3))
    }

    //var electric_of_battery = document.getElementById('user-img').setAttribute('class', "")
    //debug(document.getElementById('user-img'))
//    svgViewer = electric_of_battery.getSVGDocument()
//    svgRoot = svgViewer.documentElement;


//    electric_of_battery = "80px"
//    document.getElementById("user-count").setAttribute("height", electric_of_battery)



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
