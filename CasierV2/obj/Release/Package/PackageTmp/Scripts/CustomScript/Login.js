
    function startLogin() {
        var name = $("#username").val();
        var password = $("#password").val();
        $.ajax({
            url: '/User/login',
            type: 'POST',
            dataType: 'json',
            data: { userName: name, userPassword: password },
            success: function (response) {
                console.log(response);
                window.location.href = "/" + response + "/index"
            }
        }).fail(function (error) {
            console.log(error);
        });
    }



