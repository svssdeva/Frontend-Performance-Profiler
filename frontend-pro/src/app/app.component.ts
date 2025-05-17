import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import {PerfObserverNewService, WebVitalMetric } from '@frontend-pro/core';
import { Observable } from 'rxjs';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { VitalsNewComponent } from '@frontend-pro/shared-ui';


@Component({
  imports: [RouterModule, VitalsNewComponent, AsyncPipe, JsonPipe],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  rawEvents: any[] = [];
  perfService = inject(PerfObserverNewService);
  metrics$: Observable<WebVitalMetric[]> = this.perfService.metrics$;
  // metrics$: Observable<{ name: string; value: number }[]> | undefined;

  async ngOnInit() {
    this.perfService.rawEvents$.subscribe((events) => {
      this.rawEvents = events;
    });
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Check if it's a JSON file
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        this.perfService.parseTraceFile(file);
      } else {
        alert('Please select a valid JSON trace file from Chrome DevTools.');
      }
    }
  }

  startMonitoring(): void {
    this.perfService.startRealTimeMonitoring();
    alert(
      'Real-time monitoring started. Performance metrics will update as they are collected.'
    );
  }
}
