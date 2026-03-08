import { subDays, format, differenceInDays, addDays } from 'date-fns';

export interface DailyData {
  date: string;
  giphyViews: number;
  websiteTraffic: number;
  conversionRate: number;
}

export interface CountryData {
  name: string;
  value: number;
}

export interface ExtractedDataPoint {
  date: string;
  views: number;
}

export function generateTrafficData(
  totalViews: number,
  startDate: Date,
  endDate: Date,
  minConversion: number,
  maxConversion: number,
  extractedData: ExtractedDataPoint[] = []
): DailyData[] {
  const data: DailyData[] = [];
  
  if (extractedData && extractedData.length > 0) {
    const extractedTotal = extractedData.reduce((sum, d) => sum + d.views, 0);
    const scaleFactor = extractedTotal > 0 ? totalViews / extractedTotal : 1;

    for (const point of extractedData) {
      const dailyViews = Math.floor(point.views * scaleFactor);
      const conversionRate = minConversion + Math.random() * (maxConversion - minConversion);
      const websiteTraffic = Math.floor(dailyViews * (conversionRate / 100));

      data.push({
        date: point.date,
        giphyViews: dailyViews,
        websiteTraffic,
        conversionRate: Number(conversionRate.toFixed(2))
      });
    }
    
    const currentSum = data.reduce((sum, d) => sum + d.giphyViews, 0);
    if (data.length > 0 && currentSum !== totalViews) {
       data[data.length - 1].giphyViews += (totalViews - currentSum);
       data[data.length - 1].websiteTraffic = Math.floor(data[data.length - 1].giphyViews * (data[data.length - 1].conversionRate / 100));
    }
    
    return data;
  }

  const days = Math.max(1, differenceInDays(endDate, startDate) + 1);
  
  const averageDailyViews = Math.floor(totalViews / days);
  let remainingViews = totalViews;

  for (let i = 0; i < days; i++) {
    const currentDate = addDays(startDate, i);
    const dateStr = format(currentDate, 'MMM dd');
    
    let dailyViews = 0;
    if (i === days - 1) {
      dailyViews = remainingViews;
    } else {
      const variance = 0.8 + Math.random() * 0.4;
      dailyViews = Math.floor(averageDailyViews * variance);
      dailyViews = Math.min(dailyViews, remainingViews);
      remainingViews -= dailyViews;
    }

    const conversionRate = minConversion + Math.random() * (maxConversion - minConversion);
    const websiteTraffic = Math.floor(dailyViews * (conversionRate / 100));

    data.push({
      date: dateStr,
      giphyViews: dailyViews,
      websiteTraffic,
      conversionRate: Number(conversionRate.toFixed(2))
    });
  }

  return data;
}

export function generateCountryData(totalTraffic: number): CountryData[] {
  const distributions = [
    { name: 'United States', pct: 0.45 },
    { name: 'United Kingdom', pct: 0.15 },
    { name: 'Germany', pct: 0.10 },
    { name: 'Canada', pct: 0.08 },
    { name: 'Australia', pct: 0.07 },
    { name: 'Others', pct: 0.15 },
  ];

  return distributions.map(d => ({
    name: d.name,
    value: Math.floor(totalTraffic * d.pct)
  }));
}
