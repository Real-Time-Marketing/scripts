var rtc_globalbID;
var rtc_thread_id = '';
var rtc_unread_count = 0;
var rtc_saveDetails = false;
var rtc_base_url = 'https://dashboard.realtimemarketing.com';
var RTCLIB = RTCLIB || (function(){
    var _args = {}; // private

    return {
        init : function(Args) {
            _args = Args;
            var bID = _args[0];
            rtc_globalbID=bID;
            /*THIS IS FOR HTTP REQUEST*/
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var div = document.getElementById('rtc-embed-holder');
                    div.innerHTML += this.responseText;
                }
            };
            var curr = new Date().toLocaleString('en-us', {weekday:'long'}).toLowerCase();
            var params = 'bID='+bID+'&day='+curr;
            var url = rtc_base_url+'/embed?'+params;
            xhttp.open("GET", url, true);
            xhttp.send();
        },
        closeEmbed: function(){
            //put closing embed code here
            rtcTogglePane();
        },
    };
}());

window.addEventListener("message", function(event) {
    const data = JSON.parse(event.data);
    if(data.channel && data.channel == 'RTC_THREAD'){
        getThreadID(data.thread_id);
    }
});

(function() {
    setTimeout(function(){
        if(document.getElementById("bubble-message")) document.getElementById("bubble-message").classList.toggle("visible");
    }, 3000);

    rtcTimeout()
})();

function rtcTimeout() {
    setTimeout(function () {
        if(rtc_thread_id !== ''){

            const url = `${rtc_base_url}/p/rtc/actions?action=get-unread-count&thread_id=${rtc_thread_id}`
            fetch(url, { method: "GET", })
            .then(response => response.json())
            .then(data => {
                const is_close_visible = document.querySelector("#rtc-button-close").classList.contains("visible");
                if(data.count > 0 && !is_close_visible){
                    rtc_unread_count = data.count
                    const is_unread_visible = document.querySelector("#unread").classList.contains("visible");
                    if(!is_unread_visible){
                        document.getElementById("unread").classList.toggle("visible");
                    }
                    document.getElementById("unread").innerHTML = data.count;
                }
            });
        }
        rtcTimeout();
    }, 5000);
}

function getThreadID(thread_id){
    if(thread_id && thread_id != '' && thread_id != null && typeof thread_id != undefined){
        rtc_thread_id = thread_id;

        if(rtc_thread_id !== ''){
            const url = 'https://ipapi.co/json/'
            fetch(url, { method: "GET", })
            .then(response => response.json())
            .then(data => {
                const ip_address = data.ip || ''
                const url = window.location.href || ''
                const timezone = data.timezone || ''
                const os = getOS()
                const country = data.country_name || ''
                const region = data.region || ''
                const city = data.city || ''
                const zipcode = data.postal || ''
                const local_time = new Date()
                const browser = getBrowser()
                const obj = {
                    ip_address,
                    url,
                    timezone,
                    os,
                    country,
                    region,
                    city,
                    zipcode,
                    local_time,
                    browser,
                    thread_id: rtc_thread_id
                }
                const saveUrl = `${rtc_base_url}/p/rtc/actions?action=save-user-chat-details`
                fetch(saveUrl, {
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json, text-plain, */*",
                    },
                    method: "POST",
                    body: JSON.stringify(obj)
                })
                .then(response => response.json())
                .then(data => {
                    rtc_saveDetails = true
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            });
        }
    }
}

function  rtcTogglePane(){
    document.getElementById("rtc-widget").classList.toggle("visible");
    document.getElementById("rtc-button-close").classList.toggle("visible");
    document.getElementById("rtc-mask").classList.toggle("visible");
    document.getElementById("rtc-button-open").classList.toggle("visible");
    if(document.getElementById("bubble-message")) document.getElementById("bubble-message").classList.toggle("visible");
    document.body.classList.toggle("rtc-is-active");

    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('safari') !== -1) {
        var time_start = document.getElementById("time_start_safari").value; // opening hour
        var time_end = document.getElementById("time_end_safari").value; // closing hour
        var destination_time = document.getElementById("converted_time").value; // CURRENT TIME IN SET TIMEZONE H:i:s - converted local time to timezone
        console.log(time_start, time_end, destination_time)
    }else{
        var time_start = document.getElementById("time_start").value;
        time_start = time_start.replace(/-/g, "/");
        time_start = new Date(time_start);
        const utc_start = new Date(time_start + ' UTC');
        time_start = utc_start.toLocaleTimeString('en-GB');

        var time_end = document.getElementById("time_end").value;
        time_end = time_end.replace(/-/g, "/");
        time_end = new Date(time_end);
        const utc_end = new Date(time_end + ' UTC');
        time_end = utc_end.toLocaleTimeString('en-GB');
    }

    let is_active = document.getElementById("is_active").value;
    let _thread_id = document.getElementById("thread_id").value;
    if(_thread_id !== ''){
        rtc_thread_id = _thread_id
    }

    if (time_start == 'Invalid Date' || time_end == 'Invalid Date' || is_active == 0) {
        document.getElementById("rtc-unavailable").classList.toggle("visible");
    } else {
        if (destination_time > time_start && destination_time < time_end) {
            document.getElementById("rtc-iframe").classList.toggle("visible");
        } else {
            document.getElementById("rtc-unavailable").classList.toggle("visible");
        }
    }

    const element = document.querySelector("#rtc-button-close");
    const visible = element.classList.contains("visible");
    if(visible == true){
        const fetch_url = `${rtc_base_url}/p/rtc/actions?action=increment-page-views&rtc_id=${rtc_globalbID}&thread_id=${rtc_thread_id}`;
        fetch(fetch_url, { method: "POST" })
        .then(function(response) {
        });
        const is_unread_visible = document.querySelector("#unread").classList.contains("visible");
        if(is_unread_visible) document.getElementById("unread").classList.toggle("visible")
    }else{
        if(rtc_thread_id !== ''){ // to mark as read if widget is currently open and there's a message from client
            const fetch_url = `${rtc_base_url}/p/rtc/actions?action=mark-as-read&thread_id=${rtc_thread_id}`;
            fetch(fetch_url, { method: "POST" })
            .then(function(response) { rtc_unread_count = 0 });
        }
        const is_unread_visible = document.querySelector("#unread").classList.contains("visible");
        if(!is_unread_visible && rtc_unread_count > 0) document.getElementById("unread").classList.toggle("visible")
    }

}

function toggleMessage() {
    document.getElementById("bubble-message").classList.toggle("visible");
}

function convertTZ(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));
}

function getOS(){
    if (navigator.userAgent.indexOf("Win") != -1)
        return "Windows OS";
    if (navigator.userAgent.indexOf("Mac") != -1)
        return "MacOS";
    if (navigator.userAgent.indexOf("X11") != -1)
        return "UNIX OS";
    if (navigator.userAgent.indexOf("Linux") != -1)
        return "Linux OS";
}

function getBrowser(){
    if((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1 )  return 'Opera'
    if(navigator.userAgent.indexOf("Chrome") != -1) return 'Chrome'
    if(navigator.userAgent.indexOf("Safari") != -1) return 'Safari'
    if(navigator.userAgent.indexOf("Firefox") != -1) return 'Firefox'
    if(navigator.userAgent.indexOf("MSIE") != -1) return 'IE'
    return 'Unknown'
}
