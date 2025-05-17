import { Component, Input, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import {
  Chart as ChartJS,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  BarController,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { WebVitalMetric } from '@frontend-pro/core';
import { TitleCasePipe } from '@angular/common';

ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  BarController,
  BarElement,
  Tooltip,
  Legend
);

@Component({
  selector: 'lib-vitals-new',
  imports: [BaseChartDirective, TitleCasePipe],
  templateUrl: './vitals-new.component.html',
  styleUrl: './vitals-new.component.scss',
  standalone: true,
})
export class VitalsNewComponent implements OnChanges {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  @Input() data: WebVitalMetric[] = [];

  // Chart configuration
  chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Value',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Metrics',
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const index = context.dataIndex;
            const metric = this.data[index];
            return `${metric.name}: ${metric.value}${metric.unit} (${metric.status})`;
          },
        },
      },
    },
  };

  get labels(): string[] {
    return this.data.map((d) => d.name);
  }

  get values(): number[] {
    return this.data.map((d) => d.value);
  }

  get backgroundColors(): string[] {
    return this.data.map((d) => {
      switch (d.status) {
        case 'good':
          return 'rgba(75, 192, 75, 0.8)';
        case 'needs-improvement':
          return 'rgba(255, 205, 86, 0.8)';
        case 'poor':
          return 'rgba(255, 99, 132, 0.8)';
        default:
          return 'rgba(201, 203, 207, 0.8)';
      }
    });
  }

  get borderColors(): string[] {
    return this.data.map((d) => {
      switch (d.status) {
        case 'good':
          return 'rgb(75, 192, 75)';
        case 'needs-improvement':
          return 'rgb(255, 205, 86)';
        case 'poor':
          return 'rgb(255, 99, 132)';
        default:
          return 'rgb(201, 203, 207)';
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.chart?.chart) {
      this.chart.chart.update();
    }
  }
}