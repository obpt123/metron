namespace metron {
    export namespace dictionary {
        (function () {
            function dictionary(obj: any): any {
                this.length = 0;
                this.items = {};
                if (obj !== null) {
                    for (let prop in obj) {
                        if (obj.hasOwnProperty(prop)) {
                            this.items[prop] = obj[prop];
                            this.length++;
                        }
                    }
                }
            }
            dictionary.prototype.setItem = function (key: string, value: any): void {
                if (!this.hasItem(key)) {
                    this.length++;
                }
                this.items[key] = value;
            };
            dictionary.prototype.getItem = function (key: string): any {
                return this.hasItem(key) ? this.items[key] : null;
            };
            dictionary.prototype.hasItem = function (key: string): boolean {
                return this.items.hasOwnProperty(key);
            };
            dictionary.prototype.removeItem = function (key: string): any {
                if (this.hasItem(key)) {
                    this.length--;
                    let item: any = this.items[key];
                    delete this.items[key];
                    return item;
                }
                else {
                    return null;
                }
            };
            dictionary.prototype.keys = function (): Array<string> {
                let keys: Array<string> = [];
                for (let k in this.items) {
                    if (this.hasItem(k)) {
                        keys.push(k);
                    }
                }
                return keys;
            };
            dictionary.prototype.values = function (): Array<any> {
                let values: Array<any> = [];
                for (let k in this.items) {
                    if (this.hasItem(k)) {
                        values.push(this.items[k]);
                    }
                }
                return values;
            };
            dictionary.prototype.each = function (callback: Function): void {
                let i: number = 0;
                for (let key in this.items) {
                    callback(i, key, this.items[key]);
                    i++;
                }
            };
            dictionary.prototype.clear = function (): void {
                this.items = {};
                this.length = 0;
            };
            return dictionary;
        })();
    }
    export namespace web {
        function parseUrl(url: string, obj: any, encode: boolean = false): string {
            let paramPairs: Array<string> = [];
            if (url.contains('?')) {
                let parts: Array<string> = url.split('?');
                url = parts[0];
                paramPairs = paramPairs.concat(parts[1].split('&'));
            }
            for (let prop in obj) {
                if (obj.hasOwnProperty(prop) && !paramPairs.contains(prop, true)) {
                    let item = (encode) ? encodeURIComponent(obj[prop]) : obj[prop];
                    paramPairs.push(prop + '=' + item);
                }
                else if (obj.hasOwnProperty(prop) && paramPairs.contains(prop, true)) {
                    let item = (encode) ? encodeURIComponent(obj[prop]) : obj[prop];
                    paramPairs[paramPairs.indexOfPartial(prop)] = prop + '=' +item;
                }
            }
            return url + '?' + paramPairs.join('&');
        }
        export function querystring(obj?: any): Array<string> | string {
            if (typeof (document) !== 'undefined') {
                if (typeof (obj) === 'string' && arguments.length === 1) {
                    let result: Array<any> = [];
                    let match: RegExpExecArray;
                    let re: RegExp = new RegExp('(?:\\?|&)' + obj + '=(.*?)(?=&|$)', 'gi');
                    while ((match = re.exec(document.location.search)) !== null) {
                        result.push(match[1]);
                    }
                    return result;
                }
                else if (typeof (obj) === 'string' && arguments.length > 1) {
                    return [parseUrl(obj, arguments[1])];
                }
                else if (obj != null) {
                    return [parseUrl(document.location.href, obj)];
                }
                else {
                    return document.location.search.substring(1);
                }
            }
            else {
                throw 'Error: No document object found. Environment may not contain a DOM.';
            }
        }
        export function hash(key?: string): string[] | any {
            var hash = document.location.hash;
            if (hash.substr(0, 1) == "#") {
                hash = hash.substr(1);
            }
            if (hash.substr(0, 1) == "/") {
                hash = hash.substr(1);
            }
            if (hash.length > 1) {
                if (hash.indexOf("/") != -1) {
                    try {
                        hash = hash.split("/")[1];
                    }
                    catch (e) {
                        console.log(`Error: Failed to parse hash value: ${e}`);
                    }
                }
                try {
                    const result = metron.tools.formatOptions(hash, metron.OptionTypes.QUERYSTRING);
                    if(key != null) {
                        return [result[key]];
                    }
                    return result;
                }
                catch(e) {
                    console.log(`Error formatting has values: ${e}`);
                }
            }
        }
        export function querystringify(obj: any, encode = false): string {
            return parseUrl("", obj, encode);
        }
        export namespace cookie {
            export function get(name: string): string {
                if (typeof (document) !== 'undefined') {
                    let cookieParts: Array<string> = document.cookie.split(';');
                    for (let i: number = 0; i < cookieParts.length; i++) {
                        let cookieName: string = cookieParts[i].substr(0, cookieParts[i].indexOf("="));
                        let cookieValue: string = cookieParts[i].substr(cookieParts[i].indexOf("=") + 1);
                        if (cookieName.trim() === name) {
                            return cookieValue;
                        }
                    }
                    return null;
                }
                else {
                    throw 'Error: No document object found. Environment may not contain a DOM.';
                }
            }
            export function set(name: string, val: string, date: Date) {
                if (typeof (document) !== 'undefined') {
                    let cookie: string = name + '=' + val + ';path="/"';
                    if (typeof (date) !== 'undefined') {
                        cookie += ';expires=' + date.toUTCString();
                    }
                    document.cookie = cookie;
                }
                else {
                    throw 'Error: No document object found. Environment may not contain a DOM.';
                }
            }
            export function remove(name: string): void {
                if (typeof (document) !== 'undefined') {
                    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
                }
                else {
                    throw 'Error: No document object found. Environment may not contain a DOM.';
                }
            }
        }
        export namespace headers {
            export function get(name: string) {
                if (typeof (document) !== 'undefined') {
                    let request: XMLHttpRequest = new XMLHttpRequest();
                    request.open("HEAD", document.location.href, false);
                    request.send(null);
                    if (name !== undefined) {
                        return request.getResponseHeader(name);
                    }
                    else {
                        return request.getAllResponseHeaders();
                    }
                }
                else {
                    throw 'Error: No document object found. Environment may not contain a DOM.';
                }
            }
        }
        export async function ajax(url: string, data: any = {}, method: string = "POST", async: boolean = true, contentType: string = "application/x-www-form-urlencoded; charset=UTF-8", dataType: string = "text", success?: Function, failure?: Function): Promise<any> {
            function _parseResult(request: XMLHttpRequest): AjaxRequest {
                switch (dataType.lower()) {
                    case "text":
                        return request.responseText;
                    case "json":
                        return request.responseJSON();
                    case "xml":
                        return <XMLDocument>request.responseXML;
                    default:
                        return request.responseText;
                }
            }
            async function _send(request: XMLHttpRequest, data: any): Promise<any> {
                return new Promise<any>((resolve, reject) => {
                    request.open(method, url, async, data);
                    request.onreadystatechange = function () {
                        if (request.readyState === 4) {
                            if (request.status === 200) {
                                if (success !== undefined) {
                                    resolve(success(_parseResult(request)));
                                }
                            }
                            if (request.status === 404 || request.status === 405 || request.status === 500) {
                                if (failure !== undefined) {
                                    reject(failure(request.responseText, request.responseJSON(), request.responseXML));
                                }
                                else {
                                    (<HTMLElement>document.selectOne("[data-m-segment='alert']").addClass("danger")).innerHTML = `<p>${(request.responseText != null && request.responseText != "") ? request.responseText : "Error: A problem has occurred while attempting to complete the last operation!"}</p>`;
                                    document.selectOne("[data-m-segment='alert']").show();
                                }
                            }
                        }
                    };
                    request.setRequestHeader("Content-Type", contentType);
                    if (url.contains("localhost")) {
                        request.setRequestHeader("Cache-Control", "max-age=0");
                    }
                    request.send(data);
                });
            }
            let request: XMLHttpRequest = new XMLHttpRequest();
            let requestData = (typeof(data) !== "string") ? metron.web.querystringify(data, true) : data;
            if (requestData.startsWith("?")) {
                requestData = requestData.substr(1);
            }
            if (requestData.endsWith("?")) {
                requestData = requestData.substr(0, requestData.length - 2);
            }
            var self = {
                url: url
                , method: method
                , contentType: contentType
                , dataType: dataType
                , data: requestData
                , async: async
                , request: request
                , send: async function (): Promise<any> {
                    return await _send(request, requestData);
                }
            };
            if (success != null || failure != null) {
                return await self.send();
            }
            return self;
        }
        export async function get(url: string, params: any = {}, contentType: string = "application/x-www-form-urlencoded; charset=UTF-8", dataType?: string, success?: Function, failure?: Function): Promise<any> {
            return await ajax(url, params, "GET", true, (contentType != null) ? contentType : "application/x-www-form-urlencoded; charset=UTF-8", dataType, success, failure);
        }
        export async function post(url: string, params: any = {}, contentType: string = "application/x-www-form-urlencoded; charset=UTF-8", dataType?: string, success?: Function, failure?: Function): Promise<any> {
            return await ajax(url, params, "POST", true, (contentType != null) ? contentType : "application/x-www-form-urlencoded; charset=UTF-8", dataType, success, failure);
        }
        export async function postAll(url: string, params: any = {}, contentType: string = "application/json;charset=utf-8", dataType?: string, success?: Function, failure?: Function): Promise<Ajax> {
            return await ajax(url, JSON.stringify({ "data": params }), "POST", true, (contentType != null) ? contentType : "application/json;charset=utf-8", dataType, success, failure);
        }
        export async function put(url: string, params: any = {}, contentType: string = "application/x-www-form-urlencoded; charset=UTF-8", dataType?: string, success?: Function, failure?: Function): Promise<any> {
            return await ajax(url, params, "PUT", true, (contentType != null) ? contentType : "application/x-www-form-urlencoded; charset=UTF-8", dataType, success, failure);
        }
        export async function putAll(url: string, params: any = {}, contentType: string = "application/json;charset=utf-8", dataType?: string, success?: Function, failure?: Function): Promise<any> {
            return await ajax(url, JSON.stringify({ "data": params }), "PUT", true, (contentType != null) ? contentType : "application/json;charset=utf-8", dataType, success, failure);
        }
        export async function remove(url: string, params: any = {}, contentType: string = "application/x-www-form-urlencoded; charset=UTF-8", dataType?: string, success?: Function, failure?: Function): Promise<any> {
            return await ajax(url, params, "DELETE", true, (contentType != null) ? contentType : "application/x-www-form-urlencoded; charset=UTF-8", dataType, function (data) {
                if (data != null && data instanceof Array && data.length > 0) {
                    success(data[0])
                }
                else {
                    success(data);
                }
            }, failure);
        }
    }
    export namespace observer {
        (function () {
            let callback: Function;
            let frequency: number;
            let isExecuting: boolean = false;
            var timer;
            function setupInterval(pe: any) {
                timer = setInterval(
                    function () {
                        pe.onTimer(pe);
                    },
                    frequency * 1000
                );
            }
            function execute(pe: any) {
                callback(pe);
            }
            function onTimer(pe: any) {
                if (!isExecuting) {
                    try {
                        isExecuting = true;
                        execute(pe);
                        isExecuting = false;
                    } catch (e) {
                        isExecuting = false;
                        throw e;
                    }
                }
            }
            return {
                watch: function (callback: Function, frequency: number) {
                    this.callback = callback;
                    this.frequency = frequency;
                    this.setupInterval(this);
                },
                stop: function (): void {
                    if (!timer) {
                        return;
                    }
                    clearInterval(timer);
                    timer = null;
                }
            };
        })();
    }
    export namespace guid {
        function generateGUIDPart(): string {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        //Note that JavaScript doesn't actually have GUID or UUID functionality.
        //This is as best as it gets.
        export function newGuid(): string {
            return (generateGUIDPart() + generateGUIDPart() + "-" + generateGUIDPart() + "-" + generateGUIDPart() + "-" + generateGUIDPart() + "-" + generateGUIDPart() + generateGUIDPart() + generateGUIDPart());
        }
    }
}

if (typeof (document) !== 'undefined' && typeof (document.location) !== 'undefined') {
    if (typeof ((<any>document.location).querystring) === 'undefined') {
        (<any>document.location).querystring = metron.web.querystring;
    }
    if (typeof ((<any>document.location).headers) === 'undefined') {
        (<any>document.location).headers = metron.web.headers;
    }
}
