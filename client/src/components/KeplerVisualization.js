import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Paper, Chip } from '@mui/material';
import axios from 'axios';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, ArcLayer } from '@deck.gl/layers';
import { Map } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2xhYmNkZWZnMDEyMzN2cGhpamtsbW5vcCJ9.qrstuvwxyz';

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 20,
  zoom: 1.5,
  pitch: 45,
  bearing: 0,
};

function KeplerVisualization() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [hoveredObject, setHoveredObject] = useState(null);

  useEffect(() => {
    axios.get('/api/data/earthquakes')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching earthquake data:', err);
        setLoading(false);
      });
  }, []);

  const getColor = (magnitude) => {
    if (magnitude >= 6) return [255, 0, 0, 200];
    if (magnitude >= 5) return [255, 127, 0, 200];
    if (magnitude >= 4) return [255, 255, 0, 200];
    return [0, 255, 0, 200];
  };

  const getRadius = (magnitude) => {
    return Math.pow(2, magnitude) * 1000;
  };

  const layers = data ? [
    new ScatterplotLayer({
      id: 'earthquakes',
      data: data.features,
      pickable: true,
      opacity: 0.8,
      stroked: true,
      filled: true,
      radiusScale: 1,
      radiusMinPixels: 5,
      radiusMaxPixels: 100,
      lineWidthMinPixels: 1,
      getPosition: d => d.geometry.coordinates,
      getRadius: d => getRadius(d.properties.mag),
      getFillColor: d => getColor(d.properties.mag),
      getLineColor: [255, 255, 255, 100],
      onHover: info => setHoveredObject(info.object),
    }),
    new ArcLayer({
      id: 'arcs',
      data: data.features.slice(0, 10),
      pickable: true,
      getWidth: 2,
      getSourcePosition: d => d.geometry.coordinates,
      getTargetPosition: () => [0, 0],
      getSourceColor: [0, 212, 255, 150],
      getTargetColor: [124, 58, 237, 150],
    }),
  ] : [];

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
        <CircularProgress sx={{ color: '#00d4ff' }} />
        <Typography sx={{ color: 'grey.400' }}>Loading Earthquake Data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState }) => setViewState(viewState)}
        controller={true}
        layers={layers}
        style={{ background: '#0a0a1a' }}
      >
        <Map
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
          mapboxAccessToken={MAPBOX_TOKEN}
        />
      </DeckGL>

      {/* Legend */}
      <Paper
        sx={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          p: 2,
          bgcolor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle2" sx={{ color: '#00d4ff', mb: 1, fontWeight: 600 }}>
          🌍 Earthquake Magnitude
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: 'rgb(255, 0, 0)' }} />
            <Typography variant="caption" sx={{ color: 'grey.300' }}>≥ 6.0 (Major)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: 'rgb(255, 127, 0)' }} />
            <Typography variant="caption" sx={{ color: 'grey.300' }}>5.0 - 5.9 (Strong)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'rgb(255, 255, 0)' }} />
            <Typography variant="caption" sx={{ color: 'grey.300' }}>4.0 - 4.9 (Light)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'rgb(0, 255, 0)' }} />
            <Typography variant="caption" sx={{ color: 'grey.300' }}>&lt; 4.0 (Minor)</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Hover Tooltip */}
      {hoveredObject && (
        <Paper
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            p: 2,
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            border: '1px solid rgba(0, 212, 255, 0.5)',
            minWidth: 200,
          }}
        >
          <Typography variant="subtitle2" sx={{ color: '#00d4ff', fontWeight: 600 }}>
            {hoveredObject.properties.place}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Chip 
              label={`Magnitude: ${hoveredObject.properties.mag}`} 
              size="small" 
              sx={{ bgcolor: 'rgba(255, 87, 51, 0.3)', color: '#ff5733', mr: 1, mb: 1 }}
            />
            <Chip 
              label={`Depth: ${hoveredObject.properties.depth}km`} 
              size="small" 
              sx={{ bgcolor: 'rgba(0, 212, 255, 0.3)', color: '#00d4ff', mb: 1 }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: 'grey.500' }}>
            Coords: [{hoveredObject.geometry.coordinates[0].toFixed(4)}, {hoveredObject.geometry.coordinates[1].toFixed(4)}]
          </Typography>
        </Paper>
      )}

      {/* Data Info */}
      <Paper
        sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          p: 2,
          bgcolor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle2" sx={{ color: '#00d4ff', fontWeight: 600 }}>
          Kepler.gl Style Visualization
        </Typography>
        <Typography variant="caption" sx={{ color: 'grey.400', display: 'block' }}>
          Dataset: Global Earthquake Data (USGS)
        </Typography>
        <Typography variant="caption" sx={{ color: 'grey.400' }}>
          Points: {data?.features?.length || 0} earthquakes
        </Typography>
      </Paper>
    </Box>
  );
}

export default KeplerVisualization;
