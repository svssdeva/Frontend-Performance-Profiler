import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PerfObserverService {

  private vitals$ = new BehaviorSubject<any[]>([]);
  vitalsObs$ = this.vitals$.asObservable();

  constructor() {
    this.observeVitals();
  }

  private observeVitals() {
    const vitals: any[] = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        vitals.push(entry);
        this.vitals$.next([...vitals]);
      }
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    observer.observe({ type: 'first-input', buffered: true });
    observer.observe({ type: 'layout-shift', buffered: true });
  }
}
