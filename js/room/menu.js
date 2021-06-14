
let all_categories = []
let curr_style = 'default'
let all_style = ['default', 'neumorphic']

// style

function load_style() {
    let style = window.localStorage.getItem('style')
    if (style !== null)
        curr_style = style
    update_style()
}

function update_style() {
    all_style.forEach(style => {
        document.body.classList.remove('style-' + style)
    })
    document.body.classList.add('style-' + curr_style)
    window.localStorage.setItem('style', curr_style)
    update_share_qrcode()
}

function style_btn_clicked() {
    let index = all_style.indexOf(curr_style)
    if (index !== -1)
        curr_style = all_style[(index + 1) % all_style.length]
    update_style()
}


// menu

function menu_close_clicked() {
    document.getElementById('menu-div').classList.add('invisible')
}


function request_category() {
    get('/-/res/room/categories', {
        headers: {'token': window.localStorage.getItem('token'), 'roomid': room_id},
        success(xmlhttp) {
            debug(xmlhttp.responseText)

            let json = JSON.parse(xmlhttp.responseText)
            if (json.code === 0) {
                let data = json.data
                if (data === null) {
                    return
                }
                all_categories = data
                sort_categories()
                update_category_list()
            }
        }
    })
}

function update_category_list() {
    let category_list = document.getElementById('category-list')
    category_list.innerHTML = category_item({'name': ''})
    for (let category of all_categories) {
        category_list.innerHTML += category_item(category)
    }
}

function category_item(json) {
    let name = json['name']
    let base64_name = Base64.encode(name)

    return `
    <li id="category-item-${base64_name}" onclick="category_item_clicked(this, '${base64_name}')" class="${name === curr_category ? 'category-selected' : ''}">
        <div class="category-title-div">
            <img src="${baseurl}/assets/room/${get_category_icon(name)}"/>
            <span>${name === '' ? i18n['room.category-public'] : htmlencode(name)}</span>
        </div>
        <div class="category-btn-div" style="${name === '' ? 'display: none;' : ''}">
            <button><img src="${baseurl}/assets/room/pen.svg" class="category-rename-btn" onclick="rename_category('${base64_name}')"></button>
            <button><img src="${baseurl}/assets/room/delete.svg" class="category-delete-btn" onclick="delete_category('${base64_name}')"></button>
        </div>
    </li>
    `
}

function sort_categories() {
    all_categories.sort(function (data1, data2) {
        if (data1['date'] > data2['date']) return 1
        else if (data1['date'] < data2['date']) return -1
        return 0
    })
}

function delete_listed_category(name) {
    all_files[name] = []
    let index = all_categories.findIndex(function (data) {
        return data['name'] === name
    })
    if (index === -1) return
    if (curr_category === name) {
        document.getElementById('category-item-').click() // back to public area
    }
    all_categories.splice(index, 1)
    document.getElementById('category-item-' + Base64.encode(name)).remove()
}

function category_item_clicked(item, base64_name) {
    let name = Base64.decode(base64_name)
    if (name === curr_category)
        return
    Array.from(document.getElementsByClassName('category-selected')).forEach(ele => {
        ele.classList.remove('category-selected')
    })
    item.classList.add('category-selected')
    clear_all_file_selection()
    curr_category = name
    sort_files()
    update_file_list()
    menu_close_clicked()
}

function create_category() {
    textbox({
        type: 'input',
        title: i18n['room.new-category'],
        message: i18n['room.menu-input-category-name'],
        callback(box) {
            let confirm_btn = box.confirm_btn
            let value = box.text_input.value
            let form_data = new FormData()
            form_data.append('category', Base64.encode(value));
            post('/-/res/room/category/create', {
                headers: {'token': window.localStorage.getItem('token'), 'roomid': room_id},
                body: form_data,
                success(xmlhttp) {
                    debug(xmlhttp.responseText)
                    let json = JSON.parse(xmlhttp.responseText)
                    if (json.code === 0) {
                        box.destroy()
                    } else if (json.code === -1) {
                        box.message.textContent = json.msg
                        box.message.style.color = 'var(--red)'
                        box.text_input.classList.add('red')
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

function create_category_btn_clicked() {
    create_category()
}

function rename_category(base64_category_name) {
    textbox({
        type: 'input',
        title: i18n['room.rename-category'],
        message: i18n['room.menu-input-category-name'],
        default: Base64.decode(base64_category_name),
        callback(box) {
            let confirm_btn = box.confirm_btn
            let value = box.text_input.value
            let form_data = new FormData()
            form_data.append('category', base64_category_name);
            form_data.append('newname', Base64.encode(value));
            post('/-/res/room/category/rename', {
                headers: {'token': window.localStorage.getItem('token'), 'roomid': room_id},
                body: form_data,
                success(xmlhttp) {
                    debug(xmlhttp.responseText)
                    let json = JSON.parse(xmlhttp.responseText)
                    if (json.code === 0) {
                        box.destroy()
                    } else if (json.code === -1) {
                        box.message.textContent = json.msg
                        box.message.style.color = 'var(--red)'
                        box.text_input.classList.add('red')
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

function delete_category(base64_category_name) {
    textbox({
        type: 'input-password',
        title: i18n['room.adminword-required'],
        message: i18n['settings.administrator-authority'],
        callback(box) {
            let confirm_btn = box.confirm_btn
            let adminword = box.password_input.value
            let form_data = new FormData()
            form_data.append('category', base64_category_name);
            post('/-/res/room/category/delete', {
                headers: {
                    'token': window.localStorage.getItem('token'),
                    'roomid': room_id,
                    'adminword': adminword
                },
                body: form_data,
                success(xmlhttp) {
                    debug(xmlhttp.responseText)
                    let json = JSON.parse(xmlhttp.responseText)
                    if (json.code === 0) {
                        box.destroy()
                    } else if (json.code === -1) {
                        box.message.textContent = json.msg
                        box.message.style.color = 'var(--red)'
                        box.password_input.classList.add('red')
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
