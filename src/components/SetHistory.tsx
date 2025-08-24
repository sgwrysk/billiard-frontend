import React from 'react';
import { Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box } from '@mui/material';
import type { Game, ScoreHistory, Player } from '../types';
import { AppStyles } from '../constants/colors';

interface SetHistoryProps {
  game: Game;
}

const SetHistory: React.FC<SetHistoryProps> = ({ game }) => {
  // Keep rendering even if there is no history yet

  const setWins = game.scoreHistory
    .filter((entry: ScoreHistory) => entry.score === 1)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // Even when there is no history, we still render the empty table with player names

  const totalSetsPlayed = setWins.length;
  // Calculate dynamic header length based on targets and current wins
  const playerA = game.players[0];
  const playerB = game.players[1];
  const winsByPlayer: Record<string, number> = {};
  setWins.forEach(w => {
    winsByPlayer[w.playerId] = (winsByPlayer[w.playerId] || 0) + 1;
  });
  const winsA = playerA ? (winsByPlayer[playerA.id] || 0) : 0;
  const winsB = playerB ? (winsByPlayer[playerB.id] || 0) : 0;
  const targetA = (playerA as Player)?.targetSets;
  const targetB = (playerB as Player)?.targetSets;
  let visibleSetCount = Math.max(totalSetsPlayed, 1);
  if (typeof targetA === 'number' && typeof targetB === 'number') {
    const minInitial = Math.min(targetA, targetB);
    const remainingA = Math.max(targetA - winsA, 0);
    const remainingB = Math.max(targetB - winsB, 0);
    const minAdditionalToFinish = Math.min(remainingA, remainingB);
    const suggested = totalSetsPlayed + minAdditionalToFinish;
    visibleSetCount = Math.max(minInitial, suggested, 1);
  }
  const tableMinWidth = 120 + 56 * visibleSetCount;

  return (
    <Card variant="outlined" sx={{ mb: 2, bgcolor: 'grey.50' }}>
      <CardContent>
        <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }}>
          <Table size="small" sx={{ tableLayout: 'auto', width: '100%', minWidth: tableMinWidth, '& .MuiTableCell-root': { py: 1, px: 1.25 }, '& thead .MuiTableCell-root': { py: 1, height: 36 } }}>
            {/* Fix column widths and keep a minimum of one set column so height stays */}
            <colgroup>
              {/* Player name column: fit content with minimal padding */}
              <col style={{ width: '1%' }} />
              {Array.from({ length: visibleSetCount }, (_, i) => (
                <col key={`set-col-${i}`} style={{ width: 56 }} />
              ))}
            </colgroup>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '1%', whiteSpace: 'nowrap', position: 'sticky', left: 0, zIndex: 3, bgcolor: 'background.paper', borderRight: '1px solid', borderColor: 'divider' }} />
                {Array.from({ length: visibleSetCount }, (_, i) => (
                  <TableCell key={`set-head-${i}`} align="center" sx={{ fontWeight: 'bold' }}>
                    <span style={AppStyles.monoFont}>{i + 1}</span>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {game.players.map(player => (
                <TableRow key={player.id}>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50', whiteSpace: 'nowrap', position: 'sticky', left: 0, zIndex: 2, borderRight: '1px solid', borderColor: 'divider', width: '1%', pr: 2 }}>{player.name}</TableCell>
                  {Array.from({ length: visibleSetCount }, (_, setIndex) => {
                    const isWinner = setWins[setIndex]?.playerId === player.id;
                    const isVisible = setIndex < totalSetsPlayed;
                    return (
                      <TableCell key={setIndex} align="center">
                        <Box component="span" sx={{ color: isWinner ? 'success.main' : 'grey.300', fontSize: '1.1rem', visibility: isVisible ? 'visible' : 'hidden' }}>
                          {isWinner ? '⭕' : '⚪'}
                        </Box>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default SetHistory;


