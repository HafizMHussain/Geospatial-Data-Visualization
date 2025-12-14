import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import axios from 'axios';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

function D3Visualization() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    axios.get('/api/data/population')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching population data:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loading && data && svgRef.current && containerRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;

      svg.attr('width', width).attr('height', height);

      // Create projection
      const projection = d3.geoNaturalEarth1()
        .scale(width / 5.5)
        .translate([width / 2, height / 2]);

      const path = d3.geoPath().projection(projection);

      // Color scale for population density
      const colorScale = d3.scaleThreshold()
        .domain([10, 25, 50, 100, 250, 500, 1000])
        .range(d3.schemeBlues[8]);

      // Background
      svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', '#0a1628');

      // Load world map
      d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
        .then(worldData => {
          const countries = topojson.feature(worldData, worldData.objects.countries);

          // Draw graticule
          const graticule = d3.geoGraticule();
          svg.append('path')
            .datum(graticule())
            .attr('d', path)
            .attr('fill', 'none')
            .attr('stroke', 'rgba(255, 255, 255, 0.1)')
            .attr('stroke-width', 0.5);

          // ISO numeric to ISO alpha-3 mapping (partial)
          const numericToAlpha = {
            '156': 'CHN', '356': 'IND', '840': 'USA', '360': 'IDN', '586': 'PAK',
            '076': 'BRA', '566': 'NGA', '050': 'BGD', '643': 'RUS', '484': 'MEX',
            '392': 'JPN', '231': 'ETH', '608': 'PHL', '818': 'EGY', '704': 'VNM',
            '276': 'DEU', '792': 'TUR', '364': 'IRN', '764': 'THA', '826': 'GBR',
            '250': 'FRA', '380': 'ITA', '710': 'ZAF', '834': 'TZA', '404': 'KEN',
            '410': 'KOR', '170': 'COL', '724': 'ESP', '032': 'ARG', '012': 'DZA',
            '804': 'UKR', '368': 'IRQ', '616': 'POL', '124': 'CAN', '504': 'MAR',
            '682': 'SAU', '604': 'PER', '458': 'MYS', '036': 'AUS', '528': 'NLD',
            '056': 'BEL', '300': 'GRC', '203': 'CZE', '620': 'PRT', '752': 'SWE',
            '031': 'AZE', '348': 'HUN', '040': 'AUT', '756': 'CHE', '376': 'ISR',
            '702': 'SGP', '208': 'DNK', '246': 'FIN', '578': 'NOR', '372': 'IRL',
            '554': 'NZL'
          };

          // Draw countries
          svg.selectAll('.country')
            .data(countries.features)
            .enter()
            .append('path')
            .attr('class', 'country')
            .attr('d', path)
            .attr('fill', d => {
              const alpha3 = numericToAlpha[d.id];
              const countryData = data.data[alpha3];
              return countryData ? colorScale(countryData.density) : '#2a2a4a';
            })
            .attr('stroke', '#1a1a3e')
            .attr('stroke-width', 0.5)
            .style('cursor', 'pointer')
            .on('mouseover', function(event, d) {
              d3.select(this)
                .attr('stroke', '#00d4ff')
                .attr('stroke-width', 2);
              
              const alpha3 = numericToAlpha[d.id];
              const countryData = data.data[alpha3];
              if (countryData) {
                setHoveredCountry({
                  code: alpha3,
                  ...countryData
                });
              } else {
                setHoveredCountry({ code: d.id, name: 'Unknown', density: 'N/A', population: 'N/A' });
              }
              setMousePos({ x: event.pageX, y: event.pageY });
            })
            .on('mousemove', function(event) {
              setMousePos({ x: event.pageX, y: event.pageY });
            })
            .on('mouseout', function() {
              d3.select(this)
                .attr('stroke', '#1a1a3e')
                .attr('stroke-width', 0.5);
              setHoveredCountry(null);
            });

          // Create legend
          const legendWidth = 200;
          const legendHeight = 15;
          const legendX = 30;
          const legendY = height - 50;

          // Gradient for legend
          const defs = svg.append('defs');
          const gradient = defs.append('linearGradient')
            .attr('id', 'density-gradient');

          const colors = d3.schemeBlues[8];
          colors.forEach((color, i) => {
            gradient.append('stop')
              .attr('offset', `${(i / (colors.length - 1)) * 100}%`)
              .attr('stop-color', color);
          });

          // Legend rectangle
          svg.append('rect')
            .attr('x', legendX)
            .attr('y', legendY)
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .attr('fill', 'url(#density-gradient)')
            .attr('stroke', 'rgba(255, 255, 255, 0.3)')
            .attr('stroke-width', 1);

          // Legend labels
          svg.append('text')
            .attr('x', legendX)
            .attr('y', legendY - 8)
            .attr('fill', '#f59e0b')
            .attr('font-size', '14px')
            .attr('font-weight', '600')
            .text('Population Density (per km²)');

          svg.append('text')
            .attr('x', legendX)
            .attr('y', legendY + legendHeight + 15)
            .attr('fill', '#aaa')
            .attr('font-size', '11px')
            .text('0');

          svg.append('text')
            .attr('x', legendX + legendWidth / 2)
            .attr('y', legendY + legendHeight + 15)
            .attr('fill', '#aaa')
            .attr('font-size', '11px')
            .attr('text-anchor', 'middle')
            .text('500');

          svg.append('text')
            .attr('x', legendX + legendWidth)
            .attr('y', legendY + legendHeight + 15)
            .attr('fill', '#aaa')
            .attr('font-size', '11px')
            .attr('text-anchor', 'end')
            .text('1000+');
        });
    }
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
        <CircularProgress sx={{ color: '#f59e0b' }} />
        <Typography sx={{ color: 'grey.400' }}>Loading D3.js Choropleth Map...</Typography>
      </Box>
    );
  }

  return (
    <Box ref={containerRef} sx={{ height: '100%', position: 'relative', bgcolor: '#0a1628' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />

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
        }}
      >
        <Typography variant="subtitle2" sx={{ color: '#f59e0b', fontWeight: 600 }}>
          D3.js Choropleth Map
        </Typography>
        <Typography variant="caption" sx={{ color: 'grey.400', display: 'block' }}>
          Dataset: World Population Density
        </Typography>
        <Typography variant="caption" sx={{ color: 'grey.400' }}>
          Countries: {data ? Object.keys(data.data).length : 0}
        </Typography>
      </Paper>

      {/* Hover Tooltip */}
      {hoveredCountry && (
        <Paper
          sx={{
            position: 'fixed',
            left: mousePos.x + 15,
            top: mousePos.y - 10,
            p: 2,
            bgcolor: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            border: '1px solid rgba(245, 158, 11, 0.5)',
            zIndex: 10000,
            pointerEvents: 'none',
            minWidth: 180,
          }}
        >
          <Typography variant="subtitle2" sx={{ color: '#f59e0b', fontWeight: 600 }}>
            {hoveredCountry.name || `Country: ${hoveredCountry.code}`}
          </Typography>
          {hoveredCountry.density !== 'N/A' && (
            <>
              <Typography variant="body2" sx={{ color: 'grey.300', mt: 0.5 }}>
                <strong>Density:</strong> {hoveredCountry.density} /km²
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.300' }}>
                <strong>Population:</strong> {(hoveredCountry.population / 1000000).toFixed(1)}M
              </Typography>
            </>
          )}
        </Paper>
      )}

      {/* Stats */}
      <Paper
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          p: 2,
          bgcolor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle2" sx={{ color: '#f59e0b', fontWeight: 600, mb: 1 }}>
          📊 Statistics
        </Typography>
        {data && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'grey.300' }}>
              Highest: Singapore (8,358/km²)
            </Typography>
            <Typography variant="caption" sx={{ color: 'grey.300' }}>
              Lowest: Australia (3/km²)
            </Typography>
            <Typography variant="caption" sx={{ color: 'grey.300' }}>
              World Avg: ~60/km²
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default D3Visualization;
