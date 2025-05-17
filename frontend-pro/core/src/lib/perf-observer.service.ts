import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PerfObserverService {
  ignoreKeywords = ['disabled-by-default-devtools.timeline', '__metadata', 'v8'];
  useFullNames = ['PaintTimingVisualizer::Viewport', 'LayoutShift', 'UkmPageLoadTimingUpdate']
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
      const lcp = events.find((e: any) => e.name.includes('largest-contentful-paint'));
      const fid = events.find((e: any) => e.name.includes('first-input'));
      const clsEvents = events.filter((e: any) => e.name.includes('layout-shift') && !e.args?.data?.had_recent_input);
      const cls = clsEvents.reduce((sum: number, e: any) => sum + (e.args?.data?.score || 0), 0);
      console.log(lcp, fid, cls);
      const results = [
        { name: 'LCP', value: lcp?.ts ? Math.round(lcp.ts / 1000) : 0 },
        { name: 'FID', value: fid?.ts ? Math.round(fid.ts / 1000) : 0 },
        { name: 'CLS', value: Math.round(cls * 1000) / 1000 },
      ];

      this.metricsSubject.next(results);
    };

    reader.readAsText(file);
  }
}
