import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { Game } from '../../../types/index';
import { UIColors } from '../../../constants/colors';
import SimpleChart from '../../common/SimpleChart';

interface JapanScoreChartProps {
  game: Game;
  height?: number;
  showTitle?: boolean;
  showCard?: boolean;
}

const JapanScoreChart: React.FC<JapanScoreChartProps> = ({
  game,
  height = 400, // Increased from 300 to 400 for better display
  showTitle = true,
  showCard = true
}) => {
  const { t } = useLanguage();

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


  const chartData = generateJapanChartData();

  if (!chartData) {
    return null;
  }

  const chartElement = (
    <SimpleChart
      data={chartData}
      height={height}
      showTitle={false}
    />
  );

  if (!showCard) {
    return chartElement;
  }

  return (
    <Card>
      <CardContent sx={{ p: 0.5, '&:last-child': { pb: 0.5 } }}>
        {showTitle && (
          <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>
            {t('victory.scoreProgression')}
          </Typography>
        )}
        {chartElement}
      </CardContent>
    </Card>
  );
};

export default JapanScoreChart;