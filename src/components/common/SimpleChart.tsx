import React, { useMemo } from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface SimpleChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }>;
  };
  height?: number;
  showTitle?: boolean;
}

const SimpleChart: React.FC<SimpleChartProps> = ({
  data,
  height = 300
}) => {
  const theme = useTheme();

  const chartData = useMemo(() => {
    if (!data || !data.datasets || data.datasets.length === 0) return null;

    const allValues = data.datasets.flatMap(dataset => dataset.data);
    const maxValue = Math.max(...allValues);
    const minValue = Math.min(...allValues);

    // Add some padding to the range for better visualization
    const range = Math.max(maxValue - minValue, 1);
    const paddingPercent = 0.1; // 10% padding
    const adjustedMax = maxValue + range * paddingPercent;
    const adjustedMin = minValue - range * paddingPercent;
    const adjustedRange = adjustedMax - adjustedMin;

    const padding = 20; // Extremely minimal padding
    const chartWidth = 700; // Further increased width
    const chartHeight = height - 80; // Reduced space reserved for legend

    return {
      maxValue: adjustedMax,
      minValue: adjustedMin,
      range: adjustedRange,
      padding,
      chartWidth,
      chartHeight,
      stepX: chartWidth / Math.max(data.labels.length - 1, 1),
      stepY: chartHeight / adjustedRange
    };
  }, [data, height]);

  if (!chartData || !data.datasets) return null;

  return (
    <Box sx={{ width: '100%', height, px: 0 }}> {/* Remove any default padding */}
      <svg
        width="100%"
        height={height - 40} // Reduce SVG height to make space for legend
        viewBox={`${chartData.padding * 0.1} 0 ${chartData.chartWidth + chartData.padding * 1.2} ${height - 40}`} // Crop almost all white space
        style={{ overflow: 'visible' }}
      >
        {/* Grid lines */}
        {Array.from({ length: 6 }, (_, i) => {
          const y = chartData.padding + (chartData.chartHeight / 5) * i;
          const value = Math.round(chartData.maxValue - (chartData.range / 5) * i);
          return (
            <g key={i}>
              <line
                x1={chartData.padding}
                y1={y}
                x2={chartData.chartWidth + chartData.padding}
                y2={y}
                stroke={theme.palette.grey[300]}
                strokeWidth={0.5}
              />
              <text
                x={chartData.padding - 1} // Extremely minimal space from chart to Y-axis labels
                y={y + 4}
                fontSize="10"
                fill={theme.palette.text.secondary}
                textAnchor="end"
              >
                {value}
              </text>
            </g>
          );
        })}

        {/* Data lines */}
        {data.datasets.map((dataset, datasetIndex) => {
          const points = dataset.data.map((value, index) => ({
            x: chartData.padding + index * chartData.stepX,
            y: chartData.padding + chartData.chartHeight - ((value - chartData.minValue) * chartData.stepY)
          }));

          const pathData = points
            .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
            .join(' ');

          return (
            <g key={datasetIndex}>
              {/* Line */}
              <path
                d={pathData}
                fill="none"
                stroke={dataset.borderColor}
                strokeWidth={2}
              />
              {/* Points */}
              {points.map((point, pointIndex) => (
                <circle
                  key={pointIndex}
                  cx={point.x}
                  cy={point.y}
                  r={3}
                  fill={dataset.borderColor}
                />
              ))}
            </g>
          );
        })}

        {/* X-axis labels */}
        {data.labels.map((label, index) => (
          <text
            key={index}
            x={chartData.padding + index * chartData.stepX}
            y={chartData.padding + chartData.chartHeight + 20}
            fontSize="10"
            fill={theme.palette.text.secondary}
            textAnchor="middle"
          >
            {label}
          </text>
        ))}
      </svg>

      {/* Legend */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: { xs: 1, sm: 2 },
        mt: 0.5,
        px: 0, // Remove horizontal padding
        width: '100%',
        minHeight: '28px', // Reduced minimum height
        alignItems: 'center',
      }}>
        {data.datasets.map((dataset, index) => (
          <Box key={index} sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            minWidth: '80px', // Ensure minimum width
            justifyContent: 'center'
          }}>
            <Box
              sx={{
                width: 16,
                height: 2,
                backgroundColor: dataset.borderColor,
                flexShrink: 0
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: '0.75rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '120px' // Limit max width but allow text to show
              }}
            >
              {dataset.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default SimpleChart;