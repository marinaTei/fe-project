
window.onload = getAllUsers();

function getAllUsers(){
    $("#table-body tr").remove();
        axios.get('http://127.0.0.1:8080/table/users')
        .then(function (response) {
            var allUsers = response.data.rows;
            $.each(allUsers, function (id, userData) {
                $("#table-body").append(createCell(userData));
            });
        });

}

function createCell(userData) {
    var rowID = userData.id;
    var tableContent = "<tr id=" + rowID + ">";
    $.each(userData, function (index, value) {
        var template =_.template("<td><%= key %></td>");
        if(index == "permissions") tableContent += template({key: Object.values(value)});
        else if (index == "active")  tableContent += template({key: value});
            else tableContent += template({key: value});
    });
    tableContent += `<td><button data-toggle="modal" data-target="#modal" onclick="updateModal(${rowID})">UPDATE`;
    tableContent += `</button><button onclick="deleteUser(${rowID})">DELETE</button></td></tr>`;

    return tableContent;
}

function addUser(){
    var data = prepareData();
    axios.post('http://127.0.0.1:8080/table/create/user',
        data)
        .then(function () {
            emptyModal(Object.keys(data));
            getAllUsers();
           // $('#modal').modal('toggle');
        });
}

function prepareData() {
    var permission = {r: $("#read").is(":checked"), w:$("#write").is(":checked") , x:$("#execute").is(":checked") };
    var userObj = {firstname: "", lastname:"", email:"", birthdate: "", active: "", permissions:"" , id: ""};
    var keys = Object.keys(userObj);
    keys.forEach(function (key) {
        if(key == "active") userObj[key] = $("#" + key).is(':checked');
        else userObj[key] = $("#" + key).val();
    });
    userObj.permissions = permission;
    return userObj;
}

function getUserWithID(id) {
    axios.get('http://127.0.0.1:8080/table/users')
        .then(function (response) {
            $.each(response.data.rows, function (index) {
               if(index == id) fillModal(response.data.rows[index]);
            })
        });

}

function fillModal(user) {
    var auxArr = ["read", "write", "execute"];
    var keys = Object.keys(user);
    var permInfoArr = Object.values(user.permissions);
    keys.forEach(function (key) {
        if(key == "active")  {
            $("#" + key).prop("checked", toBool(user[key]));
        }else if(key == "permissions") {
            auxArr.forEach(function (auxKey, index){
                $("#" + auxKey).prop("checked", toBool(permInfoArr[index]));
            })}
        else $("#" + key).val(user[key]);
    });
}

function updateUser(id) {
    var data = prepareData();
    data.id = id;
    axios.put('http://127.0.0.1:8080/table/update/user/' + id,
        data)
        .then(function () {
            emptyModal(Object.keys(data));
            getAllUsers();
        })
}

function deleteUser(row) {
    var id = row.id;
    axios.delete("http://127.0.0.1:8080/table/delete/user/" + id)
        .then(function () {
            getAllUsers()
        });
}

function postModal() {
    emptyModal(["firstname", "lastname", "email", "birthdate", "active", "permissions", "id"]);
    $("#postOrUpdate" ).unbind();
    $("#postOrUpdate" ).on("click", function () {
        addUser();
    });
}

function updateModal(row) {
    $("#postOrUpdate" ).unbind();
    $("#postOrUpdate" ).on("click", function () {
        updateUser(row.id);
    });
    getUserWithID(row.id);
}

function emptyModal(keys) {
    var auxArr = ["active", "read", "write", "execute"];
    keys.forEach(function (key) {
        if(key == "permissions" || key == "active"){
            auxArr.forEach(function (auxKey){
                $("#" + auxKey).prop("checked", false);
            })}
        else $("#" + key).val("");
    });
}

function toBool(string) {
    if(string == 'true' || string == true) return true;
    if(string == 'false' || string == false) return false;
}