/**
 * Competitive Analysis Chart Component
 * Visualizes competitive landscape with a horizontal bar chart
 */

import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../ui/Card';

interface CompetitiveAnalysisChartProps {
  title: string;
  description?: string;
  data: Array<{
    competitor: string;
    marketShare?: number;
    userBase?: number;
    funding?: number;
    innovation?: number;
    [key: string]: string | number | undefined;
  }>;
  keys: string[];
  indexBy: string;
  height?: number;
  layout?: 'vertical' | 'horizontal';
  colorScheme?: string[];
}

const CompetitiveAnalysisChart: React.FC<CompetitiveAnalysisChartProps> = ({
  title,
  description,
  data,
  keys,
  indexBy = 'competitor',
  height = 500,
  layout = 'horizontal',
  colorScheme = ['#3182CE', '#E53E3E', '#38A169', '#DD6B20', '#805AD5'],
}) => {
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-0">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px` }}>
          <ResponsiveBar
            data={data}
            keys={keys}
            indexBy={indexBy}
            margin={{ top: 50, right: 130, bottom: 50, left: 160 }}
            padding={0.3}
            layout={layout}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={colorScheme}
            borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: layout === 'vertical' ? 'Competitor' : 'Value',
              legendPosition: 'middle',
              legendOffset: 32,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: layout === 'vertical' ? 'Value' : 'Competitor',
              legendPosition: 'middle',
              legendOffset: -140,
              truncateTickAt: 0,
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            legends={[
              {
                dataFrom: 'keys',
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 120,
                translateY: 0,
                itemsSpacing: 2,
                itemWidth: 100,
                itemHeight: 20,
                itemDirection: 'left-to-right',
                itemOpacity: 0.85,
                symbolSize: 20,
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ]}
            role="application"
            ariaLabel="Competitive analysis chart"
            barAriaLabel={(e) =>
              `${e.id}: ${e.formattedValue} in competitor: ${e.indexValue}`
            }
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
              axis: {
                legend: {
                  text: {
                    fontSize: 14,
                    fontWeight: 'bold',
                  },
                },
              },
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitiveAnalysisChart;
