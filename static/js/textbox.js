function add_textbox() {
    let box = document.createElement('div')
    box.id = 'text-box-div'
    box.classList.add('gradient', 'invisible')
    box.innerHTML = `
    <div id="text-box-shelter"></div>
    <div id="text-box" class="gradient invisible scale">
        <div id="text-box-navigation">
            <span id="text-box-title"></span>
            <button id="text-box-cancel" class="" onclick="hide_textbox()">
                <img src="/assets/room/x.svg" alt="x"/>
            </button>
        </div>
        <div id="text-box-content"></div>
    </div>
    `
    document.body.appendChild(box)
}

function hide_textbox() {
    document.getElementById('text-box-div').classList.add('invisible')
    document.getElementById('text-box').classList.add('invisible')
    document.getElementById('text-box-password-input').blur()
}

function show_textbox(callback) {
    document.getElementById('text-box-div').classList.remove('invisible')
    document.getElementById('text-box').classList.remove('invisible')
    if (typeof callback === "function")
        callback()
}

let textbox_callback = null

function textbox_submit_btn_clicked() {
    if (typeof textbox_callback === 'function') {
        if (textbox_callback())
            hide_textbox()
    }
    else
        hide_textbox()
}

function textbox(data) {
    if (data.title !== undefined)
        document.getElementById('text-box-title').textContent = data.title
    if (typeof data.callback === "function")
        textbox_callback = data.callback
    let text_box_content = document.getElementById('text-box-content')
    let content = ''
    if (data.type !== undefined) {
        switch (data.type) {
            case "text":
                break
            case "no-cancel":
                document.getElementById('text-box-cancel').classList.add('hidden')
                break
            case "input":
                content = `<input type="text" maxlength="32" id="text-box-text-input" class="text-input" onkeypress="if (event.keyCode === 13){textbox_submit_btn_clicked()}" value="${data.default !== undefined ? data.default : ''}">`
                break
            case "input-password":
                content = `
            <input type="password" maxlength="20" id="text-box-password-input" class="text-input" onkeypress="if (event.keyCode === 13){textbox_submit_btn_clicked()}">
            `
                break
            case "option":
                let options = typeof data.options === "object" ? data.options : []
                let option_html = ''
                for (const option of options) {
                    let selected = ''
                    if (data.default !== undefined && data.default === option['name']) selected = 'selected'
                    option_html += `<option ${selected} value="${option['value']}">${htmlencode(option['name'])}</option>`
                }
                content = `<select id="text-box-select" class="text-input">${option_html}</select>`
                break
        }
    }


    text_box_content.innerHTML = `
    <span id="text-box-message">${data.message !== undefined ? htmlencode(data.message) : ''}</span>
    ${content}
    <div id="text-box-btn-div">
        <button id="text-box-confirm-btn" class="submit-btn" onclick="textbox_submit_btn_clicked()">${data.button_text !== undefined ? htmlencode(data.button_text) : i18n['room.confirm']}</button>
    </div>
    `
    show_textbox(function () {
        switch (data.type) {
            case 'input':
                document.getElementById('text-box-text-input').focus()
                break
            case 'input-password':
                document.getElementById('text-box-password-input').focus()
                break
            default:
                break
        }
    })
}

