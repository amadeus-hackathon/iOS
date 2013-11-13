// JavaScript Document
$(document).ready(function() {
	
	
		$(".mask, .popUp, .newPopup, .popUp1, #eventslist").hide();
	
	//search tab
		
		$(".facebook, .seasonal, .wellBeing").click(function(){
		$(".mask, .popUp").show();
		})

		$(".close").click(function(){
		$(".mask, .popUp").hide();
		})
		
		$(".placeDescription.arrow").click(function(){
		$(".newPopup").show();
		})
		
		
				$(".close1").click(function(){
		$(".newPopup").hide();
		});
		
		
						$("#mCondition, label[for='mCondition']").click(function(){
		$(".mask, .popUp1").show();
		});
				
						$(".close2, .done").click(function(){
		$(".mask, .popUp1").hide();
		});
		
		$("#events").click(function(){
		$("#eventslist").show();
		$("#packageList").hide();
		$("#packages").removeClass("selected");
		$("#events").addClass("selected");
		myScroll.refresh()
				
		});
		
		
		$("#packages").click(function(){
		$("#eventslist").hide();
		$("#packageList").show();
		$("#packages").addClass("selected");
		$("#events").removeClass("selected");
		myScroll.refresh()
				
		});
		
		
		
		
});


