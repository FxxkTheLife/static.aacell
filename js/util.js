
// device adaptation

var compact_view_max_width = 600
var compact_view_max_height = 500

function get_width() {
    return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
}

function get_height() {
    return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
}

function is_compact_view() {
    return get_height() <= compact_view_max_height || get_width() <= compact_view_max_width
}

function is_width_compact() {
    return get_width() <= compact_view_max_width
}

// other

function htmlencode(s){
    let div = document.createElement('div');
    div.appendChild(document.createTextNode(s));
    return div.innerHTML;
}
function htmldecode(s){
    let div = document.createElement('div');
    div.innerHTML = s;
    return div.innerText || div.textContent;
}

function get_file_icon_name(filename) {
    function end(arr=[]) {
        for (const suffix of arr) {
            if (filename.toLowerCase().endsWith(suffix)) return true
        }
    }
    if (end(['.pdf'])) {
        return 'fa-file-pdf'
    } else if (end(['.txt', '.md', '.json', '.xml', '.html', '.yaml', '.yml'])) {
        return 'fa-file-alt'
    } else if (end(['.mp3', '.wav', '.flac', 'ogg'])) {
        return 'fa-file-audio'
    } else if (end(['.mp4', '.mov', '.m4v'])) {
        return 'fa-file-video'
    } else if (end(['.jpg', '.jpeg', '.png', '.svg', '.gif'])) {
        return 'fa-image'
    } else if (end(['.doc', '.docx'])) {
        return 'fa-file-word'
    } else if (end(['.xls', '.xlsx'])) {
        return 'fa-file-excel'
    } else if (end(['.ppt', '.pptx'])) {
        return 'fa-file-powerpoint'
    } else if (end(['.c', '.cpp', '.java', '.swift', '.py', '.cs', '.js', '.css', '.php', '.jsp', '.ts', '.go', '.vue', '.hex'])) {
        return 'fa-file-code'
    } else if (end(['.zip', '.rar', '.7z', '.cab', '.tar'])) {
        return 'fa-file-archive'
    } else {
        return 'fa-file'
    }
}

function has_snapshot(filename) {
    function end(arr=[]) {
        for (const suffix of arr) {
            if (filename.toLowerCase().endsWith(suffix)) return true
        }
    }
    return end(['.jpg', '.jpeg', '.png', '.gif'])
}

// function getBroswer(){
//     const sys = {};
//     const ua = navigator.userAgent.toLowerCase();
//     let s;
//     (s = ua.match(/edge\/([\d.]+)/)) ? sys.edge = s[1] :
//         (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? sys.ie = s[1] :
//             (s = ua.match(/msie ([\d.]+)/)) ? sys.ie = s[1] :
//                 (s = ua.match(/firefox\/([\d.]+)/)) ? sys.firefox = s[1] :
//                     (s = ua.match(/chrome\/([\d.]+)/)) ? sys.chrome = s[1] :
//                         (s = ua.match(/opera.([\d.]+)/)) ? sys.opera = s[1] :
//                             (s = ua.match(/version\/([\d.]+).*safari/)) ? sys.safari = s[1] : 0;
//
//     if (sys.edge) return { browser : "Edge", version : sys.edge };
//     if (sys.ie) return { browser : "IE", version : sys.ie };
//     if (sys.firefox) return { browser : "Firefox", version : sys.firefox };
//     if (sys.chrome) return { browser : "Chrome", version : sys.chrome };
//     if (sys.opera) return { browser : "Opera", version : sys.opera };
//     if (sys.safari) return { browser : "Safari", version : sys.safari };
//
//     return { browser : "", version : "0" };
// }

function select_and_copy(textarea) {
    textarea.select()
    document.execCommand('copy')
}

function copy(text) {
    const node = document.createElement('textarea');
    const selection = document.getSelection();

    node.textContent = text;
    document.body.appendChild(node);

    selection.removeAllRanges();
    node.select();
    document.execCommand('copy');

    selection.removeAllRanges();
    document.body.removeChild(node);
}

function bytesToSize(bytes) {
    if (typeof bytes === "string") bytes = parseInt(bytes)
    if (bytes === 0 || bytes <= 0) return '0 B';
    const k = 1024,
          sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
          i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toPrecision(3)) + ' ' + sizes[i];
}

function msToTime(ms) {
    if (ms < 1000)
        return '0s'
    let t = Math.round(ms / 1000)
    let s = t % 60
    t = (t - s) / 60
    let m = t % 60
    let h = (t - m) / 60

    return (h !== 0 ? h + 'h' : '') + (m !== 0 ? m + 'm' : '') + (s !== 0 ? s + 's' : '') + ''
}

function get_category_icon(name) {
    switch (name) {
        case '': // i18n
            return 'public.svg'
        default:
            return 'category.svg'
    }
}

function timeToString(time) {

}

function has_ancestor_class_or_id(child, classes=[], ids) {
    while (child != null) {
        if (typeof child.classList !== "undefined") {
            for (let one_class of classes) {
                if (child.classList.contains(one_class)) {
                    return true
                }
            }
        }
        if (typeof child.id !== "undefined" && ids.has(child.id)) {
            return true
        }
        child = child.parentNode
    }
    return false
}

function urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return '<a target="_blank" href="' + url + '">' + url + '</a>';
    })
}
