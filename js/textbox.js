// function add_textbox() {
//     let box = document.createElement('div')
//     box.id = 'text-box-div'
//     box.classList.add('gradient', 'invisible')
//     box.innerHTML = `
//     <div id="text-box-shelter"></div>
//     <div id="text-box" class="gradient invisible scale">
//         <div id="text-box-navigation">
//             <span id="text-box-title"></span>
//             <button id="text-box-cancel" class="" onclick="hide_textbox()">
//                 <img src="${baseurl}/assets/room/x.svg" alt="x"/>
//             </button>
//         </div>
//         <div id="text-box-content"></div>
//     </div>
//     `
//     document.body.appendChild(box)
// }
//
// function hide_textbox() {
//     document.getElementById('text-box-div').classList.add('invisible')
//     document.getElementById('text-box').classList.add('invisible')
//     document.getElementById('text-box-password-input').blur()
// }
//
// function show_textbox(callback) {
//     document.getElementById('text-box-div').classList.remove('invisible')
//     document.getElementById('text-box').classList.remove('invisible')
//     if (typeof callback === "function")
//         callback()
// }
//
// let textbox_callback = null
//
// function textbox_submit_btn_clicked() {
//     if (typeof textbox_callback === 'function') {
//         if (textbox_callback())
//             hide_textbox()
//     }
//     else
//         hide_textbox()
// }
//
// function textbox(data) {
//     if (data.title !== undefined)
//         document.getElementById('text-box-title').textContent = data.title
//     if (typeof data.callback === "function")
//         textbox_callback = data.callback
//     let text_box_content = document.getElementById('text-box-content')
//     let content = ''
//     if (data.type !== undefined) {
//         switch (data.type) {
//             case "text":
//                 break
//             case "no-cancel":
//                 document.getElementById('text-box-cancel').classList.add('hidden')
//                 break
//             case "input":
//                 content = `<input type="text" maxlength="32" id="text-box-text-input" class="text-input" onkeypress="if (event.keyCode === 13){textbox_submit_btn_clicked()}" value="${data.default !== undefined ? data.default : ''}">`
//                 break
//             case "input-password":
//                 content = `
//             <input type="password" maxlength="20" id="text-box-password-input" class="text-input" onkeypress="if (event.keyCode === 13){textbox_submit_btn_clicked()}">
//             `
//                 break
//             case "option":
//                 let options = typeof data.options === "object" ? data.options : []
//                 let option_html = ''
//                 for (const option of options) {
//                     let selected = ''
//                     if (data.default !== undefined && data.default === option['name']) selected = 'selected'
//                     option_html += `<option ${selected} value="${option['value']}">${htmlencode(option['name'])}</option>`
//                 }
//                 content = `<select id="text-box-select" class="text-input">${option_html}</select>`
//                 break
//         }
//     }
//
//
//     text_box_content.innerHTML = `
//     <span id="text-box-message">${data.message !== undefined ? htmlencode(data.message) : ''}</span>
//     ${content}
//     <div id="text-box-btn-div">
//         <button id="text-box-confirm-btn" class="submit-btn" onclick="textbox_submit_btn_clicked()">${data.button_text !== undefined ? htmlencode(data.button_text) : i18n['room.confirm']}</button>
//     </div>
//     `
//     show_textbox(function () {
//         switch (data.type) {
//             case 'input':
//                 document.getElementById('text-box-text-input').focus()
//                 break
//             case 'input-password':
//                 document.getElementById('text-box-password-input').focus()
//                 break
//             default:
//                 break
//         }
//     })
// }


var all_textbox = {}

function generate_id() {
    let now              = new Date().getTime()
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < 6; i++ ) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return now + result;
}

class TextBox {
    id;
    get id() {
        return this.id
    }

    type;
    get type() {
        return this.type
    }

    destroyed = false;
    get destroyed() {
        return this.destroyed
    }

    div;
    get div() {
        return this.div
    }

    get shelter() {
        return document.getElementById(`text-box-${this.id}-shelter`)
    }
    get box() {
        return document.getElementById(`text-box-${this.id}`)
    }
    get navigation() {
        return document.getElementById(`text-box-${this.id}-navigation`)
    }
    get title() {
        return document.getElementById(`text-box-${this.id}-title`)
    }
    get cancel() {
        return document.getElementById(`text-box-${this.id}-cancel`)
    }
    get content() {
        return document.getElementById(`text-box-${this.id}-content`)
    }

    get message() {
        return document.getElementById(`text-box-${this.id}-message`)
    }
    get btn_div() {
        return document.getElementById(`text-box-${this.id}-btn-div`)
    }
    get confirm_btn() {
        return document.getElementById(`text-box-${this.id}-confirm-btn`)
    }
    get text_input() {
        return document.getElementById(`text-box-${this.id}-text-input`)
    }
    get password_input() {
        return document.getElementById(`text-box-${this.id}-password-input`)
    }
    get select() {
        return document.getElementById(`text-box-${this.id}-select`)
    }

    callback = function (){return true};


    constructor(data) {
        let id = generate_id()
        this.id = id

        let data_res = this.set(data)

        let div = document.createElement('div')
        div.id = `text-box-${id}-div`
        div.classList.add('text-box-div')
        div.innerHTML = `
        <div id="text-box-${id}-shelter" class="text-box-shelter"></div>
        <div id="text-box-${id}" class="text-box" style="${typeof data.width === "undefined" ? '' : 'width: ' + data.width}">
            <div id="text-box-${id}-navigation" class="text-box-navigation">
                <span id="text-box-${id}-title" class="text-box-title">${htmlencode(data_res['title'] || '')}</span>
                <button id="text-box-${id}-cancel" class="text-box-cancel ${data_res['cancel-hidden'] || ''}" onclick="all_textbox['${id}'].destroy()">
                    <img src="${baseurl}/assets/room/x.svg" alt="x"/>
                </button>
            </div>
            <div id="text-box-${id}-content" class="text-box-content">
                ${data_res['content']}
            </div>
        </div>
        `
        this.div = div
        all_textbox[id] = this
    }

    set(data) {
        let res = {}
        if (typeof data.title !== "undefined")
            res['title'] = data.title
        if (typeof data.callback === "function")
            this.callback = data.callback
        // let text_box_content = this.content
        let content = ''
        if (typeof data.type !== "undefined") {
            this.type = data.type
            switch (data.type) {
                case "text":
                    break
                case "no-cancel":
                    res['cancel-hidden'] = 'hidden'
                    break
                case "input":
                    content = `<input type="text" maxlength="32" id="text-box-${this.id}-text-input" class="text-input" onkeypress="if (event.keyCode === 13){all_textbox['${this.id}'].submit_btn_clicked()}" value="${typeof data.default !== 'undefined' ? data.default : ''}">`
                    break
                case "input-password":
                    content = `
            <input type="password" maxlength="20" id="text-box-${this.id}-password-input" class="text-input" onkeypress="if (event.keyCode === 13){all_textbox['${this.id}'].submit_btn_clicked()}">
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
                    content = `<select id="text-box-${this.id}-select" class="text-input">${option_html}</select>`
                    break
                case "custom":
                    let html = typeof data.html !== "undefined" ? data.html : ''
                    content = html
                    break
            }
        }

        let btn_div = (typeof data.has_btn !== "undefined" && !data.has_btn) ? '' : `
        <div id="text-box-${this.id}-btn-div" class="text-box-btn-div">
            <button id="text-box-${this.id}-confirm-btn" class="submit-btn" onclick="all_textbox['${this.id}'].submit_btn_clicked()">${data.button_text !== undefined ? htmlencode(data.button_text) : i18n['room.confirm']}</button>
        </div>
        `

        res['content'] = `
        <span id="text-box-${this.id}-message" class="text-box-message">${data.message !== undefined ? htmlencode(data.message) : ''}</span>
        ${content}
        ${btn_div}
        `
        return res
    }

    submit_btn_clicked() {
        if (typeof this.callback === 'function') {
            if (this.callback(this) === true) this.destroy()
        }
        else
            this.destroy()
    }

    show() {
        document.body.appendChild(this.div)

        switch (this.type) {
            case 'input':
                this.text_input.focus()
                break
            case 'input-password':
                this.password_input.focus()
                break
        }
    }

    hide() {
        this.div.classList.add('invisible')

        switch (this.type) {
            case 'input':
                this.text_input.blur()
                break
            case 'input-password':
                this.password_input.blur()
                break
        }
    }

    destroy() {
        if (this.destroyed)
            return
        this.destroyed = true
        this.hide()
        setTimeout(() => {
            this.div.remove()
            delete all_textbox[this.id]
        }, 300)
    }
}


function textbox(data={}) {
    let t = new TextBox(data)
    t.show()
    return t
}

