

let uploading_files = {}
// key: xmlhttp, last_frame_time, last_frame_byte, progress

function uploading_show_clicked() {
    document.getElementById('uploading-file-div').classList.toggle('invisible')
}

function uploading_close_clicked() {
    document.getElementById('uploading-file-div').classList.add('invisible')
}


function uploading_file_item(filename, size) {
    let md5_filename = md5(filename)
    let icon = get_file_icon_name(filename)

    return `
    <li id="uploading-file-${md5_filename}-li">
        <div class="uploading-file-item-title-div">
            <div class="uploading-file-item-head">
                <i class="uploading-file-item-icon far ${icon}"></i>
                <span class="uploading-file-item-filename">
                    ${htmlencode(filename)}
                </span>
            </div>
            <span class="w20"></span>
            <div class="uploading-file-item-progress-div">
                <span class="uploading-file-item-progress" id="uploading-file-${md5_filename}-progress">0 %</span>
                <button class="uploading-file-item-cancel-btn" onclick="abort_uploading_file('${md5_filename}')">
                    <img src="${baseurl}/assets/room/x.circle.svg"/>
                </button>
            </div>
        </div>
        <div class="uploading-file-item-btn-div">
            <span class="uploading-file-item-size" id="uploading-file-${md5_filename}-size">0 / ${size}</span>
            <span class="uploading-file-item-size" id="uploading-file-${md5_filename}-speed">--</span>
            <span class="uploading-file-item-size" id="uploading-file-${md5_filename}-time">-- s</span>
        </div>
    </li>
    `
}

function update_uploading_file_list(md5_filename, loaded, total) {
    let progress = Math.round(loaded * 100 / total)
    let loaded_size = bytesToSize(loaded)
    let total_size = bytesToSize(total)

    let speed_str = '--'
    let time_str = '-- s'
    let current_time = new Date().getTime()

    uploading_files[md5_filename]['progress'] = progress
    let last_frame_time = uploading_files[md5_filename]['last_frame_time']
    let last_frame_byte = uploading_files[md5_filename]['last_frame_byte']

    if (last_frame_time !== null && last_frame_byte !== null) {
        let speed = (loaded - last_frame_byte) / (current_time - last_frame_time)
        speed_str = bytesToSize(speed * 1000) + '/s'
        let remain_time = (total - loaded) / speed
        time_str = msToTime(remain_time)
    }
    uploading_files[md5_filename]['last_frame_time'] = current_time
    uploading_files[md5_filename]['last_frame_byte'] = loaded

    document.getElementById('uploading-file-' + md5_filename + '-progress').innerHTML = progress + ' %'
    document.getElementById('uploading-file-' + md5_filename + '-li').style.background = `linear-gradient(to right, var(--clear-green), var(--clear-green) ${progress}%, transparent ${progress}%)`
    document.getElementById('uploading-file-' + md5_filename + '-size').innerHTML = loaded_size + '<br>' + total_size
    document.getElementById('uploading-file-' + md5_filename + '-speed').innerHTML = speed_str
    document.getElementById('uploading-file-' + md5_filename + '-time').innerHTML = time_str
    update_uploading_file_btn()
}

function update_uploading_file_btn() {
    let sum = 0, count = 0
    for (const key in uploading_files) {
        sum += uploading_files[key]['progress']
        count += 100
    }
    if (count === 0) {
        document.getElementById('uploading-file-btn').style.background = 'transparent'
        document.getElementById('uploading-file-btn-progress-text').classList.add('invisible')
        document.getElementById('content-uploading-tab-progress').classList.add('invisible')
        return
    }
    let progress = Math.round(sum * 100 / count)
    document.getElementById('uploading-file-btn-progress-text').classList.remove('invisible')
    document.getElementById('content-uploading-tab-progress').classList.remove('invisible')
    document.getElementById('uploading-file-btn-progress-text').textContent = progress + ' %'
    document.getElementById('uploading-file-btn').style.background = `linear-gradient(to right, var(--clear-green), var(--clear-green) ${progress}%, transparent ${progress}%)`
    update_uploading_tab_circle_progress(progress)
}

function update_uploading_tab_circle_progress(progress) {
    let fg1 = -135 + (progress > 50 ? 180 : progress * 3.6)
    let fg2 = -135 + (progress < 50 ? 0 : (progress - 50) * 3.6)
    document.getElementById('content-uploading-progress-fg1').style.transform = `rotate(${fg1}deg)`
    document.getElementById('content-uploading-progress-fg2').style.transform = `rotate(${fg2}deg)`
}

function add_uploading_file(filename, size, xmlhttp) {
    uploading_files[md5(filename)] = {
        'xmlhttp': xmlhttp,
        'last_frame_time': null,
        'last_frame_byte': null,
        'progress': 0
    }
    document.getElementById('uploading-file-list').innerHTML += uploading_file_item(filename, size)
    document.getElementById('uploading-file-empty-hint-div').classList.add('invisible')
    update_uploading_file_btn()
}

function remove_uploading_file(md5_filename) {
    delete uploading_files[md5_filename]
    document.getElementById('uploading-file-' + md5_filename + '-li').remove()
    if (Object.keys(uploading_files).length === 0)
        document.getElementById('uploading-file-empty-hint-div').classList.remove('invisible')
    update_uploading_file_btn()
}

function abort_uploading_file(md5_filename) {
    let uploading = uploading_files[md5_filename]

    if (uploading !== undefined) {
        uploading['xmlhttp'].abort()
        remove_uploading_file(md5_filename)
    }
    update_uploading_file_btn()
}

