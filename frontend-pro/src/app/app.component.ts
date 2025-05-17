import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {VitalsChartComponent} from '@frontend-pro/shared-ui';
import { PerfObserverService } from '@frontend-pro/core';
import { Observable } from 'rxjs';
import { AsyncPipe, NgIf } from '@angular/common';


@Component({
  imports: [RouterModule, VitalsChartComponent, NgIf, AsyncPipe],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  // data: number[] = [];
  // labels: string[] = [];
  perfSvc = inject(PerfObserverService);
  metrics$: Observable<{ name: string; value: number }[]> | undefined;

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.perfSvc.parseTraceFile(file);
    }
  }

  async ngOnInit() {
    // this.perfSvc.vitalsObs$.subscribe(entries => {
    //   this.data = entries.map((e: any) => e.value || 0);
    //   this.labels = entries.map((e: any) => e.name || e.entryType);
    // });
    this.metrics$ = this.perfSvc.metrics$;
  }
}
