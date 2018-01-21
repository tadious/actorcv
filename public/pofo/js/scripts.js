$(document).ready(function() {
	
	//Initialize
	var label_normal_color = "#CCCCCC";
	var label_success_color = "#59cc72";
	var label_error_color = "red";
	$("#slug-label").css('color',label_normal_color);

	function lookupSlug(slug) {
		$('#slug').val(slug);	
		$.ajax({
			type: "POST",
			url: '/api/user/check-slug',
			data: {slug:slug, _csrf:$('meta[name="csrf-token"]').attr('content')},
			success: function(res){
				if(res.status == 'success'){
					var _html = 'Website&nbsp;<i class="fa fa-check"></i>';
					var _color = label_success_color;
					$('#_useslug').val(1);
				}else{
					var _color = label_normal_color;
					var _html = 'Website';
					$('#_useslug').val(0);
				}
				$("#slug-label").css('color',_color);
				$('#slug-label').html(_html);
			},
			dataType: 'json'
		});
	}

	function convertToSlug(input_text) {
		input_text = $.trim(input_text);
		return input_text
		.toLowerCase()
		.replace(/ /g,'-')
		.replace(/[^\w-]+/g,'');
	}

	$("#fullname").change(function() {
		const slug = convertToSlug($("#fullname").val());
		lookupSlug(slug);
	});
	
	$("#slug").change(function() {
		const slug = convertToSlug($("#slug").val());
		lookupSlug(slug);
	});

	$("#email").change(function() {
		if ($("#email").val().length > 0) {
			$("#email-label").css('top',"-12px");
			if(!validateEmail($("#email").val())){
				$("#email-label").css('color',"red");
				$("#email-label").css('font-size',"11px");
			}	
		}
	});

	function validateEmail(email){
  	var re = /^(?:[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
  	return re.test(email);
	}

});