{Template {
  $classpath : "app.templates.DetailsLayout",
  $hasScript: true,
  $dependencies: ['aria.utils.Number']
}}

  {macro main()}
	<div class="container" id="details">
	  <div id="header">
		<div class="backButton"><a href="javascript:void(0)" {on click {fn: 'goBack'}/}></a></div>
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
				  <div class="content">
					<img src="https://usercontent.googleapis.com/freebase/v1/image${this.data.placeImage}"> 
					<span>
						<strong>Place:</strong> ${data.placetitle}
					</span> 
					<span>
						<strong>Description:</strong>${data.details}
					</span>
				  </div>
				</div>
			  </div>
			</li>
			<li class="placeDetails events">
			  <div class="tabs"><span class="selected" id="packages" {on tap {fn:'packageClicked'}/}>Packages</span><span id="events" {on tap {fn:'eventClicked'}/}>Events</span></div>
			  <div class="container" id="packageList">
				<div class="freeText">Packages dates from next month <span class="changeDate">Change dates</span> </div>
				
				// set the flight and hotel
				{if this.data.packages && this.data.packages.flight 
					&& this.data.packages.hotels != null && this.data.packages.hotels.length > 0}
					
					{var flight = this.data.packages.flight/}
					{foreach pkg in this.data.packages.hotels}
						<div class="placeDescription packages">
						  <div class="content placeDes">
							<img src="${pkg.htImg}">
							<div class="packagetitle">${pkg.htNm}</div>
							<div class="PackageDescription"><span class="days1">${pkg.ar}</span></div>
							<table border="0" class="flightInfo">
							  <tr>
								<td class="departure">${flight.al}</td>
								<td class="airline">
									<img src="${flight.img}"/>
								</td>
								<td>${flight.airline_name}</td>
							  </tr>
							  <tr>
								<td class="arrival">${flight.al}</td>
								<td class="airline"><img src="${flight.img}"/></td>
								<td>${flight.airline_name}</td>
							  </tr>
							</table>
							<div class="price">
								{var orgPrice = pkg.pf + pkg.ps/}
								<span class="strikeOut">Rs.${aria.utils.Number.formatCurrency(orgPrice, '#.##')}</span>
								<span class="mainPrice">Rs.${aria.utils.Number.formatCurrency(pkg.pf, '#.##')}</span>
								<span class="saving">Save Rs.${aria.utils.Number.formatCurrency(pkg.ps, '#.##')}</span>
							</div>
							<span class="bookButton" {on tap {fn: 'showPopup', args: {nm: pkg.htNm, pc: aria.utils.Number.formatCurrency(pkg.pf, '#.##')}}/}>Book</span> 
						  </div>
						</div>
					{/foreach}
				{else/}
					<div class="errorMsg">Oops!!! No packages found.</div>
				{/if}
			  </div>
			  <div class="container" id="eventslist">
				{if this.data.clickedCity.events != null 
					&& this.data.clickedCity.events.length > 0}
					{foreach event in this.data.clickedCity.events}
						<div class="placeDescription">
							<div class="content">
								<img src="https://usercontent.googleapis.com/freebase/v1/image${this.data.placeImage}" alt="No Image">
								<span>
									<strong>Place: </strong> ${event.event_name}
								</span> 
								<span>
									<strong>Description: </strong>${getDecodedText(event.description)}
								</span>
							</div>
						</div>
					{/foreach}
				{else/}
					<div class="errorMsg">Sorry!!! There are no events.</div>
				{/if}
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
		<div class="subHeader">More options <span class="close3" {on tap {fn: 'hidePopup'}/}></span></div>
		<ul class="upsell">
		  <li class="title" id="hotelEL">Winter Special - Sikkim Darjeeling Delight</li>
		  <li class="offers">Between Dec 2013  to  Jan 2014 <span class="currency" id="popCurrency">INR 21000</span><span class="bookDeal">Proceed</span></li>
		  <li class="options subHeader1">More deals</li>
		  <li class="offers bB">Between Feb 2014  to  Mar 2015 <span class="currency">INR 7000</span><span class="bookDeal">Book this trip</span></li>
		  <li class="offers">Between Mar 2014  to  Apr 2015 <span class="currency">INR 9000</span><span class="bookDeal">Book this trip</span></li>
		</ul>
	  </div>
	</div>
  {/macro}

{/Template}