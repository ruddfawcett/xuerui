$(function(){$(".button").bind("click touchstart",function(){function e(e){return $.trim($(e).val()).length}var a=$(".first"),t=$(".last"),n=$(".role"),r=$(".email"),o=$(".password");if(!(e(a)&&e(t)&&e(n)&&e(r)&&e(o)))return void $(".message").text("Please complete the entire form.").fadeIn().delay(2e3).fadeOut();var s={user:{name:{first:a.val(),last:t.val()},role:n.val(),email:r.val(),password:o.val()}};$.ajax({type:"POST",url:"/signup",data:s,beforeSend:function(){$(".loading").show()},complete:function(){$(".loading").hide()},success:function(e){201===e.code?$(".message").text("Your account was created, a verification email has been sent.").fadeIn():409===e.code?$(".message").text("A user with that email already exists.").fadeIn().delay(2e3).fadeOut():$(".message").text("Error creating your account.").fadeIn().delay(2e3).fadeOut()},error:function(e,a,t){$(".message").text("Error creating your account.").fadeIn().delay(2e3).fadeOut()}})})});