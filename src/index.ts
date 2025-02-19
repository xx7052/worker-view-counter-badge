import { StyleOption, badgen } from 'badgen';
import {
  Request as WorkerRequest,
  D1Database,
  ExecutionContext
} from '@cloudflare/workers-types/experimental';

export interface Env {
  // If you set another name in wrangler.toml as the value for 'binding',
  // replace "DB" with the variable name you defined.
  ViewCounter: D1Database;
}

const CounterName = 'Counter1';

export default {
  async fetch(request: WorkerRequest, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Get the value from D1
    let count: number | null = await env.ViewCounter.prepare(
      'SELECT * FROM ViewCounter WHERE Name = ?1'
    )
      .bind(CounterName)
      .first('Value');

    // If the value is null, insert a new record
    if (!count) {
      count = 1;

      var result = await env.ViewCounter.prepare(
        'INSERT INTO ViewCounter (Name, Value) VALUES (?1, ?2)'
      )
        .bind(CounterName, count)
        .run();
      console.log('Insert result', result);
    } else {
      // Value++
      count++;

      // Update the value to D1
      var result = await env.ViewCounter.prepare(
        'UPDATE ViewCounter SET Value = ?1 WHERE Name = ?2'
      )
        .bind(count, CounterName)
        .run();
      console.log('Update result', result);
    }
    console.log('Count', count);

    // Get the query parameters
    const { searchParams } = new URL(request.url);
    let label = searchParams.get('label') || 'Views';
    let labelColor = searchParams.get('labelColor') || '555';
    let color = searchParams.get('color') || 'blue';
    let style: StyleOption = searchParams.get('style') === 'classic' ? 'classic' : 'flat';
    let scale = searchParams.get('scale') || '1';

    // Generate the svg string
    const svgString = badgen({
      label: label,
      labelColor: labelColor,
      color: color,
      style: style,
      scale: parseFloat(scale),
      status: count.toString()
    });
    console.log('SVG', svgString);

    return new Response(svgString, {
      headers: {
        'content-type': 'image/svg+xml;charset=utf-8',
        'access-control-allow-origin': '*',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
      }
    });
  }
};
