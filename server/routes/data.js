const express = require('express');
const router = express.Router();

// Earthquake data for Kepler.gl (USGS format)
const earthquakeData = {
    type: 'FeatureCollection',
    features: [
        { type: 'Feature', geometry: { type: 'Point', coordinates: [-122.714, 38.8025] }, properties: { mag: 4.5, place: 'Northern California', time: 1702500000000, depth: 10.2 }},
        { type: 'Feature', geometry: { type: 'Point', coordinates: [-155.2867, 19.4069] }, properties: { mag: 5.1, place: 'Hawaii', time: 1702400000000, depth: 35.0 }},
        { type: 'Feature', geometry: { type: 'Point', coordinates: [141.7589, 39.1538] }, properties: { mag: 6.2, place: 'Japan', time: 1702300000000, depth: 50.5 }},
        { type: 'Feature', geometry: { type: 'Point', coordinates: [-70.6693, -33.4489] }, properties: { mag: 5.8, place: 'Chile', time: 1702200000000, depth: 45.3 }},
        { type: 'Feature', geometry: { type: 'Point', coordinates: [121.0794, 14.5995] }, properties: { mag: 4.9, place: 'Philippines', time: 1702100000000, depth: 25.0 }},
        { type: 'Feature', geometry: { type: 'Point', coordinates: [29.0785, 40.7667] }, properties: { mag: 5.3, place: 'Turkey', time: 1702000000000, depth: 15.8 }},
        { type: 'Feature', geometry: { type: 'Point', coordinates: [95.9560, 20.1500] }, properties: { mag: 5.0, place: 'Myanmar', time: 1701900000000, depth: 20.0 }},
        { type: 'Feature', geometry: { type: 'Point', coordinates: [-117.1611, 32.7157] }, properties: { mag: 3.8, place: 'San Diego, CA', time: 1701800000000, depth: 8.5 }},
        { type: 'Feature', geometry: { type: 'Point', coordinates: [139.6917, 35.6895] }, properties: { mag: 4.2, place: 'Tokyo, Japan', time: 1701700000000, depth: 30.0 }},
        { type: 'Feature', geometry: { type: 'Point', coordinates: [-77.0428, -12.0464] }, properties: { mag: 5.5, place: 'Lima, Peru', time: 1701600000000, depth: 55.0 }},
        { type: 'Feature', geometry: { type: 'Point', coordinates: [106.8456, -6.2088] }, properties: { mag: 5.7, place: 'Jakarta, Indonesia', time: 1701500000000, depth: 40.0 }},
        { type: 'Feature', geometry: { type: 'Point', coordinates: [126.9780, 37.5665] }, properties: { mag: 3.5, place: 'Seoul, South Korea', time: 1701400000000, depth: 12.0 }},
        { type: 'Feature', geometry: { type: 'Point', coordinates: [-118.2437, 34.0522] }, properties: { mag: 4.1, place: 'Los Angeles, CA', time: 1701300000000, depth: 18.0 }},
        { type: 'Feature', geometry: { type: 'Point', coordinates: [77.2090, 28.6139] }, properties: { mag: 4.8, place: 'Delhi, India', time: 1701200000000, depth: 22.0 }},
        { type: 'Feature', geometry: { type: 'Point', coordinates: [-99.1332, 19.4326] }, properties: { mag: 5.2, place: 'Mexico City', time: 1701100000000, depth: 60.0 }},
        { type: 'Feature', geometry: { type: 'Point', coordinates: [174.7633, -41.2865] }, properties: { mag: 5.9, place: 'Wellington, NZ', time: 1701000000000, depth: 35.0 }},
        { type: 'Feature', geometry: { type: 'Point', coordinates: [116.4074, 39.9042] }, properties: { mag: 3.9, place: 'Beijing, China', time: 1700900000000, depth: 15.0 }},
        { type: 'Feature', geometry: { type: 'Point', coordinates: [51.3890, 35.6892] }, properties: { mag: 4.6, place: 'Tehran, Iran', time: 1700800000000, depth: 28.0 }},
        { type: 'Feature', geometry: { type: 'Point', coordinates: [-43.1729, -22.9068] }, properties: { mag: 3.2, place: 'Rio de Janeiro', time: 1700700000000, depth: 10.0 }},
        { type: 'Feature', geometry: { type: 'Point', coordinates: [100.5018, 13.7563] }, properties: { mag: 4.4, place: 'Bangkok, Thailand', time: 1700600000000, depth: 25.0 }},
        { type: 'Feature', geometry: { type: 'Point', coordinates: [-122.4194, 37.7749] }, properties: { mag: 4.0, place: 'San Francisco, CA', time: 1700500000000, depth: 12.0 }},
        { type: 'Feature', geometry: { type: 'Point', coordinates: [135.5023, 34.6937] }, properties: { mag: 4.7, place: 'Osaka, Japan', time: 1700400000000, depth: 20.0 }},
        { type: 'Feature', geometry: { type: 'Point', coordinates: [-79.3832, 43.6532] }, properties: { mag: 2.8, place: 'Toronto, Canada', time: 1700300000000, depth: 5.0 }},
        { type: 'Feature', geometry: { type: 'Point', coordinates: [28.9784, 41.0082] }, properties: { mag: 5.4, place: 'Istanbul, Turkey', time: 1700200000000, depth: 18.0 }},
        { type: 'Feature', geometry: { type: 'Point', coordinates: [72.8777, 19.0760] }, properties: { mag: 4.3, place: 'Mumbai, India', time: 1700100000000, depth: 30.0 }}
    ]
};

// Cities data for CesiumJS
const citiesData = [
    { id: 1, name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503, population: 37400000, continent: "Asia" },
    { id: 2, name: "Delhi", country: "India", lat: 28.7041, lon: 77.1025, population: 31000000, continent: "Asia" },
    { id: 3, name: "Shanghai", country: "China", lat: 31.2304, lon: 121.4737, population: 27800000, continent: "Asia" },
    { id: 4, name: "São Paulo", country: "Brazil", lat: -23.5505, lon: -46.6333, population: 22000000, continent: "South America" },
    { id: 5, name: "Mexico City", country: "Mexico", lat: 19.4326, lon: -99.1332, population: 21800000, continent: "North America" },
    { id: 6, name: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357, population: 21300000, continent: "Africa" },
    { id: 7, name: "Dhaka", country: "Bangladesh", lat: 23.8103, lon: 90.4125, population: 21000000, continent: "Asia" },
    { id: 8, name: "Mumbai", country: "India", lat: 19.0760, lon: 72.8777, population: 20700000, continent: "Asia" },
    { id: 9, name: "Beijing", country: "China", lat: 39.9042, lon: 116.4074, population: 20500000, continent: "Asia" },
    { id: 10, name: "Osaka", country: "Japan", lat: 34.6937, lon: 135.5023, population: 19200000, continent: "Asia" },
    { id: 11, name: "New York", country: "USA", lat: 40.7128, lon: -74.0060, population: 18800000, continent: "North America" },
    { id: 12, name: "Karachi", country: "Pakistan", lat: 24.8607, lon: 67.0011, population: 16100000, continent: "Asia" },
    { id: 13, name: "Buenos Aires", country: "Argentina", lat: -34.6037, lon: -58.3816, population: 15400000, continent: "South America" },
    { id: 14, name: "Istanbul", country: "Turkey", lat: 41.0082, lon: 28.9784, population: 15200000, continent: "Europe" },
    { id: 15, name: "Kolkata", country: "India", lat: 22.5726, lon: 88.3639, population: 14900000, continent: "Asia" },
    { id: 16, name: "Lagos", country: "Nigeria", lat: 6.5244, lon: 3.3792, population: 14800000, continent: "Africa" },
    { id: 17, name: "Manila", country: "Philippines", lat: 14.5995, lon: 120.9842, population: 14400000, continent: "Asia" },
    { id: 18, name: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lon: -43.1729, population: 13500000, continent: "South America" },
    { id: 19, name: "Guangzhou", country: "China", lat: 23.1291, lon: 113.2644, population: 13300000, continent: "Asia" },
    { id: 20, name: "Los Angeles", country: "USA", lat: 34.0522, lon: -118.2437, population: 12500000, continent: "North America" },
    { id: 21, name: "Moscow", country: "Russia", lat: 55.7558, lon: 37.6173, population: 12500000, continent: "Europe" },
    { id: 22, name: "Paris", country: "France", lat: 48.8566, lon: 2.3522, population: 11000000, continent: "Europe" },
    { id: 23, name: "London", country: "UK", lat: 51.5074, lon: -0.1278, population: 9500000, continent: "Europe" },
    { id: 24, name: "Bangkok", country: "Thailand", lat: 13.7563, lon: 100.5018, population: 10700000, continent: "Asia" },
    { id: 25, name: "Jakarta", country: "Indonesia", lat: -6.2088, lon: 106.8456, population: 10600000, continent: "Asia" },
    { id: 26, name: "Seoul", country: "South Korea", lat: 37.5665, lon: 126.9780, population: 9900000, continent: "Asia" },
    { id: 27, name: "Lima", country: "Peru", lat: -12.0464, lon: -77.0428, population: 10800000, continent: "South America" },
    { id: 28, name: "Toronto", country: "Canada", lat: 43.6532, lon: -79.3832, population: 6200000, continent: "North America" },
    { id: 29, name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093, population: 5300000, continent: "Oceania" },
    { id: 30, name: "Berlin", country: "Germany", lat: 52.5200, lon: 13.4050, population: 3700000, continent: "Europe" },
    { id: 31, name: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198, population: 5900000, continent: "Asia" },
    { id: 32, name: "Dubai", country: "UAE", lat: 25.2048, lon: 55.2708, population: 3400000, continent: "Asia" },
    { id: 33, name: "Cape Town", country: "South Africa", lat: -33.9249, lon: 18.4241, population: 4700000, continent: "Africa" },
    { id: 34, name: "Nairobi", country: "Kenya", lat: -1.2921, lon: 36.8219, population: 4700000, continent: "Africa" },
    { id: 35, name: "Madrid", country: "Spain", lat: 40.4168, lon: -3.7038, population: 6600000, continent: "Europe" }
];

// Population density data for D3.js choropleth
const populationDensityData = {
    type: 'countries',
    data: {
        "CHN": { name: "China", density: 153, population: 1412000000 },
        "IND": { name: "India", density: 464, population: 1408000000 },
        "USA": { name: "United States", density: 36, population: 331900000 },
        "IDN": { name: "Indonesia", density: 151, population: 273500000 },
        "PAK": { name: "Pakistan", density: 287, population: 225200000 },
        "BRA": { name: "Brazil", density: 25, population: 214300000 },
        "NGA": { name: "Nigeria", density: 226, population: 211400000 },
        "BGD": { name: "Bangladesh", density: 1265, population: 166300000 },
        "RUS": { name: "Russia", density: 9, population: 144100000 },
        "MEX": { name: "Mexico", density: 66, population: 130300000 },
        "JPN": { name: "Japan", density: 347, population: 125800000 },
        "ETH": { name: "Ethiopia", density: 115, population: 118000000 },
        "PHL": { name: "Philippines", density: 368, population: 111000000 },
        "EGY": { name: "Egypt", density: 103, population: 104300000 },
        "VNM": { name: "Vietnam", density: 314, population: 98200000 },
        "DEU": { name: "Germany", density: 240, population: 83200000 },
        "TUR": { name: "Turkey", density: 110, population: 85000000 },
        "IRN": { name: "Iran", density: 52, population: 87900000 },
        "THA": { name: "Thailand", density: 137, population: 70000000 },
        "GBR": { name: "United Kingdom", density: 281, population: 67500000 },
        "FRA": { name: "France", density: 119, population: 67800000 },
        "ITA": { name: "Italy", density: 206, population: 59100000 },
        "ZAF": { name: "South Africa", density: 49, population: 60000000 },
        "TZA": { name: "Tanzania", density: 67, population: 63600000 },
        "KEN": { name: "Kenya", density: 94, population: 55000000 },
        "KOR": { name: "South Korea", density: 527, population: 51800000 },
        "COL": { name: "Colombia", density: 46, population: 51900000 },
        "ESP": { name: "Spain", density: 94, population: 47400000 },
        "ARG": { name: "Argentina", density: 17, population: 45800000 },
        "DZA": { name: "Algeria", density: 18, population: 45400000 },
        "UKR": { name: "Ukraine", density: 75, population: 41200000 },
        "IRQ": { name: "Iraq", density: 93, population: 42200000 },
        "POL": { name: "Poland", density: 124, population: 37700000 },
        "CAN": { name: "Canada", density: 4, population: 38400000 },
        "MAR": { name: "Morocco", density: 83, population: 37300000 },
        "SAU": { name: "Saudi Arabia", density: 16, population: 35300000 },
        "PER": { name: "Peru", density: 26, population: 33400000 },
        "MYS": { name: "Malaysia", density: 99, population: 32800000 },
        "AUS": { name: "Australia", density: 3, population: 26000000 },
        "NLD": { name: "Netherlands", density: 508, population: 17500000 },
        "BEL": { name: "Belgium", density: 383, population: 11600000 },
        "GRC": { name: "Greece", density: 81, population: 10400000 },
        "CZE": { name: "Czechia", density: 139, population: 10700000 },
        "PRT": { name: "Portugal", density: 111, population: 10300000 },
        "SWE": { name: "Sweden", density: 25, population: 10500000 },
        "AZE": { name: "Azerbaijan", density: 123, population: 10200000 },
        "HUN": { name: "Hungary", density: 107, population: 9600000 },
        "AUT": { name: "Austria", density: 109, population: 9000000 },
        "CHE": { name: "Switzerland", density: 219, population: 8700000 },
        "ISR": { name: "Israel", density: 400, population: 9500000 },
        "SGP": { name: "Singapore", density: 8358, population: 5500000 },
        "DNK": { name: "Denmark", density: 137, population: 5900000 },
        "FIN": { name: "Finland", density: 18, population: 5500000 },
        "NOR": { name: "Norway", density: 15, population: 5400000 },
        "IRL": { name: "Ireland", density: 72, population: 5100000 },
        "NZL": { name: "New Zealand", density: 19, population: 5100000 }
    }
};

// API Endpoints

// Get all datasets info
router.get('/', (req, res) => {
    res.json({
        message: 'SDSS Geospatial Data API',
        endpoints: {
            earthquakes: '/api/data/earthquakes',
            cities: '/api/data/cities',
            population: '/api/data/population',
            kepler: '/api/data/kepler-config'
        }
    });
});

// Earthquake data endpoint
router.get('/earthquakes', (req, res) => {
    res.json(earthquakeData);
});

// Cities data endpoint
router.get('/cities', (req, res) => {
    const { continent, minPopulation } = req.query;
    let filteredCities = [...citiesData];
    
    if (continent) {
        filteredCities = filteredCities.filter(city => 
            city.continent.toLowerCase() === continent.toLowerCase()
        );
    }
    
    if (minPopulation) {
        filteredCities = filteredCities.filter(city => 
            city.population >= parseInt(minPopulation)
        );
    }
    
    res.json({
        count: filteredCities.length,
        cities: filteredCities
    });
});

// Population density endpoint
router.get('/population', (req, res) => {
    res.json(populationDensityData);
});

// Kepler.gl configuration endpoint
router.get('/kepler-config', (req, res) => {
    const keplerConfig = {
        version: 'v1',
        config: {
            visState: {
                filters: [],
                layers: [{
                    id: 'earthquakes',
                    type: 'point',
                    config: {
                        dataId: 'earthquakes',
                        label: 'Earthquakes',
                        color: [255, 87, 51],
                        columns: {
                            lat: 'latitude',
                            lng: 'longitude'
                        },
                        isVisible: true,
                        visConfig: {
                            radius: 10,
                            fixedRadius: false,
                            opacity: 0.8,
                            colorRange: {
                                name: 'Global Warming',
                                type: 'sequential',
                                category: 'Uber',
                                colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300']
                            },
                            radiusRange: [5, 50]
                        }
                    }
                }],
                interactionConfig: {
                    tooltip: {
                        fieldsToShow: {
                            earthquakes: ['mag', 'place', 'depth']
                        },
                        enabled: true
                    },
                    brush: { enabled: false }
                }
            },
            mapState: {
                latitude: 20,
                longitude: 0,
                zoom: 2
            },
            mapStyle: {
                styleType: 'dark'
            }
        }
    };
    res.json(keplerConfig);
});

// Statistics endpoint
router.get('/stats', (req, res) => {
    const stats = {
        earthquakes: {
            total: earthquakeData.features.length,
            avgMagnitude: (earthquakeData.features.reduce((sum, f) => sum + f.properties.mag, 0) / earthquakeData.features.length).toFixed(2),
            maxMagnitude: Math.max(...earthquakeData.features.map(f => f.properties.mag))
        },
        cities: {
            total: citiesData.length,
            totalPopulation: citiesData.reduce((sum, c) => sum + c.population, 0),
            continents: [...new Set(citiesData.map(c => c.continent))]
        },
        countries: {
            total: Object.keys(populationDensityData.data).length,
            avgDensity: Math.round(Object.values(populationDensityData.data).reduce((sum, c) => sum + c.density, 0) / Object.keys(populationDensityData.data).length)
        }
    };
    res.json(stats);
});

module.exports = router;
