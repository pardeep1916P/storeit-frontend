"use client";

import { useEffect, useState } from "react";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { calculatePercentage, convertFileSize } from "@/lib/utils";

const chartConfig = {
  size: {
    label: "Size",
  },
  used: {
    label: "Used",
    color: "white",
  },
} satisfies ChartConfig;

export const Chart = ({ used = 0 }: { used: number }) => {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const tablet = width >= 641 && width <= 1024;
      setIsTablet(tablet);
      console.log('Screen size check:', { width, tablet });
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Debug logging
  const percentage = calculatePercentage(used);
  const endAngle = Number(percentage) + 90;
  
  // Optimized circle for tablet
  const innerRadius = isTablet ? 90 : 80;
  const outerRadius = isTablet ? 120 : 110;
  
  console.log('Chart Debug:', {
    used,
    percentage,
    endAngle,
    isTablet,
    innerRadius,
    outerRadius,
    windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'SSR'
  });

  // Ensure we always have a visible chart (minimum 20% if used is 0)
  const displayPercentage = used > 0 ? percentage : 20;
  const displayEndAngle = Number(displayPercentage) + 90;

  const chartData = [{ storage: "used", 10: used, fill: "white" }];
  
  console.log('Chart Data:', chartData);
  console.log('Display Percentage:', displayPercentage);
  console.log('Display End Angle:', displayEndAngle);

  return (
    <Card className="chart">
      <CardContent className="flex-1 p-0">
        <ChartContainer config={chartConfig} className="chart-container">
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={displayEndAngle}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="polar-grid"
              polarRadius={isTablet ? [96, 84] : [86, 74]}
            />
            <RadialBar dataKey="storage" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="chart-total-percentage"
                        >
                          {displayPercentage.toString().replace(/^0+/, "")}
                          %
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-white/70"
                        >
                          Space used
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardHeader className="chart-details">
        <CardTitle className="chart-title">Available Storage</CardTitle>
        <CardDescription className="chart-description">
          {used ? convertFileSize(used) : "2GB"} / 2GB
        </CardDescription>
      </CardHeader>
    </Card>
  );
};
