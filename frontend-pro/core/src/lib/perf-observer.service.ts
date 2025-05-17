import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PerfObserverService {
  ignoreKeywords = ['disabled-by-default-devtools.timeline', '__metadata', 'v8'];
  useFullNames = ['UkmPageLoadTimingUpdate']
  //
  // private vitals$ = new BehaviorSubject<any[]>([]);
  // vitalsObs$ = this.vitals$.asObservable();
  //
  // constructor() {
  //   this.observeVitals();
  // }
  //
  // private observeVitals() {
  //   const vitals: any[] = [];
  //
  //   const observer = new PerformanceObserver((list) => {
  //     for (const entry of list.getEntries()) {
  //       console.log(entry);
  //       vitals.push(entry);
  //       this.vitals$.next([...vitals]);
  //     }
  //   });
  //
  //   observer.observe({ type: 'largest-contentful-paint', buffered: true });
  //   observer.observe({ type: 'first-input', buffered: true });
  //   observer.observe({ type: 'layout-shift', buffered: true });
  // }
  private metricsSubject = new BehaviorSubject<{ name: string; value: number }[]>([]);
  public metrics$ = this.metricsSubject.asObservable();

  parseTraceFile(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const json = JSON.parse(reader.result as string);
      let events = json.traceEvents || [];
      events = events.filter((event: { name: string; }) => this.useFullNames.includes(event.name));
      console.log(JSON.stringify(events));
      console.log(events);
      const fcp = events.find((e: any) => e.args.ukm_page_load_timing_update).args.ukm_page_load_timing_update.first_contentful_paint_ms;
      const lcp = events.find((e: any) => e.args.ukm_page_load_timing_update).args.ukm_page_load_timing_update.latest_largest_contentful_paint_ms;
      const cls = events.find((e: any) => e.args.ukm_page_load_timing_update).args.ukm_page_load_timing_update.latest_cumulative_layout_shift;
      console.log(fcp, lcp, cls);
      const results = [
        { name: 'FCP', value: fcp ? Math.round(fcp / 1000) : 0 },
        { name: 'LCP', value: lcp ? Math.round(lcp / 1000) : 0 },
        { name: 'CLS', value: cls * 1000 },
      ];

      this.metricsSubject.next(results);
    };

    reader.readAsText(file);
  }
}
