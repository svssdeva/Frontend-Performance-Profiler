import {Component, Input } from '@angular/core';
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
  selector: 'lib-vitals-chart',
  imports: [BaseChartDirective],
  templateUrl: './vitals-chart.component.html',
  styleUrl: './vitals-chart.component.scss',
  standalone: true,
})
export class VitalsChartComponent {
  // @Input() data: number[] = [];
  // @Input() labels: string[] = [];
  // @Input() metric = '';
  @Input() data: { name: string; value: number }[] = [];

  get labels(): string[] {
    return this.data.map(d => d.name);
  }

  get values(): number[] {
    return this.data.map(d => d.value);
  }
}
