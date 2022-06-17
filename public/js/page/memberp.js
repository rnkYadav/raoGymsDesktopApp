
let statusBtn = document.getElementById('statusBtn');
let statusSpan = document.getElementById('statusSpan');
let statusData = document.getElementById('statusData');
let memberIdSpan = document.getElementById('memberIdSpan');

statusBtn.addEventListener('click',(e)=>{
    console.log("statusBtn click " +statusSpan.textContent);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let response = JSON.parse(this.responseText);
            console.log( response );
            if(response.changes == 1 && statusData.innerText == 'Active') 
                statusData.innerText = 'Inactive'
            else
                statusData.innerText = 'Active'

        }
    };
    xhttp.open("POST", "/changeMemberStatus/"+memberIdSpan.textContent+"/"+statusSpan.textContent, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();
})
