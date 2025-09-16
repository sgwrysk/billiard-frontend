import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { Game } from '../../../types/index';
import { UIColors } from '../../../constants/colors';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface JapanScoreChartProps {
  game: Game;
  height?: number;
  showTitle?: boolean;
  showCard?: boolean;
}

const JapanScoreChart: React.FC<JapanScoreChartProps> = ({
  game,
  height = 300,
  showTitle = true,
  showCard = true
}) => {
  const { t, language } = useLanguage();

  // Generate chart data for Japan game - rack vs cumulative points
  const generateJapanChartData = () => {
    if (!game.japanRackHistory || game.japanRackHistory.length === 0) {
      return null;
    }

    const playerColors = UIColors.chart.playerColors;
    const racks = game.japanRackHistory.sort((a, b) => a.rackNumber - b.rackNumber);
    
    // Create labels starting with rack 0 (initial state)
    const labels = ['0', ...racks.map(rack => `${rack.rackNumber}`)];
    
    // Create datasets for each player
    const datasets = game.players.map((player, index) => {
      // Start with 0 points for rack 0, then add actual rack data
      const playerData = [0, ...racks.map(rack => {
        const playerResult = rack.playerResults.find(result => result.playerId === player.id);
        return playerResult ? playerResult.totalPoints : 0;
      })];

      return {
        label: player.name,
        data: playerData,
        borderColor: playerColors[index % playerColors.length],
        backgroundColor: playerColors[index % playerColors.length] + '20',
        tension: 0.1,
        fill: false,
      };
    });

    return {
      labels,
      datasets,
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: false,
        },
      },
      x: {
        title: {
          display: true,
          text: language === 'en' ? 'Rack' : 'ラック',
        },
      },
    },
  };

  const chartData = generateJapanChartData();

  if (!chartData) {
    return null;
  }

  const chartElement = (
    <Box sx={{ height }}>
      <Line data={chartData} options={chartOptions} />
    </Box>
  );

  if (!showCard) {
    return chartElement;
  }

  return (
    <Card>
      <CardContent>
        {showTitle && (
          <Typography variant="h6" gutterBottom>
            {t('victory.scoreProgression')}
          </Typography>
        )}
        {chartElement}
      </CardContent>
    </Card>
  );
};

export default JapanScoreChart;