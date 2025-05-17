import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface WebVitalMetric {
  name: string;
  value: number;
  status: 'good' | 'needs-improvement' | 'poor';
  unit: string;
}

@Injectable({
  providedIn: 'root'
})
export class PerfObserverNewService {
  // Constants for thresholds based on Core Web Vitals recommendations
  private readonly thresholds = {
    FCP: { good: 1800, poor: 3000, unit: 'ms' },  // First Contentful Paint
    LCP: { good: 2500, poor: 4000, unit: 'ms' },  // Largest Contentful Paint
    CLS: { good: 0.1, poor: 0.25, unit: '' },     // Cumulative Layout Shift
    FID: { good: 100, poor: 300, unit: 'ms' },    // First Input Delay
    INP: { good: 200, poor: 500, unit: 'ms' },    // Interaction to Next Paint
    TTI: { good: 3800, poor: 7300, unit: 'ms' },  // Time to Interactive
    TBT: { good: 200, poor: 600, unit: 'ms' }     // Total Blocking Time
  };

  private metricsSubject = new BehaviorSubject<WebVitalMetric[]>([]);
  public metrics$ = this.metricsSubject.asObservable();

  private rawEventsSubject = new BehaviorSubject<any[]>([]);
  public rawEvents$ = this.rawEventsSubject.asObservable();


  /**
   * Parse the trace file and extract Core Web Vitals metrics
   */
  parseTraceFile(file: File): void {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        const events = json.traceEvents || [];

        // Filter UkmPageLoadTimingUpdate events
        const ukmEvents = events.filter((event: { name: string; }) =>
          event.name === 'UkmPageLoadTimingUpdate');

        // Get the latest event (most up-to-date values)
        const latestEvent = ukmEvents.length > 0 ?
          ukmEvents[ukmEvents.length - 1] : null;

        if (latestEvent && latestEvent.args && latestEvent.args.ukm_page_load_timing_update) {
          const metrics = this.extractMetricsFromEvent(latestEvent);
          this.metricsSubject.next(metrics);
          this.rawEventsSubject.next(ukmEvents);
        } else {
          console.error('No valid UkmPageLoadTimingUpdate events found in trace file');
          this.metricsSubject.next([]);
        }
      } catch (error) {
        console.error('Error parsing trace file:', error);
        this.metricsSubject.next([]);
      }
    };

    reader.onerror = () => {
      console.error('Error reading file');
      this.metricsSubject.next([]);
    };

    reader.readAsText(file);
  }

  /**
   * Extract metrics from a single UkmPageLoadTimingUpdate event
   */
  private extractMetricsFromEvent(event: any): WebVitalMetric[] {
    const data = event.args.ukm_page_load_timing_update;

    // Extract core web vitals with proper conversion
    const fcp = data.first_contentful_paint_ms || 0;
    const lcp = data.latest_largest_contentful_paint_ms || 0;
    const cls = data.latest_cumulative_layout_shift || 0;

    // Extract additional metrics if available
    const tti = data.time_to_interactive_ms || 0;
    const tbt = data.total_blocking_time_ms || 0;
    const fid = data.first_input_delay_ms || 0;
    const inp = data.interaction_to_next_paint_ms || 0;

    const metrics: WebVitalMetric[] = [
      this.createMetric('FCP', fcp),
      this.createMetric('LCP', lcp),
      this.createMetric('CLS', cls * 1000)  // Multiply by 1000 for easier visualization
    ];

    // Add additional metrics if they exist
    if (fid) metrics.push(this.createMetric('FID', fid));
    if (inp) metrics.push(this.createMetric('INP', inp));
    if (tti) metrics.push(this.createMetric('TTI', tti));
    if (tbt) metrics.push(this.createMetric('TBT', tbt));

    return metrics;
  }

  /**
   * Create a WebVitalMetric object with appropriate status based on thresholds
   */
  private createMetric(name: string, value: number): WebVitalMetric {
    const threshold = this.thresholds[name as keyof typeof this.thresholds];
    const unit = threshold?.unit || '';

    let status: 'good' | 'needs-improvement' | 'poor';

    if (threshold) {
      if (value <= threshold.good) {
        status = 'good';
      } else if (value <= threshold.poor) {
        status = 'needs-improvement';
      } else {
        status = 'poor';
      }
    } else {
      status = 'good'; // Default if no threshold defined
    }

    return { name, value, status, unit };
  }

  /**
   * Start real-time performance monitoring using PerformanceObserver
   */
  startRealTimeMonitoring(): void {
    // Check if PerformanceObserver is available
    if (typeof PerformanceObserver === 'undefined') {
      console.warn('PerformanceObserver is not supported in this browser');
      return;
    }

    const metrics: WebVitalMetric[] = [];

    try {
      // Observe LCP
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const lcp = entries[entries.length - 1];
          const value = lcp.startTime;
          const lcpMetric = this.createMetric('LCP', value);
          this.updateMetricsArray(metrics, lcpMetric);
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      // Observe FCP
      const fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const fcp = entries[0];
          const fcpMetric = this.createMetric('FCP', fcp.startTime);
          this.updateMetricsArray(metrics, fcpMetric);
        }
      });
      fcpObserver.observe({ type: 'paint', buffered: true });

      // Observe CLS
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          // Only count layout shifts without recent user input
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            const clsMetric = this.createMetric('CLS', clsValue * 1000);
            this.updateMetricsArray(metrics, clsMetric);
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });

      // Observe FID
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const fid = entries[0];
          const fidMetric = this.createMetric('FID', (fid as any).processingStart - fid.startTime);
          this.updateMetricsArray(metrics, fidMetric);
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });

    } catch (error) {
      console.error('Error setting up performance observers:', error);
    }
  }

  private updateMetricsArray(metrics: WebVitalMetric[], newMetric: WebVitalMetric): void {
    const index = metrics.findIndex(m => m.name === newMetric.name);
    if (index >= 0) {
      metrics[index] = newMetric;
    } else {
      metrics.push(newMetric);
    }
    this.metricsSubject.next([...metrics]);
  }
}