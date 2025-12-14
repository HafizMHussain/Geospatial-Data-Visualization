import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  FormControl,
  Select,
  MenuItem,
  Container,
  Paper,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import MapIcon from '@mui/icons-material/Map';
import BarChartIcon from '@mui/icons-material/BarChart';
import InfoIcon from '@mui/icons-material/Info';
import axios from 'axios';

// Components
import KeplerVisualization from './components/KeplerVisualization';
import CesiumVisualization from './components/CesiumVisualization';
import D3Visualization from './components/D3Visualization';

function Dashboard() {
  const [selectedTool, setSelectedTool] = useState('kepler');
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Fetch stats from API
    axios.get('/api/data/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error('Error fetching stats:', err));
  }, []);

  useEffect(() => {
    // Sync URL with selected tool
    const path = location.pathname.slice(1) || 'kepler';
    if (['kepler', 'cesium', 'd3'].includes(path)) {
      setSelectedTool(path);
    }
  }, [location]);

  const handleToolChange = (event) => {
    const tool = event.target.value;
    setSelectedTool(tool);
    navigate(`/${tool}`);
  };

  const toolInfo = {
    kepler: {
      name: 'Kepler.gl',
      icon: <MapIcon />,
      description: 'Large-scale geospatial data visualization',
      color: '#00d4ff'
    },
    cesium: {
      name: 'CesiumJS',
      icon: <PublicIcon />,
      description: '3D globe and terrain visualization',
      color: '#7c3aed'
    },
    d3: {
      name: 'D3.js',
      icon: <BarChartIcon />,
      description: 'Data-driven document visualization',
      color: '#f59e0b'
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#0a0a1a' }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: 'rgba(26, 26, 46, 0.95)', backdropFilter: 'blur(10px)' }}>
        <Toolbar>
          <PublicIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            SDSS Geospatial Visualization
          </Typography>
          
          <FormControl sx={{ minWidth: 250 }}>
            <Select
              value={selectedTool}
              onChange={handleToolChange}
              sx={{
                color: 'white',
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 212, 255, 0.5)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 212, 255, 0.8)',
                },
                '.MuiSvgIcon-root': {
                  color: 'primary.main',
                },
              }}
            >
              <MenuItem value="kepler">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MapIcon sx={{ color: '#00d4ff' }} />
                  <span>Kepler.gl - Earthquake Map</span>
                </Box>
              </MenuItem>
              <MenuItem value="cesium">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PublicIcon sx={{ color: '#7c3aed' }} />
                  <span>CesiumJS - 3D Globe</span>
                </Box>
              </MenuItem>
              <MenuItem value="d3">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BarChartIcon sx={{ color: '#f59e0b' }} />
                  <span>D3.js - Population Map</span>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
          
          <Tooltip title="Assignment Info">
            <IconButton sx={{ ml: 2, color: 'primary.main' }}>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Tool Info Bar */}
      <Paper 
        sx={{ 
          p: 2, 
          bgcolor: 'rgba(26, 26, 46, 0.8)', 
          borderRadius: 0,
          borderBottom: `2px solid ${toolInfo[selectedTool].color}`
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ color: toolInfo[selectedTool].color }}>
                {toolInfo[selectedTool].icon}
              </Box>
              <Box>
                <Typography variant="h6" sx={{ color: toolInfo[selectedTool].color, fontWeight: 600 }}>
                  {toolInfo[selectedTool].name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'grey.400' }}>
                  {toolInfo[selectedTool].description}
                </Typography>
              </Box>
            </Box>
            
            {stats && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={`${stats.earthquakes.total} Earthquakes`} 
                  size="small" 
                  sx={{ bgcolor: 'rgba(0, 212, 255, 0.2)', color: '#00d4ff' }}
                />
                <Chip 
                  label={`${stats.cities.total} Cities`} 
                  size="small" 
                  sx={{ bgcolor: 'rgba(124, 58, 237, 0.2)', color: '#7c3aed' }}
                />
                <Chip 
                  label={`${stats.countries.total} Countries`} 
                  size="small" 
                  sx={{ bgcolor: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}
                />
              </Box>
            )}
          </Box>
        </Container>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <Container maxWidth="xl" sx={{ height: '100%' }}>
          <Paper 
            sx={{ 
              height: 'calc(100vh - 200px)', 
              minHeight: 500,
              bgcolor: 'rgba(26, 26, 46, 0.5)',
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <Routes>
              <Route path="/" element={<KeplerVisualization />} />
              <Route path="/kepler" element={<KeplerVisualization />} />
              <Route path="/cesium" element={<CesiumVisualization />} />
              <Route path="/d3" element={<D3Visualization />} />
            </Routes>
          </Paper>
        </Container>
      </Box>

      {/* Footer */}
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: 'rgba(26, 26, 46, 0.95)', 
          textAlign: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Typography variant="body2" sx={{ color: 'grey.500' }}>
          GIE 419 - Spatial Decision Support Systems | Assignment 3 | Kepler.gl • CesiumJS • D3.js
        </Typography>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <Router>
      <Dashboard />
    </Router>
  );
}

export default App;
