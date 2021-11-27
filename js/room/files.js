// Files

// Store the origin filenames.
var all_files = {}

let current_file_layout = 'list'
const all_files_layout = ['list', 'grid']

// Store the base64-encoded filenames.
let curr_category = ''
let selected_files = new Set()
let is_multi_choice = false
let is_selected_all = false


// File layout

function update_file_layout() {
    for (const layout of all_files_layout) {
        document.getElementById('menu-file-layout-' + layout).classList.remove('active')
        document.getElementById('file-list-wrapper').classList.remove('file-layout-' + layout)
    }
    document.getElementById('menu-file-layout-' + current_file_layout).classList.add('active')
    document.getElementById('file-list-wrapper').classList.add('file-layout-' + current_file_layout)
    window.localStorage.setItem('layout', current_file_layout)
}

function file_layout_btn_clicked(btn) {
    if (current_file_layout === btn.value) {
        return
    }
    current_file_layout = btn.value
    update_file_layout()
}

function load_local_layout() {
    let layout = window.localStorage.getItem('layout')
    if (layout !== null)
        current_file_layout = layout
    update_file_layout()
}


// File Selection

function file_list_deselect_clicked(target) {
    if (target.localName === 'html' || target.id === 'file-div' || target.id === 'file-list-wrapper' || target.id === 'file-list') {
        if (!is_multi_choice)
            clear_all_file_selection()
    }
}

function file_multi_choice_clicked() {
    if (is_multi_choice && selected_files.size > 1) {
        clear_all_file_selection()
    }
    multi_choice_btn_on(!is_multi_choice)
}

function select_all_files_clicked() {
    if (is_selected_all) {
        clear_all_file_selection()
    } else {
        select_all_files()
    }
}

function multi_choice_btn_on(is_on) {
    is_multi_choice = is_on
    let multi_choice_btn = document.getElementById('file-batch-processing-multi-choice-btn')
    if (is_on) {
        multi_choice_btn.classList.add('active')
    }
    else {
        multi_choice_btn.classList.remove('active')
    }
    update_file_batch_processing_btn()
}

function update_file_batch_processing_btn() {
    if (is_multi_choice) {
        document.getElementById('file-batch-processing-select-all-btn').classList.remove('invisible')
    } else {
        document.getElementById('file-batch-processing-select-all-btn').classList.add('invisible')
    }

    let multi_choice_btn = document.getElementById('file-batch-processing-multi-choice-btn')
    let select_all_btn = document.getElementById('file-batch-processing-select-all-btn')

    if (selected_files.size > 0) {
        multi_choice_btn.classList.remove('right-edge-item')
        select_all_btn.classList.remove('right-edge-item')
        document.getElementById('file-batch-processing-download-btn').classList.remove('invisible')
        document.getElementById('file-batch-processing-delete-btn').classList.remove('invisible')
        document.getElementById('file-batch-processing-move-btn').classList.remove('invisible')
        if (is_width_compact()) {
            document.getElementById('file-input-text').classList.add('invisible')
        }
    } else {
        if (is_multi_choice) {
            multi_choice_btn.classList.remove('right-edge-item')
            select_all_btn.classList.add('right-edge-item')
        }
        else multi_choice_btn.classList.add('right-edge-item')

        document.getElementById('file-batch-processing-download-btn').classList.add('invisible')
        document.getElementById('file-batch-processing-delete-btn').classList.add('invisible')
        document.getElementById('file-batch-processing-move-btn').classList.add('invisible')
        if (is_width_compact()) {
            document.getElementById('file-input-text').classList.remove('invisible')
        }
    }
}

function select_all_btn_on(is_on) {
    is_selected_all = is_on
    let select_all_btn = document.getElementById('file-batch-processing-select-all-btn')
    if (is_on)
        select_all_btn.classList.add('active')
    else
        select_all_btn.classList.remove('active')
    select_all_btn.classList.add(is_on ? 'on' : 'off')
    select_all_btn.classList.remove(is_on ? 'off' : 'on')
}

function clear_all_file_selection() {
    select_all_btn_on(false)
    selected_files.clear()
    Array.from(document.getElementsByClassName('file-expand')).forEach(ele => {
        ele.classList.remove('file-expand')
    })
    Array.from(document.getElementsByClassName('file-selected')).forEach(ele => {
        ele.classList.remove('file-selected')
    })
    update_file_batch_processing_btn()
}

function select_all_files() {
    select_all_btn_on(true)
    if (!is_multi_choice) {
        multi_choice_btn_on(true)
    }
    const all_selected = document.getElementById('file-list').children
    for (let ele of all_selected) {
        ele.classList.add('file-selected')
    }
    selected_files.clear()
    if (all_files[curr_category] === undefined)
        all_files[curr_category] = []
    for (let file of all_files[curr_category]) {
        selected_files.add(Base64.encode(file['name']))
    }
    update_file_batch_processing_btn()
}


// subscribe

function receive_file(data) {
    let json = JSON.parse(data.body)
    if (json.state === 'add') {
        let category = json.category
        if (typeof all_files[category] === "undefined")
            all_files[category] = []
        add_file(json)
        update_empty_hint_img()
    } else if (json.state === 'delete') {
        delete_listed_file(json.name, json.category)
    } else if (json.state === 'rename') {
        let category = json.category
        let prev_name = json['prevName']

        if (typeof all_files[category] === "undefined")
            all_files[category] = []
        let index = all_files[category].findIndex(ele => { return ele.name === prev_name })
        if (index === -1) return
        all_files[category][index] = json

        if (category === curr_category) {
            let base64_prevName = Base64.encode(json['prevName'])
            let item = document.getElementById(`file-item-${base64_prevName}`)
            item.outerHTML = file_item(json)
        }
    }
}

// get files when login

function request_file() {
    get('/-/res/file/all', {
        headers: {'token': window.localStorage.getItem('token'), 'roomid': room_id},
        success: function (xmlhttp) {
            debug(xmlhttp.responseText)

            let json = JSON.parse(xmlhttp.responseText)
            if (json.code === 0) {
                let data = json.data
                if (data === null) {
                    return
                }
                all_files = {}
                for (const file of data) {
                    if (all_files[file['category']] === undefined)
                        all_files[file['category']] = []
                    all_files[file['category']].push(file)
                }
                sort_files()
                update_file_list()
            }
        },
        error: function (xmlhttp) {
            if (xmlhttp.status === 401) {
                window.location.reload()
            }
        }
    })
}

function add_file(file) {
    let category = file.category
    if (all_files[category] === undefined)
        all_files[category] = []
    let low = 0, high = all_files[category].length;

    while (low < high) {
        let mid = (low + high) >>> 1;
        if (all_files[category][mid]['date'] < file['date']) low = mid + 1;
        else high = mid;
    }
    all_files[category].splice(low, 0, file)

    // show in the file list
    if (category === curr_category) {
        if (low === 0)
            document.getElementById('file-list').insertAdjacentHTML('afterbegin', file_item(file))
        else {
            let base64_filename = Base64.encode(all_files[curr_category][low - 1]['name'])
            document.getElementById(`file-item-${base64_filename}`).insertAdjacentHTML('afterend', file_item(file))
        }
        select_all_btn_on(false)
    }

}

function sort_files() {
    if (all_files[curr_category] === undefined)
        all_files[curr_category] = []
    all_files[curr_category].sort(function (data1, data2) {
        if (data1['date'] > data2['date']) return 1
        else if (data1['date'] < data2['date']) return -1
        return 0
    })
}

function delete_listed_file(filename, category) {
    if (all_files[category] === undefined)
        all_files[category] = []
    let index = all_files[category].findIndex(function (data) {
        return data['name'] === filename
    })
    if (index !== -1) all_files[category].splice(index, 1)
    if (category === curr_category) {
        document.getElementById(`file-item-${Base64.encode(filename)}`).remove()
        if (selected_files.has(Base64.encode(filename))) selected_files.delete(Base64.encode(filename))
        update_file_batch_processing_btn()
        update_empty_hint_img()
    }
}

function update_file_list() {
    let file_list = document.getElementById('file-list')
    file_list.innerHTML = ''
    if (all_files[curr_category] === undefined)
        all_files[curr_category] = []
    update_empty_hint_img()
    for (let file_data of all_files[curr_category]) {
        file_list.innerHTML += file_item(file_data)
    }
    document.getElementById('content-file-tab-img').src = `${baseurl}/assets/room/${get_category_icon(curr_category)}`
    document.getElementById('content-file-tab-text').textContent = curr_category === '' ? i18n['room.category-public'] : curr_category

    clear_all_file_selection()
}

function update_empty_hint_img() {
    if (all_files[curr_category].length === 0) {
        document.getElementById('empty-hint-div').style.opacity = '1'
    } else {
        document.getElementById('empty-hint-div').style.opacity = '0'
    }
}

function file_item_clicked(event, item, filename) {
    if (event.target.localName === 'button' || (event.target.parentElement !== null && event.target.parentElement.localName === 'button')) {
        return;
    }
    Array.from(document.getElementsByClassName('file-expand')).forEach(ele => {
        ele.classList.remove('file-expand')
    })
    if (selected_files.has(filename)) {
        item.classList.remove('file-selected')
        selected_files.delete(filename)
        select_all_btn_on(false)
        update_file_batch_processing_btn()
        return
    }
    if (!is_multi_choice)
        clear_all_file_selection()
    item.classList.add('file-selected')
    item.classList.add('file-expand')
    selected_files.add(filename)
    if (all_files[curr_category] === undefined)
        all_files[curr_category] = []
    if (selected_files.size === all_files[curr_category].length)
        select_all_btn_on(true)
    update_file_batch_processing_btn()
}

function file_item(json) {
    let filename = json['name']
    let base64_filename = Base64.encode(filename)
    let file_category = Base64.encode(json['category'])
    let size = bytesToSize(json['size'])
    let icon = get_file_icon_name(filename)
    let token = window.localStorage.getItem('token')
    let token_url = token !== null ? `&token=${token}` : '&token='
    let file_snapshot = !has_snapshot(filename) ? `<i class="file-item-icon far ${icon}"></i>` : `<img class="file-item-snapshot" src="/res/file/snapshot?roomid=${room_id}&category=${encodeURIComponent(file_category)}&filename=${encodeURIComponent(base64_filename)}${token_url}" alt=""/>`

    return `
    <li id="file-item-${base64_filename}" class="file-item-li" onclick="file_item_clicked(event, this, '${base64_filename}')">
        <div class="file-item-title-div">
            <div class="file-item-head">
                ${file_snapshot}
                <span class="file-item-filename">
                    ${htmlencode(filename)}
                </span>
            </div>
            <span class="w20"></span>
            <span class="file-item-size">${size}</span>
        </div>
        <div class="file-item-btn-div">
            <button onclick="move_file('${base64_filename}')" class="submit-btn file-item-btn-item green file-item-move-btn"><img src="${baseurl}/assets/room/move.svg" alt="move"/></button>
            <button onclick="rename_file('${base64_filename}')" class="submit-btn file-item-btn-item orange file-item-rename-btn"><img src="${baseurl}/assets/room/pen.svg" alt="rename"/></button>
<!--            <button class="submit-btn file-item-qrcode-btn"><img src="/assets/room/qrcode.svg" alt="qrcode"/></button>-->
            <button onclick="delete_file('${base64_filename}')" class="destroy-btn file-item-btn-item file-item-delete-btn"><img src="${baseurl}/assets/room/delete.svg" alt="delete"/></button>
            <button onclick="download_file('${base64_filename}')" class="submit-btn file-item-btn-item file-item-download-btn"><img src="${baseurl}/assets/room/download.svg" alt="download"/></button>
        </div>
    </li>
    `
}

// drag & drop

function file_dropped(ev) {
    ev.preventDefault()

    if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (let i = 0; i < ev.dataTransfer.items.length; i++) {
            // If dropped items aren't files, reject them
            debug(ev.dataTransfer.items[i], ev.dataTransfer.items[i].kind)
            let item = ev.dataTransfer.items[i]
            if (ev.dataTransfer.items[i].kind === 'string') {
                if (item.type !== 'text/html') {
                    item.getAsString(function (str) {
                        textbox({
                            type: 'text',
                            title: i18n['room.send-message'],
                            message: i18n['room.drop-message-before'] + htmlencode(str) + i18n['room.drop-message-after'],
                            callback() {
                                if (str.length > 1000 || Base64.encode(str).length > 1000) {
                                    textbox({
                                        type: 'text',
                                        title: i18n['room.message-sent-error'],
                                        message: i18n['room.message-size-warning'],
                                        callback() { return true }
                                    })
                                    return false;
                                }
                                ws_send(str)
                                return true
                            }
                        })
                    })
                }


            } else if (ev.dataTransfer.items[i].kind === 'file') {
                let item = ev.dataTransfer.items[i]
                let entry = item.webkitGetAsEntry();
                debug(entry)
                if (entry.isFile) {
                    let file = item.getAsFile();
                    send_file(file)
                }
            }
        }
    } else {
        // Use DataTransfer interface to access the file(s)
        for (let i = 0; i < ev.dataTransfer.files.length; i++) {
            send_file(ev.dataTransfer.files[i])
        }
    }
    hide_drop_zone()
}

function file_dragging(ev) {
    ev.preventDefault()
    show_drop_zone()
}

window.ondragenter = function (ev) {
    show_drop_zone()
}

function show_drop_zone() {
    document.getElementById('file-drop-zone').style.display = 'flex'
}

function hide_drop_zone() {
    document.getElementById('file-drop-zone').style.display = 'none'
}


// File paste

function add_file_paste() {
    document.addEventListener('paste', function (event) {
        const items = event.clipboardData && event.clipboardData.items;
        let file = null;
        if (items && items.length) {
            for (let item of items) {
                if (item.type.indexOf('image') !== -1) {
                    file = item.getAsFile();
                    send_file(file)
                    break;
                }
            }
        }
    });
}


// File Operations

function input_file(input) {
    for (let file of input.files) {
        if (file !== null)
            send_file(file)
    }
}

function send_file(file) {
    debug(file)
    if (file.size > 10737418240) {
        textbox({
            type: 'no-cancel',
            title: i18n['room.file-upload-fail'],
            message: i18n['room.file-size-warning']
        })
        return
    }

    let form_data = new FormData()
    form_data.append('file', file)
    form_data.append('category', curr_category)
    let md5_filename = md5(file.name)
    let size = bytesToSize(file.size)

    post('/-/res/file/upload', {
        headers: {'token': window.localStorage.getItem('token'), 'roomid': room_id},
        body: form_data,
        start(xmlhttp) {
            add_uploading_file(file.name, size, xmlhttp)
        },
        progress: function (loaded, total) {
            let progress = Math.round(loaded * 100 / total)
            debug(progress)
            update_uploading_file_list(md5_filename, loaded, total)
        },
        success: function (xmlhttp) {
            debug(xmlhttp.responseText)
            remove_uploading_file(md5(file.name))
        },
        error: function (xmlhttp) {
            if (xmlhttp.status === 401 || xmlhttp.status === 301) {
                window.location.reload()
            }
        }
    })
}

function download_files_in_bulk() {
    if (selected_files.size === 0) return
    if (selected_files.size === 1) {
        download_file(Array.from(selected_files)[0])
        return;
    }

    let download_path = '/res/file/download/multi?roomid=' + room_id + '&category=' + encodeURIComponent(Base64.encode(curr_category)) + '&filenames=' + encodeURIComponent(JSON.stringify(Array.from(selected_files))) + '&token=' + window.localStorage.getItem('token')
    let download_a = document.createElement('a')
    download_a.href = download_path
    download_a.click()
}

function move_files_in_bulk() {
    if (selected_files.size === 0) return
    if (selected_files.size === 1) {
        move_file(Array.from(selected_files)[0])
        return
    }

    let options = [{'name': i18n['room.category-public'], 'value': ''}]
    all_categories.forEach(category => {
        options.push({'name': category['name'], 'value': Base64.encode(category['name'])})
    })

    textbox({
        type: 'option',
        title: i18n['room.move'],
        message: i18n['room.move-select-category-name'],
        options: options,
        default: curr_category,
        callback(box) {
            let confirm_btn = box.confirm_btn
            let value = box.select.value
            let base64_curr_category = Base64.encode(curr_category)
            if (base64_curr_category === value) return true
            let form_data = new FormData()
            form_data.append('filenames', JSON.stringify(Array.from(selected_files)));
            form_data.append('category', base64_curr_category);
            form_data.append('newcategory', value);
            post('/-/res/room/file/move/multi', {
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
                        box.select.classList.add('red')
                    }
                    confirm_btn.innerHTML = i18n['room.confirm']
                    confirm_btn.disabled = false
                },
                error: function (xmlhttp) {
                    if (xmlhttp.status === 401) {
                        window.location.reload()
                    }
                }
            })
            confirm_btn.innerHTML = i18n['room.please-wait']
            confirm_btn.disabled = true
        }
    })
}

function delete_files_in_bulk() {
    if (selected_files.size === 0) return
    if (selected_files.size === 1) {
        delete_file(Array.from(selected_files)[0])
        return
    }

    if (!admin_exists){
        textbox({
            type: 'text',
            title: i18n['room.delete'],
            message: i18n['room.delete-multiple-file-msg-before'] + selected_files.size + i18n['room.delete-multiple-file-msg-after'],
            callback: function (box) {
                let confirm_btn = box.confirm_btn
                let form_data = new FormData()
                form_data.append('filenames', JSON.stringify(Array.from(selected_files)))
                form_data.append('category', curr_category);

                post('/-/res/file/delete', {
                    headers: {
                        'token': window.localStorage.getItem('token'),
                        'roomid': room_id,
                    },
                    body: form_data,
                    success: function (xmlhttp) {
                        let json = JSON.parse(xmlhttp.responseText)
                        if (json.code === 0) {
                            selected_files.clear()
                            box.destroy()
                        } else if (json.code === -1) {
                            box.message.textContent = json.msg
                            box.message.style.color = 'var(--red)'
                        }
                        confirm_btn.innerHTML = i18n['room.confirm']
                        confirm_btn.disabled = false
                    },
                    error(xmlhttp) {
                        if (xmlhttp.status === 401) {
                            window.location.reload()
                        }
                    }
                })
                confirm_btn.innerHTML = i18n['room.please-wait']
                confirm_btn.disabled = true
                return false
            }
        })
        return;
    }

    textbox({
        type: 'input-password',
        title: i18n['room.adminword-required'],
        message: i18n['room.delete-multiple-file-msg-before-admin'] + selected_files.size + i18n['room.delete-multiple-file-msg-after-admin'],
        callback: function (box) {
            let confirm_btn = box.confirm_btn
            let adminword = box.password_input.value
            let form_data = new FormData()
            form_data.append('filenames', JSON.stringify(Array.from(selected_files)))
            form_data.append('category', curr_category);

            post('/-/res/file/delete', {
                headers: {
                    'token': window.localStorage.getItem('token'),
                    'roomid': room_id,
                    'adminword': adminword
                },
                body: form_data,
                success: function (xmlhttp) {
                    let json = JSON.parse(xmlhttp.responseText)
                    if (json.code === 0) {
                        selected_files.clear()
                        box.destroy()
                    } else if (json.code === -1) {
                        box.message.textContent = json.msg
                        box.message.style.color = 'var(--red)'
                        box.password_input.classList.add('red')
                    }
                    confirm_btn.innerHTML = i18n['room.confirm']
                    confirm_btn.disabled = false
                },
                error(xmlhttp) {
                    if (xmlhttp.status === 401) {
                        window.location.reload()
                    }
                }
            })
            confirm_btn.innerHTML = i18n['room.please-wait']
            confirm_btn.disabled = true
            return false
        }
    })
}

function download_file(base64_filename) {
    let download_path = '/res/file/download?roomid=' + room_id + '&category=' + encodeURIComponent(Base64.encode(curr_category)) + '&filename=' + encodeURIComponent(base64_filename) + '&token=' + window.localStorage.getItem('token')
    let download_a = document.createElement('a')
    download_a.href = download_path
    download_a.download = Base64.decode(base64_filename)
    download_a.click()
}

function rename_file(base64_filename) {
    textbox({
        type: 'input',
        title: i18n['room.rename'],
        message: i18n['room.menu-input-file-name'],
        default: Base64.decode(base64_filename),
        callback(box) {
            let confirm_btn = box.confirm_btn
            let value = box.text_input.value
            let form_data = new FormData()
            form_data.append('name', base64_filename);
            form_data.append('category', Base64.encode(curr_category));
            form_data.append('newname', Base64.encode(value));
            post('/-/res/room/file/rename', {
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
                },
                error: function (xmlhttp) {
                    if (xmlhttp.status === 401) {
                        window.location.reload()
                    }
                }
            })
            confirm_btn.innerHTML = i18n['room.please-wait']
            confirm_btn.disabled = true
        }
    })
}

function move_file(base64_filename) {
    let options = [{'name': i18n['room.category-public'], 'value': ''}]
    all_categories.forEach(category => {
        options.push({'name': category['name'], 'value': Base64.encode(category['name'])})
    })
    textbox({
        type: 'option',
        title: i18n['room.move'],
        message: i18n['room.move-select-category-name'],
        options: options,
        default: curr_category,
        callback(box) {
            let confirm_btn = box.confirm_btn
            let value = box.select.value
            let base64_curr_category = Base64.encode(curr_category)
            if (base64_curr_category === value) return true
            let form_data = new FormData()
            form_data.append('filename', base64_filename);
            form_data.append('category', base64_curr_category);
            form_data.append('newcategory', value);
            post('/-/res/room/file/move', {
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
                },
                error: function (xmlhttp) {
                    if (xmlhttp.status === 401) {
                        window.location.reload()
                    }
                }
            })
            confirm_btn.innerHTML = i18n['room.please-wait']
            confirm_btn.disabled = true
        }
    })
}

function delete_file(base64_filename) {
    let filename = Base64.decode(base64_filename)

    if (!admin_exists){
        textbox({
            type: 'text',
            title: i18n['room.delete'],
            message: i18n['room.delete-file-msg-before'] + filename + i18n['room.delete-file-msg-after'],
            callback: function (box) {
                let confirm_btn = box.confirm_btn
                let form_data = new FormData()
                form_data.append('filenames', JSON.stringify([base64_filename]))
                form_data.append('category' , curr_category)

                post('/-/res/file/delete', {
                    headers: {
                        'token': window.localStorage.getItem('token'),
                        'roomid': room_id,
                    },
                    body: form_data,
                    success: function (xmlhttp) {
                        let json = JSON.parse(xmlhttp.responseText)
                        if (json.code === 0) {
                            selected_files.clear()
                            box.destroy()
                        } else if (json.code === -1) {
                            box.message.textContent = json.msg
                            box.message.style.color = 'var(--red)'
                        }
                        confirm_btn.innerHTML = i18n['room.confirm']
                        confirm_btn.disabled = false
                    },
                    error(xmlhttp) {
                        if (xmlhttp.status === 401) {
                            window.location.reload()
                        }
                    }
                })
                confirm_btn.innerHTML = i18n['room.please-wait']
                confirm_btn.disabled = true
                return false
            }
        })
        return;
    }

    textbox({
        type: 'input-password',
        title: i18n['room.adminword-required'],
        message: i18n['room.delete-file-msg-before'] + filename + i18n['room.delete-file-msg-after'],
        callback: function (box) {
            let confirm_btn = box.confirm_btn
            let adminword = box.password_input.value
            let form_data = new FormData()
            form_data.append('filenames', JSON.stringify([base64_filename]))
            form_data.append('category' , curr_category)
            post('/-/res/file/delete/', {
                headers: {
                    'token': window.localStorage.getItem('token'),
                    'roomid': room_id,
                    'adminword': adminword,
                },
                body: form_data,
                success: function (xmlhttp) {
                    let json = JSON.parse(xmlhttp.responseText)
                    if (json.code === 0) {
                        // delete_listed_file(filename)
                        // update_file_list()
                        box.destroy()
                    } else if (json.code === -1) {
                        box.message.textContent = json.msg
                        box.message.style.color = 'var(--red)'
                        box.password_input.classList.add('red')
                    }
                    confirm_btn.innerHTML = i18n['room.confirm']
                    confirm_btn.disabled = false
                },
                error(xmlhttp) {
                    if (xmlhttp.status === 401) {
                        window.location.reload()
                    }
                }
            })
            confirm_btn.innerHTML = i18n['room.please-wait']
            confirm_btn.disabled = true
            return false
        }
    })
}

function calculate_input_file_width() {
    let file_input_text = document.getElementById('file-input-text')
    let width = file_input_text.clientWidth
    if (width > 0)
        file_input_text.style.setProperty('--input-file-text-max-width', width + 'px')
}

calculate_input_file_width()

