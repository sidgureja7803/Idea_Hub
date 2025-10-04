/**
 * Market Trend Chart Component
 * Visualizes market trend data with responsive design
 */

import React from 'react';
import { ResponsiveLine } from '@nivo/line';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../ui/Card';

interface MarketTrendChartProps {
  title: string;
  description?: string;
  data: Array<{
    id: string;
    data: Array<{
      x: string | number;
      y: number;
    }>;
  }>;
  height?: number;
  showLegend?: boolean;
}

const MarketTrendChart: React.FC<MarketTrendChartProps> = ({
  title,
  description,
  data,
  height = 400,
  showLegend = true,
}) => {
  // Default color scheme for the chart lines
  const colors = ['#3182CE', '#E53E3E', '#38A169', '#DD6B20', '#805AD5'];

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-0">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px` }}>
          <ResponsiveLine
            data={data}
            margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
            xScale={{ type: 'point' }}
            yScale={{
              type: 'linear',
              min: 'auto',
              max: 'auto',
              stacked: false,
              reverse: false,
            }}
            yFormat=" >-.2f"
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Year/Period',
              legendOffset: 36,
              legendPosition: 'middle',
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Value',
              legendOffset: -40,
              legendPosition: 'middle',
            }}
            colors={colors}
            pointSize={10}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            pointLabelYOffset={-12}
            useMesh={true}
            legends={showLegend ? [
              {
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: 'circle',
                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemBackground: 'rgba(0, 0, 0, .03)',
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ] : []}
            theme={{
              tooltip: {
                container: {
                  background: '#333',
                  color: '#fff',
                  fontSize: 12,
                  borderRadius: 4,
                  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.25)',
                  padding: 12,
                },
              },
              grid: {
                line: {
                  stroke: '#eee',
                  strokeWidth: 1,
                },
              },
              crosshair: {
                line: {
                  stroke: '#999',
                  strokeWidth: 1,
                  strokeOpacity: 0.75,
                  strokeDasharray: '6 6',
                },
              },
            }}
            animate={true}
            motionConfig="stiff"
            enableSlices="x"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketTrendChart;
