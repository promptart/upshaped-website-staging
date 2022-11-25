(function ($) {
	var $window = $(window),
		$body = $('body'),
		$sidebar = $('#sidebar');

	var prompts = [
		"A dog in a house made of sushi.",
		"A drawing of a flying hamster.",
		"A picture of darth vader smiling.",
		"A baroque portrait of a dragon surrounded by flowers.",
		"A realistic picture of pikachu with a cape.",
	];
	var images = [
		"sushidog.webp",
		"flying_hamster.jpg",
		"darthvader.webp",
		"baroque_dragon.webp",
		"pikachucape.webp",
	];
	var num_prompts = 5
	var j = 0;
	$("#story").attr('placeholder', prompts[j % num_prompts]);
	$("#resultimage").attr('src', "images/" + images[j % num_prompts]);
	var OfflineText = setInterval(function() {
		$("#story").fadeTo(100,0.0, function() {
			$("#story").attr('placeholder', prompts[j % num_prompts])
		}).fadeTo(50,1);
		
		$("#resultimage").fadeTo(1000,0.0, function() {
			$("#resultimage").attr("src", "images/" + images[j % num_prompts]);
		}).fadeTo(500,1);
		j++;
		}, 5000);


	// Hack: Activate non-input submits.
	$('form').on('click', '.submit', function (event) {

		// Stop propagation, default.
		event.stopPropagation();
		event.preventDefault();

		// stop animation
		clearInterval(OfflineText);

		if (document.getElementById('story')) {
			// Get story value
			var story_string = document.getElementById('story').value
			console.log("submitted story" + story_string);

            // *** Make text permanent ***
            // create new story
			const sp1 = document.createElement("div");
			sp1.id = "SubmittedStory";
			const sp1_content = document.createTextNode(story_string);
			sp1.appendChild(sp1_content);

			// remove old story
			const sp2 = document.getElementById("story");
			const parentDiv = sp2.parentNode;
			parentDiv.replaceChild(sp1, sp2);

            // remove old button
			const generatebutton = document.getElementById("generatebutton");
			const parentDivButton = generatebutton.parentNode;
			parentDivButton.removeChild(generatebutton)

            // start load animation
			$("#resulttext").text("Drawing")
            var originalText = $("#resulttext").text(),
                i  = 0;
            var DrawingText = setInterval(function() {
                $("#resulttext").append(".");
                i++;
                if(i == 4)
                {
                    $("#resulttext").html(originalText);
                    i = 0;
                }
            }, 500);

			$("#resultimage").attr('src', 'images/pic01.jpg').stop(true);
			

			// *** API INTERACTION ***

			// if you type dummy somewhere in the prompt you will get dummy image back, else disco diffusion
			var model = "disco_generate";
			if (story_string.indexOf("dummy") >= 0) {
				model = "dummy_generate"
			}
			
			// send request


			// DEBUG
			var payload = {
				"prompt": [story_string, "oil painting"],
				"steps": 200
			};
			var url = 'http://127.0.0.1:8000/forward/' + model + '/?body=' + JSON.stringify(payload)
			var source_request = new EventSource(url);
			console.log("[api] Submitting request: " + url);
            // receiving events
            source_request.onmessage = function (event) {
                clearInterval(DrawingText)
                $("#resulttext").text("Done drawing! Waiting for image...")

                console.log("[api] Submitting request for image!");

				console.log("[api] Received data:", event.data);
				var returnedJson = $.parseJSON( event.data );
				console.log("[api] parsed data:", returnedJson);

				var image_url = 'http://127.0.0.1:8000/resource/?path='+returnedJson.path
				console.log("[api] requesting image url: "+ image_url)
				$.ajax({
					url: image_url,   
					type: 'get',
					success: function(response) {
						console.log("[api] received image: "+ response);
						$("#resulttext").text("Tada!")
						$("#resultimage").attr('src', 'data:image/png;base64,' + response);
						}
				});

				source_request.close(); // should be done after last message
			}
            source_request.onerror = (e) => {
                console.log("An error occurred while attempting to request.");

                clearInterval(DrawingText)
                $("#resulttext").text("The demo is currently offline.")
            };

			/* Offline animation */
		}
	});
})(jQuery);