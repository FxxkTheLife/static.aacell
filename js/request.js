function get(url, data) {
    let xmlhttp = new XMLHttpRequest()

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            if (typeof data.success === "function")
                data.success(xmlhttp)
        }
        else if (xmlhttp.status !== 200) {
            if (typeof data.error === "function")
                data.error(xmlhttp)
        }
    }
    xmlhttp.open('GET', url, true)

    if (typeof data.headers === "object") {
        for (let headersKey in data.headers) {
            xmlhttp.setRequestHeader(headersKey, data.headers[headersKey])
        }
    }

    if (data.responseType !== undefined) {
        xmlhttp.responseType = data.responseType
    }

    xmlhttp.send()
}

function post(url, data) {
    let xmlhttp = new XMLHttpRequest()
    if (typeof data.progress === "function") {
        xmlhttp.upload.addEventListener('progress', function (eve) {
            if (eve.lengthComputable) {
                data.progress(eve.loaded, eve.total)
            }
        }, false)
    }
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            if (typeof data.success === "function")
                data.success(xmlhttp)
        }
        else {
            if (typeof data.error === "function")
                data.error(xmlhttp)
        }
    }
    xmlhttp.open('POST', url, true)

    if (typeof data.headers === "object") {
        for (let headersKey in data.headers) {
            xmlhttp.setRequestHeader(headersKey, data.headers[headersKey])
        }
    }

    if (data.responseType !== undefined) {
        xmlhttp.responseType = data.responseType
    }

    if (data.start !== undefined) {
        data.start(xmlhttp)
    }

    if (typeof data.body === "undefined")
        xmlhttp.send()
    else
        xmlhttp.send(data.body)
}

