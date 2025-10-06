const map = L.map('map').setView([-7.0174, 113.8546], 13);
        
        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Store markers and routing control
        let markers = [];
        let routingControl = null;
        
        // Add default marker for Sumenep
        const defaultMarker = L.marker([-7.0174, 113.8546]).addTo(map);
        defaultMarker.bindPopup('<b>Sumenep</b><br>East Java, Indonesia').openPopup();
        markers.push(defaultMarker);
        
        // Click event to show coordinates
        map.on('click', function(e) {
            const lat = e.latlng.lat.toFixed(4);
            const lng = e.latlng.lng.toFixed(4);
            document.getElementById('locationInfo').innerHTML = 
                `Latitude: ${lat}<br>Longitude: ${lng}`;
        });
        
        // Search location function
        async function searchLocation() {
            const query = document.getElementById('searchInput').value;
            if (!query) {
                alert('Please enter a location to search');
                return;
            }
            
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
                const data = await response.json();
                
                if (data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);
                    
                    map.setView([lat, lon], 13);
                    
                    // Clear existing markers except the default one
                    clearMarkers();
                    
                    const marker = L.marker([lat, lon]).addTo(map);
                    marker.bindPopup(`<b>${data[0].display_name}</b>`).openPopup();
                    markers.push(marker);
                    
                    document.getElementById('locationInfo').innerHTML = 
                        `${data[0].display_name}<br>Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
                } else {
                    alert('Location not found. Please try another search.');
                }
            } catch (error) {
                alert('Error searching location. Please try again.');
            }
        }
        
        // Get user's current location
        function getMyLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    
                    map.setView([lat, lon], 13);
                    
                    // Clear existing markers except the default one
                    clearMarkers();
                    
                    const marker = L.marker([lat, lon]).addTo(map);
                    marker.bindPopup('<b>You are here!</b>').openPopup();
                    markers.push(marker);
                    
                    document.getElementById('locationInfo').innerHTML = 
                        `Your Location<br>Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
                }, function() {
                    alert('Unable to retrieve your location');
                });
            } else {
                alert('Geolocation is not supported by your browser');
            }
        }
        
        // Clear markers function
        function clearMarkers() {
            markers.forEach(marker => {
                if (marker !== defaultMarker) {
                    map.removeLayer(marker);
                }
            });
            markers = [defaultMarker];
        }
        
        // Calculate route function
        async function calculateRoute() {
            const startPoint = document.getElementById('startPoint').value;
            const endPoint = document.getElementById('endPoint').value;
            
            if (!startPoint || !endPoint) {
                alert('Please enter both starting point and destination');
                return;
            }
            
            try {
                // Get coordinates for start point
                const startResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(startPoint)}`);
                const startData = await startResponse.json();
                
                // Get coordinates for end point
                const endResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endPoint)}`);
                const endData = await endResponse.json();
                
                if (startData.length > 0 && endData.length > 0) {
                    const startCoords = L.latLng(startData[0].lat, startData[0].lon);
                    const endCoords = L.latLng(endData[0].lat, endData[0].lon);
                    
                    // Clear existing route if any
                    if (routingControl) {
                        map.removeControl(routingControl);
                    }
                    
                    // Add new route
                    routingControl = L.Routing.control({
                        waypoints: [
                            startCoords,
                            endCoords
                        ],
                        routeWhileDragging: true,
                        lineOptions: {
                            styles: [{color: '#667eea', weight: 4}]
                        }
                    }).addTo(map);
                    
                    // Fit the map to show the entire route
                    const bounds = L.latLngBounds([startCoords, endCoords]);
                    map.fitBounds(bounds, {padding: [50, 50]});
                    
                } else {
                    alert('Could not find one or both locations. Please try different search terms.');
                }
            } catch (error) {
                alert('Error calculating route. Please try again.');
            }
        }
        
        // Clear route function
        function clearRoute() {
            if (routingControl) {
                map.removeControl(routingControl);
                routingControl = null;
            }
            document.getElementById('startPoint').value = '';
            document.getElementById('endPoint').value = '';
            document.getElementById('routeInstructions').innerHTML = '';
        }
        
        // Enter key to search
        document.getElementById('searchInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchLocation();
            }
        });
        
        // Enter key for route inputs
        document.getElementById('startPoint').addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && document.getElementById('endPoint').value) {
                calculateRoute();
            }
        });
        
        document.getElementById('endPoint').addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && document.getElementById('startPoint').value) {
                calculateRoute();
            }
        });