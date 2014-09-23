<apex:page controller="customMapController" showHeader="false"  standardStylesheets="false">
<head>

    <meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
    <link href='https://fonts.googleapis.com/css?family=Tenor+Sans|Open+Sans+Condensed:300' rel='stylesheet' type='text/css' />
    <style type="text/css">
      html { height: 100% }
      body { height: 100%; margin: 0; padding: 0;}
      #map_canvas { 
                height: 100%;
                width:100%; 
                }               
      .info {
        font:12px optima, arial,sans-serif;
        border-style:solid;
        border-color:#faf4cb;
        border-spacing:20px 20px;
        border-radius:10px;
        background-color:#faf4cb; 
        line-height: 1.5;
        letter-spacing:1px; 
     }  
      </style>          
    <script type="text/javascript"  src="https://maps.googleapis.com/maps/api/js?sensor=false"></script>
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>  
    <script type="text/javascript" src="https://google-maps-utility-library-v3.googlecode.com/svn/tags/infobox/1.1.9/src/infobox_packed.js"></script>   
    <script type="text/javascript">   
    
     /* Written by K.Howell  December 2013.*/

        var map;      
        var ib = new InfoBox();
        
          //initialize to create the base map  
        $(document).ready(function() {
            function initialize() {    
                var courseList=[];
                var processedCourses=[];
                var myLatLng = new google.maps.LatLng(40.707123,  -99.033065);
                  
                //setting map options
                var mapOptions = {
                    zoom: 4,
                    center: myLatLng,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                  };
                
                    //adding the map to the div tag                    
                 map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);   
                                
           var address = publicMapController.getOpenCourses(function(records, e){            
                $.each(records,function(index, course){             
                    courseList['key'] = course.Account__r.Location__Latitude__s + ':' + course.Account__r.Location__Longitude__s;
                    var c = {};
                    c['key']=course.Account__r.Location__Latitude__s + ':' + course.Account__r.Location__Longitude__s;
                    //c['Id']=course.Id;
                    c['lat']=course.Account__r.Location__Latitude__s;
                    c['lon']=course.Account__r.Location__Longitude__s;
                    c['customer']=course.Account__r.Name;
                    c['model']=course.Model__c;
                    c['city']=course.Account__r.ShippingCity;
                    c['state']=course.Account__r.ShippingState;
                    c['country']=course.Account__r.ShippingCountry;
                    c['website']=course.Account__r.Website;
                    courseList.push(c);
                });  //ends .each

             
                $.each(courseList, function(key, value) {   
                            
                    //if this customer has not been processed then proceed               
                     if( $.inArray(value['key'], processedCourses) == -1 ) {

                         // Create the marker                
                          var marker = new google.maps.Marker({
                            position: new google.maps.LatLng(result[0]['lat'], result[0]['lon']),
                            map: map,
                            title:"",
                            url:""
                          }); 
                        //return all of the course records with the same key
                         var result = $.grep(courseList, function(v,i) {      //result is passed to the setMouseOver event a few lines down              
                            return v['key'] === value.key;
                        });                                                        
                             
                        setMouseOver(result, marker);    //create the mouseover event listener
                        setMouseOut(marker);    //create the mouseout event listener
                        setMouseClick(marker);
                        processedCourses.push(value.key); 
                                                              
                       }//end if processedCourses == -1 (meaning we have already processed this record)
                    });//end $.each  courseList 
            });   //end function
            
            //add to the company logo to the upper right of the page
            var logoControlDiv = document.createElement('DIV');
            var logoControl = new addLogoControl(logoControlDiv);
            logoControlDiv.index = 0; // used for ordering
            map.controls[google.maps.ControlPosition.RIGHT_TOP].push(logoControlDiv);            
        }
            //trigger the initialize code
            google.maps.event.addDomListener(window, 'load', initialize);

        });//close ready
        
        function openPage(url){
                window.open(url,'_blank');      
        }   
        
        function setMouseOver(result, marker){
            var model;
            var location;       
            var weburl;
                                
             for(var i = 0; i< result.length; i++) {                             
                if(i==0){
                     customer = result[i]['customer'];  
                     city = result[i]['city'];
                     state = result[i]['state'];
                     country =  result[i]['country'];
                     web = result[i]['website'];
                      
                    // console.log('i==0: ' + result[i]['model']+ ' ' + result[i]['customer']);
                     if( result[i]['model'].indexOf("Sky Trail")>= 0){
                    // console.log('i==0 (if): '  + result[i]['model']);
                        model = result[i]['model'].replace("Sky Trail", "Sky Trail&#174;"); 
                     }else{
                     // console.log('i==0 (else): '  + result[i]['model']);
                      model = result[i]['model'];
                     }                  
                }else{
                
                 if( result[i]['model'].indexOf("Sky Trail")>= 0){
                    //console.log('[else] i>0 (if): '  + result[i]['model']);
                        model = model + ', ' + result[i]['model'].replace("Sky Trail", "Sky Trail&#174;");  
                     }else{
                    //console.log('[else] i>0 (else): '  + result[i]['model']);
                      model =  model + ', ' + result[i]['model'];
                     }
                }   //end if i==0                                                
          } //end for results
                                                           
                               
            //manipulate the data to be displayed in the infoBox 
            //city and state if US or CA.  For rest the addresses use a generic international format for city and country
          if((country !='US')&&(country !='USA')&&(country !='United States') &&(country !='CA')&&(country !='Canada')&&(country !=null)){
            location = city + ', ' + country;           
          }else{
            location = city + ', ' + state;             
          }     
                                  
          //if the account record contains a url then create the site name (customer) as a hyperlink
          if(web==null){
                weburl = '<b>Site: </b>'+ customer + '<br>';
          } else {
                weburl =  '<b>Site: </b><a href="javascript:openPage(' + "'"+ web+ "'" + ')">' + customer+ '</a><br>';
          }     
                                  
         //add mouseover event listener
          google.maps.event.addListener(marker, "mouseover", function(event) {
            var boxText = document.createElement("div");
                boxText.style.cssText = "font:12px optima;border-style:solid; border-color:#faf4cb; border-spacing:20px 20px; border-padding:20px; border-radius:10px; background-color:#faf4cb;";                              
                boxText.innerHTML =  '<div class="info">'+ weburl + '<b>Location: </b>'+ location + '<br>'+'<b>Course(s): </b>' + model +'<br>' + '</div>';
                                                                                     
            var myOptions = {
                   content: boxText
                   ,disableAutoPan: false
                   ,maxWidth: 0
                   ,pixelOffset: new google.maps.Size(-140, 0)
                   ,zIndex: null
                   ,boxStyle: {opacity:1 ,width: "280px"}
                   ,closeBoxMargin: "10px 2px 2px 2px"
                   ,closeBoxURL: ""                                 
                   ,infoBoxClearance: new google.maps.Size(1, 1)
                   ,isHidden: false
                   ,pane: "floatPane"
                   ,enableEventPropagation: false
                };   
                            
            ib = new InfoBox(myOptions);                              
                     
                 if (ib) {ib.open(map, this);}                                                          
         });  //close mouseover listener                             
        
        }//close function setMouseOver
        
        function setMouseOut(marker){
            google.maps.event.addListener(marker, "mouseout", function(event) {                           
            //create ib2 otherwise scrolling across multiple markers causes loss of focus on infobox object
                 var ib2 = new InfoBox();
                 ib2 = ib;
                 setTimeout(function(){
                    ib2.close(); },1600);
              }); //close mouseout listener
        }//close function setMouseOut
        
        function setMouseClick(marker){     
          google.maps.event.addListener(marker, "click", function(event) {
             map.setZoom(9);
             map.setCenter(marker.getPosition());
          });//close click listener
        }//close function setMouseClick
        
        function addLogoControl(controlDiv) {
            
            controlDiv.style.padding = '5px';
            var logo = document.createElement('IMG');
            logo.src = "{!URLFOR($Resource.Logo)}"
            logo.style.cursor = 'pointer';
            controlDiv.appendChild(logo);
        /*
            google.maps.event.addDomListener(logo, 'click', function() {
                window.location = 'company url'; 
            });
          */
        }
    </script>
    
    </head>
    <body>
     <div id="map_canvas"></div>      
    </body>
</apex:page>