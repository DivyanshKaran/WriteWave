/**
 * Simple metrics collector for Prometheus-style metrics
 * Provides request, latency, and error rate tracking
 */

interface MetricData {
  value: number;
  labels: Record<string, string>;
  timestamp: number;
}

interface CounterMetric {
  name: string;
  help: string;
  type: 'counter';
  values: Map<string, number>; // key is serialized labels
}

interface HistogramMetric {
  name: string;
  help: string;
  type: 'histogram';
  buckets: number[];
  values: Map<string, number[]>; // key is serialized labels, value is bucket counts
  sums: Map<string, number>; // sum of observed values
  counts: Map<string, number>; // count of observations
}

export class MetricsCollector {
  private counters: Map<string, CounterMetric> = new Map();
  private histograms: Map<string, HistogramMetric> = new Map();
  private startTime: number = Date.now();

  // Default histogram buckets (in milliseconds)
  private readonly DEFAULT_BUCKETS = [10, 50, 100, 200, 500, 1000, 2000, 5000, 10000];

  /**
   * Create or get a counter metric
   */
  createCounter(name: string, help: string): void {
    if (!this.counters.has(name)) {
      this.counters.set(name, {
        name,
        help,
        type: 'counter',
        values: new Map(),
      });
    }
  }

  /**
   * Increment a counter
   */
  incrementCounter(name: string, labels: Record<string, string> = {}, value: number = 1): void {
    if (!this.counters.has(name)) {
      this.createCounter(name, `Counter metric: ${name}`);
    }
    
    const counter = this.counters.get(name)!;
    const key = this.serializeLabels(labels);
    const current = counter.values.get(key) || 0;
    counter.values.set(key, current + value);
  }

  /**
   * Create or get a histogram metric
   */
  createHistogram(name: string, help: string, buckets: number[] = this.DEFAULT_BUCKETS): void {
    if (!this.histograms.has(name)) {
      this.histograms.set(name, {
        name,
        help,
        type: 'histogram',
        buckets: [...buckets].sort((a, b) => a - b),
        values: new Map(),
        sums: new Map(),
        counts: new Map(),
      });
    }
  }

  /**
   * Record a histogram observation
   */
  observeHistogram(name: string, value: number, labels: Record<string, string> = {}): void {
    if (!this.histograms.has(name)) {
      this.createHistogram(name, `Histogram metric: ${name}`);
    }
    
    const histogram = this.histograms.get(name)!;
    const key = this.serializeLabels(labels);
    
    // Update sum and count
    const currentSum = histogram.sums.get(key) || 0;
    const currentCount = histogram.counts.get(key) || 0;
    histogram.sums.set(key, currentSum + value);
    histogram.counts.set(key, currentCount + 1);
    
    // Update bucket counts
    let bucketCounts = histogram.values.get(key) || new Array(histogram.buckets.length).fill(0);
    for (let i = 0; i < histogram.buckets.length; i++) {
      if (value <= histogram.buckets[i]) {
        bucketCounts[i]++;
      }
    }
    // Add +Inf bucket
    if (bucketCounts.length === histogram.buckets.length) {
      bucketCounts.push(currentCount + 1);
    } else {
      bucketCounts[histogram.buckets.length] = currentCount + 1;
    }
    histogram.values.set(key, bucketCounts);
  }

  /**
   * Get Prometheus-formatted metrics
   */
  getPrometheusFormat(): string {
    const lines: string[] = [];
    
    // Process counters
    for (const counter of this.counters.values()) {
      lines.push(`# HELP ${counter.name} ${counter.help}`);
      lines.push(`# TYPE ${counter.name} ${counter.type}`);
      
      for (const [labelKey, value] of counter.values.entries()) {
        const labels = this.deserializeLabels(labelKey);
        const labelStr = Object.entries(labels)
          .map(([k, v]) => `${k}="${String(v)}"`)
          .join(',');
        
        if (labelStr) {
          lines.push(`${counter.name}{${labelStr}} ${value}`);
        } else {
          lines.push(`${counter.name} ${value}`);
        }
      }
    }
    
    // Process histograms
    for (const histogram of this.histograms.values()) {
      lines.push(`# HELP ${histogram.name} ${histogram.help}`);
      lines.push(`# TYPE ${histogram.name} ${histogram.type}`);
      
      for (const [labelKey, bucketCounts] of histogram.values.entries()) {
        const labels = this.deserializeLabels(labelKey);
        const labelStr = Object.entries(labels)
          .map(([k, v]) => `${k}="${String(v)}"`)
          .join(',');
        
        const sum = histogram.sums.get(labelKey) || 0;
        const count = histogram.counts.get(labelKey) || 0;
        
        // Output bucket values
        for (let i = 0; i < histogram.buckets.length; i++) {
          const bucketValue = bucketCounts[i] || 0;
          const bucketLabel = i === 0 ? `le="${histogram.buckets[i]}"` : `le="${histogram.buckets[i]}"`;
          const allLabels = labelStr ? `{${labelStr},${bucketLabel}}` : `{${bucketLabel}}`;
          lines.push(`${histogram.name}_bucket${allLabels} ${bucketValue}`);
        }
        
        // +Inf bucket
        const infLabel = labelStr ? `{${labelStr},le="+Inf"}` : `{le="+Inf"}`;
        lines.push(`${histogram.name}_bucket${infLabel} ${count}`);
        
        // Sum
        const sumLabel = labelStr ? `{${labelStr}}` : '';
        lines.push(`${histogram.name}_sum${sumLabel} ${sum}`);
        
        // Count
        lines.push(`${histogram.name}_count${sumLabel} ${count}`);
      }
    }
    
    // Add process info
    const uptime = (Date.now() - this.startTime) / 1000;
    lines.push(`# HELP process_uptime_seconds Process uptime in seconds`);
    lines.push(`# TYPE process_uptime_seconds gauge`);
    lines.push(`process_uptime_seconds ${uptime}`);
    
    return lines.join('\n') + '\n';
  }

  /**
   * Get JSON format metrics (for API responses)
   */
  getJSONFormat(): Record<string, any> {
    const counters: Record<string, any> = {};
    const histograms: Record<string, any> = {};
    
    for (const counter of this.counters.values()) {
      counters[counter.name] = {
        type: counter.type,
        help: counter.help,
        values: Object.fromEntries(counter.values),
      };
    }
    
    for (const histogram of this.histograms.values()) {
      const histogramData: any = {
        type: histogram.type,
        help: histogram.help,
        buckets: histogram.buckets,
        values: {},
        sums: Object.fromEntries(histogram.sums),
        counts: Object.fromEntries(histogram.counts),
      };
      
      for (const [labelKey, bucketCounts] of histogram.values.entries()) {
        histogramData.values[labelKey] = bucketCounts;
      }
      
      histograms[histogram.name] = histogramData;
    }
    
    return {
      counters,
      histograms,
      uptime: (Date.now() - this.startTime) / 1000,
    };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.counters.clear();
    this.histograms.clear();
    this.startTime = Date.now();
  }

  private serializeLabels(labels: Record<string, string>): string {
    return JSON.stringify(
      Object.keys(labels)
        .sort()
        .reduce((acc, key) => {
          acc[key] = labels[key];
          return acc;
        }, {} as Record<string, string>)
    );
  }

  private deserializeLabels(serialized: string): Record<string, string> {
    try {
      return JSON.parse(serialized);
    } catch {
      return {};
    }
  }
}

// Global metrics collector instance
export const metricsCollector = new MetricsCollector();

// Initialize default metrics
metricsCollector.createCounter('http_requests_total', 'Total number of HTTP requests');
metricsCollector.createCounter('http_errors_total', 'Total number of HTTP errors');
metricsCollector.createHistogram('http_request_duration_ms', 'HTTP request duration in milliseconds');

/**
 * Middleware to collect HTTP metrics
 */
export function metricsMiddleware(serviceName: string = 'unknown') {
  return (req: any, res: any, next: any): void => {
    const start = Date.now();
    
    // Override res.end to collect metrics
    const originalEnd = res.end;
    res.end = function(chunk: any, encoding?: any): any {
      const duration = Date.now() - start;
      const status = res.statusCode;
      const route = req.route?.path || req.path || req.url;
      const method = req.method;
      
      // Increment request counter
      metricsCollector.incrementCounter('http_requests_total', {
        service: serviceName,
        method,
        route,
        status: status.toString(),
      });
      
      // Record duration
      metricsCollector.observeHistogram('http_request_duration_ms', duration, {
        service: serviceName,
        method,
        route,
        status: status.toString(),
      });
      
      // Increment error counter if status >= 400
      if (status >= 400) {
        metricsCollector.incrementCounter('http_errors_total', {
          service: serviceName,
          method,
          route,
          status: status.toString(),
        });
      }
      
      return originalEnd.call(this, chunk, encoding);
    };
    
    next();
  };
}

