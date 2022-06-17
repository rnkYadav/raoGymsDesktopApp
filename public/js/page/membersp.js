 
let divNames = document.getElementById('membersDiv');
let searchBtn = document.getElementById("searchBtn");
let pendingBtn = document.getElementById("pendingBtn");
let searchInput = document.getElementById("searchInput");

document.addEventListener("DOMContentLoaded", async ()=>{

    let members = window.api.getAllMembers();
    setMembersTable(members);

});


searchBtn.addEventListener('click',(e)=>{
    console.log(searchInput.value);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // console.log( this.responseText );
            setMembersTable( JSON.parse(this.responseText) );
        }
    };
    xhttp.open("POST", "/searchMember", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("name="+searchInput.value);
})


pendingBtn.addEventListener('click',(e)=>{
    console.log("Pending Membership click");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // console.log( this.responseText );
            setMembersTable( JSON.parse(this.responseText) );
        }
    };
    xhttp.open("POST", "/finishedMembership", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();
})

function setMembersTable(members){

    let nameStrings = "<table class='table table-hover table-light'>" ;
    
    nameStrings+= `<tr>
    <th>S.No.</th>
    <th>Name</th>
    <th>Photo</th>
    <th>Mobile</th>
    <th>Address</th>
    <th colspan='2'>Action</th>
    </tr>`;

    if(members.length == 0){
        nameStrings += `<tr><td colspan='6'>No Member Found...</td></tr>`;
    }
    else
    {
        members.forEach(member => {
            nameStrings+= `<tr>
            <td>${member.member_id}</td>
            <td>${member.member_name}</td>
            <td><img src="../public/uploads/${member.member_photo}" alt="Image Not Available" width="70" height="70"></td>
            <td>${member.member_mobile}</td>
            <td>${member.member_address}</td>
            <td><a href="/member/${member.member_id}" class="btn btn-primary p-1">Details</a></td>
            </tr>`;
        });
        
    }
    // <td>${member.member_remark}</td>
    // <td><a href="/membershipForm/${member.member_id}" class="btn btn-success p-1">Add Membership</a></td>
    
    nameStrings+= `</table>`;

    divNames.innerHTML = nameStrings;
}