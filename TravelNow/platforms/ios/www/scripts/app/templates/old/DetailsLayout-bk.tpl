{Template {
  $classpath : "app.templates.DetailsLayout",
  $hasScript: true
}}

  {macro main()}
	<div class="container" id="details">
	  <div id="header">
		<div class="backButton"><a href="index.html"></a></div>
	  </div>
	  <div id="wrapper">
		<div id="scroller">
		  <ul id="thelist">
			<li class="maps" id="map-canvas">
			</li>
			<li class="placeDetails">
			  <div class="container">
				<div class="header">Place details</div>
				<div class="placeDescription">
				  <div class="content"> <img src="${this.data.placeImage}"> <span><strong>Place:</strong> ${data.placetitle}</span> </span><strong>Description:</strong>${data.details}</span> 
				  </div>
				</div>
			  </div>
			</li>
			<li class="placeDetails events">
			  <div class="tabs"><span class="selected" id="packages" {on click {fn:'packageClicked'}/}>Packages</span><span id="events" {on click {fn:'eventClicked'}/}>Events</span></div>
			  <div class="container" id="packageList">
				<div class="freeText">Packages dates from next month <span class="changeDate">Change dates</span> </div>
				{foreach event in this.data.packages}
					<div class="placeDescription packages">
					  <div class="content placeDes">
						<img src="img/Gulmarg1_81x64.jpg">
						<div class="packagetitle">Winter Special - Sikkim Darjeeling Delight</div>
						<div class="PackageDescription"><span class="days1">6 days  - Gangtok, Pelling, Darjeelin and more</span></div>
						<table border="0" class="flightInfo">
						  <tr>
							<td class="departure">S2 100</td>
							<td class="airline"></td>
							<td>09:50 – 12:30</td>
							<td>2h 40m, non-stop</td>
						  </tr>
						  <tr>
							<td class="arrival">S3 100</td>
							<td class="airline"></td>
							<td>09:50 – 12:30</td>
							<td>2h 40m, non-stop</td>
						  </tr>
						</table>
						<div class="price"> <span class="strikeOut">Rs.15,871 </span> <span class="mainPrice">Rs.15,433</span> <span class="saving">Save Rs.438</span> </div>
						<span class="bookButton" {on click {fn: 'showPopup'}/}>Book</span> 
					  </div>
					</div>
				{/foreach}
			  </div>
			  <div class="container" id="eventslist">
				{foreach event in this.data.events}
					<div class="placeDescription">
						<div class="content"> <img src="img/Neil-Island2_81x64.jpg"> <span><strong class="name">Event 1</strong> </span> <span class="des">Oktoberfests have long been a part of German festivity. The Royal Orchid offers its own version of the celebration at its English pub, Geoffrey's. Geoffrey's at The Royal Orchid is transforming itself to provide a lively dining experience, in order to celebrate the historic Oktoberfest. The a la carte menu, specially designed for the festival, has a wide range of sizzlers that feature German favourites like sauerkraut, spaetzle, bratwurst and frikadelle will be served. Both vegetarian and non-vegetarian options will be available. Considering beer is a big part of the festival, the pub will serve a wide range of beer brands for guests to explore. These include Kingfisher, Fosters, Budweiser, Tuborg, Heineken, Carlsberg, Peroni, Corona, Christoffel, Orval and St Bernadus. </span> </div>
					</div>
				{/foreach}
			  </div>
			</li>
		  </ul>
		</div>
	  </div>
	  <div id="footer">
		<div class="button">Book</div>
	  </div>
	</div>
	<div class="mask"></div>
	<div class="popup2">
	  <div>
		<div class="subHeader">More options <span class="close3" {on click {fn: 'hidePopup'}/}></span></div>
		<ul class="upsell">
		  <li class="title">Winter Special - Sikkim Darjeeling Delight</li>
		  <li class="offers">Between Jan 2014  to  Feb 2015 <span class="currency">INR 21000</span><span class="bookDeal">Proceed</span></li>
		  <li class="options subHeader1">More deals</li>
		  <li class="offers bB">Between Feb 2014  to  Mar 2015 <span class="currency">INR 20000</span><span class="bookDeal">Book this trip</span></li>
		  <li class="offers">Between Mar 2014  to  Apr 2015 <span class="currency">INR 19000</span><span class="bookDeal">Book this trip</span></li>
		</ul>
	  </div>
	</div>
  {/macro}

{/Template}