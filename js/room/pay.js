

const subjects = {
    '1': {'money': 1, 'count': 1.00},
    '3': {'money': 3, 'count': 3.00},
    '5': {'money': 5, 'count': 5.00},
    '10': {'money': 10, 'count': 10.00},
    '20': {'money': 20, 'count': 20.00},
}

let wechatpay_src = `${baseurl}/assets/pay/wechatpay/universal.svg`
if (curr_locale.toLowerCase() === 'zh_cn' || curr_locale.toLowerCase() === 'zh_tw') {
    wechatpay_src = `${baseurl}/assets/pay/wechatpay/zh_CN.svg`
}

const pay_method_logo_src = {
    'alipay': `${baseurl}/assets/pay/alipay/universal.png`,
    'wechatpay': wechatpay_src
}

const pay_html = `
<div id="pay-batteries-wrapper">
    <form id="pay-batteries-form">
    <div id="pay-subject-div">
        <label class="pay-subject-item">
            <input type="radio" name="subject" value="1">
            <span class="pay-subject-content-wrapper">
                <img src="${baseurl}/assets/pay/battery.svg" alt="1"/>
                <span>1 块电池<br>7 天</span>
                <span class="price">¥ 1</span>
            </span>
        </label>
        <label class="pay-subject-item">
            <input type="radio" name="subject" value="3">
            <span class="pay-subject-content-wrapper">
                <img src="${baseurl}/assets/pay/battery-3.svg" alt="3"/>
                <span>3 块电池<br>21 天</span>
                <span class="price">¥ 3</span>
            </span>
        </label>
        <label class="pay-subject-item">
            <input type="radio" name="subject" value="5">
            <span class="pay-subject-content-wrapper">
                <img src="${baseurl}/assets/pay/battery-5.svg" alt="5"/>
                <span>5 块电池<br>35 天</span>
                <span class="price">¥ 5</span>
            </span>
        </label>
        <label class="pay-subject-item">
            <input type="radio" name="subject" value="10">
            <span class="pay-subject-content-wrapper">
                <img src="${baseurl}/assets/pay/battery-10.svg" alt="3"/>
                <span>10 块电池<br>70 天</span>
                <span class="price">¥ 10</span>
            </span>
        </label>
        <label class="pay-subject-item">
            <input type="radio" name="subject" value="20">
            <span class="pay-subject-content-wrapper">
                <img src="${baseurl}/assets/pay/battery-20.svg" alt="20"/>
                <span>20 块电池<br>140 天</span>
                <span class="price">¥ 20</span>
            </span>
        </label>
    </div>
<!--    <span id="payment-method-text">${i18n['pay.payment-method']}</span>-->
    
    </form>
</div>`

const pay_method_html = `
<form id="pay-method-form">
    <div id="pay-batteries-method">
        <label id="pay-method-alipay" class="pay-subject-item">
            <input type="radio" name="method" value="alipay">
            <span class="pay-subject-content-wrapper">
                <img src="${pay_method_logo_src['alipay']}" alt="alipay"/>
            </span>
        </label>
        <label id="pay-method-wechatpay" class="pay-subject-item">
            <input type="radio" name="method" value="wechatpay">
            <span class="pay-subject-content-wrapper">
                <img id="pay-method-wechatpay-img" src="${wechatpay_src}" alt="wechatpay"/>
            </span>
        </label>
    </div>
</form>`

function pay_qrcode_html(method, qrcode_src, money, original_price) {
    return `
<div class="pay-qrcode-wrapper">
    <img src="${pay_method_logo_src[method]}" class="pay-method-logo"/>
    <span>请支付 ${money}<span class="line">${original_price}</span></span>
    <img src="${qrcode_src}" class="pay-qrcode-img">
</div>
`
}

var payment_order_id;
var payment_boxes = []


function make_payment() {

    if (document.getElementById('pay-batteries-wrapper') != null)
        return

    textbox({
        type: 'custom',
        title: i18n['pay.pay-battery'],
        width: '900px',
        html: pay_html,
        callback(battery_box) {
            let form = document.getElementById('pay-batteries-form')
            let subject = form.subject.value
            debug(form.subject.value)
            let subject_item = subjects[subject]
            if (subject.length === 0 || subject_item == null) {
                return false
            }

            textbox({
                type: 'custom',
                title: i18n['pay.payment-method'],
                message: `购入 ${subject_item['count']} 块电池`,
                button_text: i18n['pay.pay'],
                html: pay_method_html,
                callback(method_box) {
                    let confirm_btn = method_box.confirm_btn
                    let form = document.getElementById('pay-method-form')
                    let method = form.method.value
                    debug(form.method.value)
                    if (method.length === 0) {
                        return false
                    }

                    pay(subject_item, method,
                        function (data) {
                            confirm_btn.innerHTML = i18n['room.confirm']
                            confirm_btn.disabled = false
                            const qrcode_src = {
                                'alipay': data['zfbcode'],
                                'wechatpay': data['wxcode']
                            }
                            let qrcode_box = textbox({
                                type: 'custom',
                                title: i18n['pay.pay'],
                                html: pay_qrcode_html(method, qrcode_src[method], '¥ ' + data['price'], parseFloat(data['price']) === subject_item['money'] ? '' : '¥ ' + subject_item['money']),
                                has_btn: false
                            })
                            payment_order_id = data['orderId']
                            payment_boxes = [qrcode_box, method_box, battery_box]
                        },
                        function (json) {
                            confirm_btn.innerHTML = i18n['room.confirm']
                            confirm_btn.disabled = false
                    })
                    confirm_btn.innerHTML = i18n['room.please-wait']
                    confirm_btn.disabled = true
                    return false;
                }
            })
            return false
        }
    })
}



function pay(subject_item, method, success=function (){}, fail=function (){}) {

    let form_data = new FormData()
    form_data.append('roomid', room_id)
    form_data.append('money', subject_item['money'])
    form_data.append('count', subject_item['count'])
    // form_data.append('pay_type', method)
    form_data.append('subject', 'aacell')

    post('/room/pay/order', {
        headers: {token: window.localStorage.getItem('token'), roomid: room_id},
        body: form_data,
        success(xmlhttp) {
            debug(xmlhttp.responseText)
            let json = JSON.parse(xmlhttp.responseText)
            debug(json)
            if (json.code === 0) {
                let data = json.data
                if (data.code === '10001') {
                    success(data)
                } else {
                    fail(data)
                }

                // let pay_form = document.getElementById('pay-form')

                // let data = json.data.data
                // for (const key in data) {
                //     if (data.hasOwnProperty(key)) {
                //         document.getElementById('pay-form-' + key).value = data[key]
                //     }
                // }
                //pay_form.submit()
            }
        }
    })
}
