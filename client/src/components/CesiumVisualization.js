import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress, Paper, Chip } from '@mui/material';
import axios from 'axios';

// Access Cesium from window (loaded via CDN)
const Cesium = window.Cesium;

function CesiumVisualization() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState(null);
  const cesiumContainerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    axios.get('/api/data/cities')
      .then(res => {
        setData(res.data.cities);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching cities data:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loading && data && cesiumContainerRef.current && !viewerRef.current) {
      // Initialize Cesium
      Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6MTQ0ODMsImlhdCI6MTY2NDU0MjQ4M30.FkVGQC8Dz-lIRVu7HkuCNOm1rAuT_t7qMRLToxAemwk';

      const viewer = new Cesium.Viewer(cesiumContainerRef.current, {
        animation: false,
        timeline: false,
        baseLayerPicker: true,
        geocoder: true,
        homeButton: true,
        sceneModePicker: true,
        navigationHelpButton: false,
        fullscreenButton: false,
        selectionIndicator: true,
        infoBox: true,
      });

      // Add terrain asynchronously (new API in CesiumJS 1.107+)
      Cesium.createWorldTerrainAsync().then(terrainProvider => {
        viewer.terrainProvider = terrainProvider;
      }).catch(err => {
        console.log('Terrain loading skipped:', err);
      });

      viewerRef.current = viewer;

      // Add city markers
      data.forEach(city => {
        let color;
        let size;

        if (city.population >= 20000000) {
          color = Cesium.Color.RED;
          size = 18;
        } else if (city.population >= 10000000) {
          color = Cesium.Color.ORANGE;
          size = 14;
        } else if (city.population >= 5000000) {
          color = Cesium.Color.YELLOW;
          size = 11;
        } else {
          color = Cesium.Color.fromCssColorString('#00ff88');
          size = 8;
        }

        viewer.entities.add({
          name: city.name,
          position: Cesium.Cartesian3.fromDegrees(city.lon, city.lat),
          point: {
            pixelSize: size,
            color: color,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          },
          label: {
            text: city.name,
            font: '14px Inter, sans-serif',
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            outlineColor: Cesium.Color.BLACK,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -20),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 8000000),
          },
          description: `
            <div style="font-family: Inter, sans-serif; padding: 10px;">
              <h3 style="margin: 0 0 10px 0; color: #00d4ff;">${city.name}</h3>
              <p><strong>Country:</strong> ${city.country}</p>
              <p><strong>Continent:</strong> ${city.continent}</p>
              <p><strong>Population:</strong> ${(city.population / 1000000).toFixed(1)} Million</p>
              <p><strong>Coordinates:</strong> ${city.lat.toFixed(4)}°, ${city.lon.toFixed(4)}°</p>
            </div>
          `,
        });
      });

      // Set initial camera position
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(20, 20, 25000000),
        duration: 2,
      });

      // Handle entity selection
      viewer.selectedEntityChanged.addEventListener((entity) => {
        if (entity) {
          const cityData = data.find(c => c.name === entity.name);
          setSelectedCity(cityData);
        } else {
          setSelectedCity(null);
        }
      });
    }

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [loading, data]);

  if (loading) {
    return (
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress sx={{ color: '#7c3aed' }} />
        <Typography sx={{ color: 'grey.400' }}>Loading CesiumJS 3D Globe...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      <div 
        ref={cesiumContainerRef} 
        style={{ width: '100%', height: '100%' }}
      />

      {/* Legend */}
      <Paper
        sx={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          p: 2,
          bgcolor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          zIndex: 1000,
        }}
      >
        <Typography variant="subtitle2" sx={{ color: '#7c3aed', mb: 1, fontWeight: 600 }}>
          🌍 World Major Cities
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: 'red', border: '2px solid white' }} />
            <Typography variant="caption" sx={{ color: 'grey.300' }}>Population ≥ 20M</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: 'orange', border: '2px solid white' }} />
            <Typography variant="caption" sx={{ color: 'grey.300' }}>Population 10-20M</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: 'yellow', border: '2px solid white' }} />
            <Typography variant="caption" sx={{ color: 'grey.300' }}>Population 5-10M</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#00ff88', border: '2px solid white' }} />
            <Typography variant="caption" sx={{ color: 'grey.300' }}>Population &lt; 5M</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Data Info */}
      <Paper
        sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          p: 2,
          bgcolor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          zIndex: 1000,
        }}
      >
        <Typography variant="subtitle2" sx={{ color: '#7c3aed', fontWeight: 600 }}>
          CesiumJS 3D Globe
        </Typography>
        <Typography variant="caption" sx={{ color: 'grey.400', display: 'block' }}>
          Dataset: World Major Cities
        </Typography>
        <Typography variant="caption" sx={{ color: 'grey.400' }}>
          Cities: {data?.length || 0} locations
        </Typography>
      </Paper>

      {/* Selected City Info */}
      {selectedCity && (
        <Paper
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            p: 2,
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            border: '1px solid rgba(124, 58, 237, 0.5)',
            zIndex: 1000,
            minWidth: 220,
          }}
        >
          <Typography variant="subtitle1" sx={{ color: '#7c3aed', fontWeight: 600 }}>
            {selectedCity.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'grey.300' }}>
            {selectedCity.country}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Chip 
              label={`${(selectedCity.population / 1000000).toFixed(1)}M people`} 
              size="small" 
              sx={{ bgcolor: 'rgba(124, 58, 237, 0.3)', color: '#7c3aed', mr: 1, mb: 1 }}
            />
            <Chip 
              label={selectedCity.continent} 
              size="small" 
              sx={{ bgcolor: 'rgba(0, 212, 255, 0.3)', color: '#00d4ff', mb: 1 }}
            />
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default CesiumVisualization;
