window.onload = function () {
    payment_method_i18n()

    analytics()
}

function go_back() {
    window.location.href = "/" + room_id
}

function payment_method_i18n() {
    if (curr_locale.toLowerCase() === 'zh_cn' || curr_locale.toLowerCase() === 'zh_tw') {
        document.getElementById('pay-method-wechatpay-img').src = `${baseurl}/assets/pay/wechatpay/zh_CN.svg`
    }
}

const subjects = {
    '1': {'money': 1, 'count': 1},
    '3': {'money': 3, 'count': 3},
    '5': {'money': 5, 'count': 5},
    '10': {'money': 10, 'count': 10},
    '20': {'money': 20, 'count': 20},
}

function pay() {
    let form = document.getElementById('pay-batteries-form')
    let subject = form.subject.value
    let method = form.method.value
    debug(form.subject.value)
    debug(form.method.value)
    let subject_item = subjects[subject]
    if (subject.length === 0 || method.length === 0 || subject_item == null) {
        return
    }

    let form_data = new FormData()
    form_data.append('roomid', room_id)
    form_data.append('money', subject_item['money'])
    form_data.append('count', subject_item['count'])
    form_data.append('pay_type', method)
    form_data.append('subject', 'aacell')

    post('/room/pay', {
        headers: {token: window.localStorage.getItem('token'), roomid: room_id},
        body: form_data,
        success(xmlhttp) {
            debug(xmlhttp.responseText)
            let json = JSON.parse(xmlhttp.responseText)
            if (json.code === 0) {
                let pay_form = document.getElementById('pay-form')

                let data = json.data.data
                for (const key in data) {
                    if (data.hasOwnProperty(key)) {
                        document.getElementById('pay-form-' + key).value = data[key]
                    }
                }
                pay_form.submit()
            }
        }
    })
}

