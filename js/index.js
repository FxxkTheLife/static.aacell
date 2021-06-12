debug(curr_locale)

window.onload = function () {
    document.getElementById('room-id-input').focus()

    analytics()
}

window.onresize = function () {
}

debug('ready')
for (let ele of document.getElementById('i18n-select').getElementsByTagName('option')) {
    if (ele.value.toLowerCase() === curr_locale.toLowerCase()) {
        ele.selected = 'selected'
    }
}
document.getElementById('i18n-select').addEventListener('change', function (e) {
    let locale = document.getElementById('i18n-select').value
    debug(locale)
    get('/locale/switch?lang=' + locale, {
        success: function (xmlhttp) {
            let json = JSON.parse(xmlhttp.responseText)
            if (json.code === 0) {
                window.location.href = '/'
            }
        }
    })
})

function search_btn_clicked() {
    let roomid = document.getElementById('room-id-input').value
    debug(roomid)

    let only_num_alpha = /^[0-9a-zA-Z]*$/;
    if (!only_num_alpha.test(roomid)) {
        input_error(i18n['create.roomid-must-valid'])
        return
    }
    debug(roomid.length)
    if (roomid.length === 0) {
        window.location.href = '/room/random'
        return;
    }
    window.location.href = '/' + roomid
}

function input_error(msg) {
    document.getElementById('room-id-input').style.backgroundColor = 'var(--clear-red)'
    document.getElementById('room-id-input').style.border = '2px solid rgb(255, 59, 48)'
    document.getElementById('room-id-input').style.setProperty('--room-id-input-shadow', '0 5px 20px rgba(255, 59, 48, 0.15)')
    document.getElementById('room-id-input').style.setProperty('--room-id-input-hover-shadow', '0 5px 40px rgba(255, 59, 48, 0.2)')
    document.getElementById('search-bar-msg').innerText = msg
    document.getElementById('search-bar-msg').style.color = 'var(--red)'
}

function search_input_changed(input) {
    if (input.value.length === 0) {
        document.getElementById('search-submit-btn').textContent = i18n['index.create-randomly']
        document.getElementById('search-submit-btn').classList.add('submit-btn')
        document.getElementById('search-submit-btn').classList.remove('cancel-btn')
    } else {
        document.getElementById('search-submit-btn').textContent = i18n['index.create-or-join']
        document.getElementById('search-submit-btn').classList.add('cancel-btn')
        document.getElementById('search-submit-btn').classList.remove('submit-btn')
    }
}

// function calculate_submit_hint() {
//     let submit_btn = document.getElementById('search-submit-btn')
//     let submit_btn_hint = document.getElementById('search-submit-btn-hint')
//     let y = submit_btn.offsetTop + submit_btn.offsetHeight + 20
//     let x = submit_btn.offsetLeft + submit_btn.offsetWidth / 2.0 - submit_btn_hint.offsetWidth
//     submit_btn_hint.style.top = y.toString() + 'px'
//     submit_btn_hint.style.left = x.toString() + 'px'
//     submit_btn_hint.src = '/assets/home/submit-hint/' + curr_locale + '.svg'
//     search_input_changed(document.getElementById('room-id-input'))
// }
