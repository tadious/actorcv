
jQuery(document).ready(function() {
	
		/*
				Variable Fullscreen background
		*/
		/*const bgs = [
			"/landing/img/backgrounds/1.jpg",
			"/landing/img/backgrounds/01.jpg",
			"/landing/img/backgrounds/02.jpg",
			"/landing/img/backgrounds/03.jpg",
			"/landing/img/backgrounds/04.jpg",
			"/landing/img/backgrounds/05.jpg",
			"/landing/img/backgrounds/06.jpg"
		];

		const background_position = Math.floor(Math.random()*7)
		$.backstretch(bgs[background_position]);
		*/

		//console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>title",title);
		//$.backstretch("/landing/img/backgrounds/1.jpg");

		$(window).scroll(function() {
			//height in pixels when the navbar becomes non opaque
			if($(this).scrollTop() > 50) {
				$('.opaque-navbar').addClass('opaque');
			} else {
				$('.opaque-navbar').removeClass('opaque');
			}
		});
		
		/*
				Login form validation
		*/
		$('.login-form input[type="text"], .login-form input[type="password"], .login-form textarea').on('focus', function() {
			$(this).removeClass('input-error');
		});
		
		$('.login-form').on('submit', function(e) {
			
			$(this).find('input[type="text"], input[type="password"], textarea').each(function(){
				if( $(this).val() == "" ) {
					e.preventDefault();
					$(this).addClass('input-error');
				}
				else {
					$(this).removeClass('input-error');
				}
			});
			
		});
		
		/*
				Registration form validation
		*/
		$('.registration-form input[type="text"], .registration-form textarea').on('focus', function() {
			$(this).removeClass('input-error');
		});
		
		$('.registration-form').on('submit', function(e) {
			
			$(this).find('input[type="text"], textarea').each(function(){
				if( $(this).val() == "" ) {
					e.preventDefault();
					$(this).addClass('input-error');
				}
				else {
					$(this).removeClass('input-error');
				}
			});
			
		});




		//TODO[Tadious]: Custom JS
		function lookupSlug(slug) {
			$('#slug').val(slug);	
			$.ajax({
				type: "POST",
				url: '/api/user/check-slug',
				data: {slug:slug, _csrf:$('meta[name="csrf-token"]').attr('content')},
				success: function(res){
					if(res.status == 'success'){
						var _resHTML = '<i class="fa fa-check fa-2x" style="color:green;"></i>';
						$('#_useslug').val(1);
					}else{
						var _resHTML = '<i class="fa fa-close fa-2x" style="color:red;"></i>';
						$('#_useslug').val(0);
					}
					$('#check-url').html(_resHTML);
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

		$("#firstname").change(function() {
			const slug = convertToSlug($("#firstname").val()+' '+$("#lastname").val());
			lookupSlug(slug);
		});
		$("#lastname").change(function() {
			const slug = convertToSlug($("#firstname").val()+' '+$("#lastname").val());
			lookupSlug(slug);
		});
		$("#slug").change(function() {
			const slug = convertToSlug($("#slug").val());
			lookupSlug(slug);
		});
		
		
});
