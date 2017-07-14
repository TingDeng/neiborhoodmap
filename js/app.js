var map = {};
var marker = {};
var infoWindow = {};

//Location: orlando, FL
window.initMap = function() {
    var location = new google.maps.LatLng({lat: 28.4813989, lng: -81.508839});

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: location,
		styles: [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{color: '#263c3f'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{color: '#6b9a76'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{color: '#38414e'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{color: '#212a37'}]
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{color: '#9ca5b3'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{color: '#746855'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{color: '#1f2835'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{color: '#f3d19c'}]
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{color: '#2f3948'}]
            },
            {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{color: '#17263c'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{color: '#515c6d'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{color: '#17263c'}]
            }
          ]
    });
	//re-center the map when wimdow resize
    google.maps.event.addDomListener(window, 'resize', function() {
    var center = map.getCenter();
    google.maps.event.trigger(map, "resize");
    map.setCenter(center);
});
   

};
var iconBase = 'img/';
var icons = {
          seafood: {
            icon: iconBase + 'seafood.png'
          },
          sushi: {
            icon: iconBase + 'sushi.png'
          },
          steak: {
            icon: iconBase + 'steak.png'
          }
        };
//filter orlando restaurants with different categories
var Category = function ( category ) {
    var self = this;
    self.categoryName = category;
    self.visible = ko.observable( true );
};

var Restaurant = function( restaurant, venue_data ) {
    var self = this;
    self.name = restaurant.name;
	self.id = restaurant.id;
    self.category = restaurant.category;
    self.is_visible = false;
    self.phone = '';
    self.coordinates = {};
    self.img_url = '';
    self.address = '';
    self.rating = '';
	self.direction ='';
	self.ratingcount ='';
	self.opening ='';
    var img_size = '150x150';
    
                 

    // retrieve restaurant informations from Foursquare API JSON results
    self.coordinates.lat = parseFloat(venue_data.location.lat);
    self.coordinates.lng = parseFloat(venue_data.location.lng);
    self.img_url = venue_data.bestPhoto.prefix + img_size + venue_data.bestPhoto.suffix;
    self.address = venue_data.location.formattedAddress.toString().replace(/,/g, ", ");
	self.phone = venue_data.contact.formattedPhone;
    self.rating = venue_data.rating;
	self.ratingcount = venue_data.ratingSignals;
    self.opening = venue_data.hours.status;
	//self.direction = '<a href="http://maps.google.com/maps?daddr=' + self.coordinates.lat + ',' + self.coordinates.lng+'"'+'rel="nofollow" target="_blank"> Get direction </a>';
    var contentString = "<div class='container info-div'><div class='row'><div class='col-xs-12'><img class='mainImg' src='"+ self.img_url + "'></div></div><div class='row'><div class='col-xs-12'><span class='title'>" + self.name + "</span></div></div></br><div class='row'><div class='col-sm-12'><p><span class='glyphicon glyphicon-map-marker'></span> "+ self.address + "</p></div> </div><div class='row'><div class='col-sm-12'><span class='glyphicon glyphicon-earphone'></span> "+ self.phone + "</div></div><div class='row'><div class='col-sm-12'><p><span class='glyphicon glyphicon-time'></span> " + self.opening + "</p></div></div><div class='row'><div class='col-sm-12'><span class='score'>"+ self.rating + "/10</span> - " + self.ratingcount + "reviews</div> </div></div>" ;                               
    self.marker = new google.maps.Marker({
        position: self.coordinates,
        title: self.name,
		icon: icons[restaurant.category].icon,
    });

    self.infoWindow = new google.maps.InfoWindow({
        content: contentString
    });

};
//Make http request using Foursquare API
var ViewModel = function() {
    var self = this;
    var foursquareUrl = 'https://api.foursquare.com/v2/venues/';
    var foursquareParams = $.param({
        'client_id': 'BJG0S004WGX2LZTDB1BNYLSYPPF0VTMRRQAKLL5PEXO0FR22',
        'client_secret': 'XKWU2XQWJLZLORRYU42KP2QCSFH0EOBVSNA1N5JGTJTOZEAS',
		'v': '20130815'
    });

    self.windowOpen = ko.observable( false );
    self.hasFiltered = ko.observable(false );
    self.restaurantList = ko.observableArray( [] );
    self.categoryList = ko.observableArray( [] );


    
//test data
var restaurants = [
    {
        'name': 'Tapa Toro',
        'id': '54ece606498e7a6fbe2eb098',
        'category': 'seafood'
    },


    {
        'name': 'Flying Fish',
        'id': '4b058695f964a520c96622e3',
        'category': 'seafood'
    },

    {
        'name': 'MoonFish',
        'id': '4b058698f964a5203d6722e3',
        'category': 'sushi'
    },

    {
        'name': 'Shin Japanese Cuisine',
        'id': '4b06dabff964a52084f122e3',
        'category': 'sushi'
    },

    {
        'name': "Charley's Steak House",
        'id': '4b9c4486f964a520715a36e3',
        'category': 'steak'
    },
	
    {
        'name': "Texas Roadhouse",
        'id': '53e9844c498ee424dabdf64e',
        'category': 'steak'
    },
	
    {
        'name': 'Texas de Brazil',
        'id': '4b05868df964a5209d6522e3',
        'category': 'steak'
    }
];
    var reducedList = restaurants.reduce(function ( outList, rest ){
        if (outList.indexOf(rest.category) === -1) {
            outList.push( rest.category );
        }
       return outList;
    }, []);

    reducedList.forEach(function ( name ) {
        self.categoryList.push( new Category( name ) );
    });

   
    self.categoryDict = ko.computed(function(){
        var dictObj = {};
        self.categoryList().forEach(function ( category ){
            dictObj[category.categoryName] = category.visible();
        });

        return dictObj;
    });

   
    restaurants.forEach(function ( restaurant ){
        var api_url = foursquareUrl + restaurant.id + '?' + foursquareParams;

        $.ajax({
            url: api_url,
            data: {format: 'json'},
            dataType: 'json'
        }).done(function(data){

            var venue_data = data.response.venue;
            self.restaurantList.push( new Restaurant( restaurant, venue_data ) );

        }).fail(function(){
            console.log( 'Request failed : ' + restaurant.name );
            self.errorMessage( 'Foursquare', 'Failed request for ' + restaurant.name );
        });

    });

    self.closeWindows = function() {
        if ( self.windowOpen() ) {
            self.windowOpen().close();
            self.windowOpen( false );
        }
    };

    self.toggleMarker = function( rest ) {
        if (self.windowOpen() !== rest.infoWindow) {
            self.closeWindows();
            rest.marker.setAnimation( 4 );
            rest.infoWindow.open( map, rest.marker );
            self.windowOpen( rest.infoWindow );
        } else {
            self.closeWindows();
        }
    };

    //show restaurants based on category selected
    self.getMarkers = ko.computed(function() {
        return self.restaurantList().filter(function ( rest ) {
            if ( self.categoryDict()[rest.category] ) {
                if ( rest.is_visible === false ) {
                    rest.marker.setMap( map );
                    rest.marker.setAnimation( google.maps.Animation.DROP );              
                    google.maps.event.clearInstanceListeners(rest.marker);
                    rest.marker.addListener( 'click', function(){
                        self.toggleMarker( rest );
                    });
                }
                rest.is_visible = true;

                return true;

            } else {
                rest.marker.setMap( null );
                rest.is_visible = false;

                return false;
            }
        });
    }, self);

    self.selectCategory = function( category ) {
        self.closeWindows();
        self.clearAll();
        category.visible( true );
    };

    self.clearAll = function() {
        self.categoryList().forEach(function ( category ) {
            category.visible( false );
        });

        self.hasFiltered( true );
    };

    self.selectAll = function() {
        self.categoryList().forEach(function ( category ) {
            category.visible( true );
        });

        self.hasFiltered( false );
    };

  //menu adjustment on mobile view
    self.toggleNavbar = function() {
        $('.navbar-nav').toggleClass('slide-in');
        $('.side-body').toggleClass('body-slide-in');
    };

    self.closeNavbar = function() {
        $('.navbar-nav').removeClass('slide-in');
        $('.side-body').removeClass('body-slide-in');
    };

    self.errorMessage = function ( source, additionalInfo ) {
        additionalInfo = additionalInfo || '';
        var errorMessage = "<div class='alert alert-warning' data-bind=''><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a><strong>" + source + "error.</strong> Please try again later.  " + additionalInfo + "</div>";
        $('.side-body').prepend(errorMessage);
    };

};

var viewM = new ViewModel();
ko.applyBindings( viewM );