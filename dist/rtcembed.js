var globalbID;
var RTCLIB = RTCLIB || (function(){
    var _args = {}; // private

    return {
        init : function(Args) {
            _args = Args;
            var bID = _args[0];
            globalbID=bID;
            /*THIS IS FOR HTTP REQUEST*/
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var div = document.getElementById('rtc-embed-holder');
                    div.innerHTML +=  this.responseText;
                }
            };
            var curr = new Date().toLocaleString('en-us', {weekday:'long'}).toLowerCase();
            var params = 'bID='+bID+'&day='+curr;
            var url = 'https://dashboard.realtimemarketing.com/embed?'+params;
            xhttp.open("GET", url, true);
            xhttp.send();
        },
        closeEmbed: function(){
            //put closing embed code here
            rtcTogglePane();
        },
    };
}());
(function() {
     setTimeout(function(){
        if(document.getElementById("bubble-message")) document.getElementById("bubble-message").classList.toggle("visible");
    }, 3000);
})();

function  rtcTogglePane(){
    document.getElementById("rtc-widget").classList.toggle("visible");
    document.getElementById("rtc-button-close").classList.toggle("visible");
    document.getElementById("rtc-mask").classList.toggle("visible");
    document.getElementById("rtc-button-open").classList.toggle("visible");
    if(document.getElementById("bubble-message")) document.getElementById("bubble-message").classList.toggle("visible");
    document.body.classList.toggle("rtc-is-active");

    var ua = navigator.userAgent.toLowerCase();
    // console.log('UA: ', ua);

    if (ua.indexOf('safari') !== -1) {
        //if safari
        var time_start = document.getElementById("time_start_safari").value;
        const utc_start = new Date(time_start + ' UTC');
        let startHour = utc_start.getHours();
        let startMinutes = utc_start.getMinutes();
        let startSeconds = utc_start.getSeconds();
        startHour = ("0" + startHour).slice(-2);
        startMinutes = ("0" + startMinutes).slice(-2);
        startSeconds = ("0" + startSeconds).slice(-2);
        time_start = startHour + ":" + startMinutes + ":" + startSeconds;

        var time_end = document.getElementById("time_end_safari").value;
        const utc_end = new Date(time_end + ' UTC');
        let endHour = utc_end.getHours();
        let endMinutes = utc_end.getMinutes();
        let endSeconds = utc_end.getSeconds();
        endHour = ("0" + endHour).slice(-2);
        endMinutes = ("0" + endMinutes).slice(-2);
        endSeconds = ("0" + endSeconds).slice(-2);
        time_end = endHour + ":" + endMinutes + ":" + endSeconds;
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

    let curr = new Date().toLocaleTimeString('en-GB');
    let is_active = document.getElementById("is_active").value;
    // console.log('CURR: ', curr);
    // console.log('START: ', time_start);
    // console.log('END: ', time_end);

    if (time_start == 'Invalid Date' || time_end == 'Invalid Date' || is_active == 0) {
        document.getElementById("rtc-unavailable").classList.toggle("visible");
    } else {
        if (curr > time_start || curr < time_end) {
            document.getElementById("rtc-iframe").classList.toggle("visible");
        } else {
            document.getElementById("rtc-unavailable").classList.toggle("visible");
        }
    }

    const element = document.querySelector("#rtc-button-close");
    const visible = element.classList.contains("visible");
    if(visible == true){
        fetch('https://dashboard.realtimemarketing.com/p/rtc/actions?action=increment-page-views&rtc_id='+globalbID,
            {
                    method: "POST",
                }
        ).then(function(response) {
            console.log('pageviews++');
        });
    }
}

function toggleMessage() {
    document.getElementById("bubble-message").classList.toggle("visible");
}

function convertTZ(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));
}
