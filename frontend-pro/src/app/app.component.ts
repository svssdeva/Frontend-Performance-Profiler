import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {VitalsChartComponent} from '@frontend-pro/shared-ui';
import { PerfObserverService } from '@frontend-pro/core';


@Component({
  imports: [RouterModule, VitalsChartComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  data: number[] = [];
  labels: string[] = [];
  perfSvc = inject(PerfObserverService);


  async ngOnInit() {
    this.perfSvc.vitalsObs$.subscribe(entries => {
      this.data = entries.map((e: any) => e.value || 0);
      this.labels = entries.map((e: any) => e.name || e.entryType);
    });
  }
}
