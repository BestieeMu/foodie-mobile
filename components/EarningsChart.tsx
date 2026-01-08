import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';

export type EarningsPoint = { day: string; amount: number };

interface EarningsChartProps {
  data: EarningsPoint[];
  height?: number;
}

export default function EarningsChart({ data, height = 160 }: EarningsChartProps) {
  const padding = 12;
  const chartWidth = 320; // internal viewBox width; scales to container
  const maxAmount = Math.max(...data.map(d => d.amount), 1);
  const barWidth = (chartWidth - padding * 2) / data.length - 8;
  const baseY = height - padding * 1.5;

  return (
    <View style={styles.container}>
      <Svg height={height} width="100%" viewBox={`0 0 ${chartWidth} ${height}`} preserveAspectRatio="xMidYMid meet">
        {/* baseline */}
        <Line x1={padding} y1={baseY} x2={chartWidth - padding} y2={baseY} stroke="#E2E8F0" strokeWidth={1} />
        {/* bars */}
        {data.map((d, i) => {
          const x = padding + i * (barWidth + 8) + 4;
          const barHeight = Math.max(4, (d.amount / maxAmount) * (height - padding * 3));
          const y = baseY - barHeight;
          return (
            <Rect
              key={`${d.day}-${i}`}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={6}
              fill="#4C6EF5"
            />
          );
        })}
      </Svg>
      <View style={styles.labelsRow}>
        {data.map((d, i) => (
          <View key={`label-${d.day}-${i}`} style={styles.labelWrap}>
            <Text style={styles.label}>{d.day}</Text>
          </View>
        ))}
      </View>
      <View style={styles.legendRow}>
        <View style={styles.legendDot} />
        <Text style={styles.legendText}>Weekly earnings</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginTop: 6,
  },
  labelWrap: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontSize: 10,
    color: '#718096',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4C6EF5',
  },
  legendText: {
    fontSize: 12,
    color: '#718096',
  },
});