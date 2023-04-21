import axios, { AxiosRequestConfig, RawAxiosResponseHeaders } from 'axios';
import Bucket from '../utils/Bucket';

/**
 * A handler used for HTTP requests.
 */
export default class RequestHandler {
  private _apiBaseUrl: string;

  private _apiKey: string;

  private _ratelimits: {
    [route: string]: Bucket;
  } = {};

  private _requestOptions: AxiosRequestConfig;

  /**
   * Create a RequestHandler.
   * @param apiKey The tip.cc API key
   * @param payload Optional: options for requests
   */
  constructor(
    apiKey: string,
    payload: {
      apiBaseUrl?: string;
    } = {},
  ) {
    this._apiBaseUrl = payload.apiBaseUrl ?? 'https://api.tip.cc/api/v0';
    this._apiKey = apiKey;

    this._requestOptions = {
      validateStatus: () => true,
      headers: {
        Authorization: `Bearer ${this._apiKey}`,
        'Content-Type': 'application/json',
      },
      baseURL: this._apiBaseUrl,
    };
  }

  private _parseRateLimitHeaders(
    route: string,
    headers: RawAxiosResponseHeaders,
  ) {
    const now = Date.now();

    if (headers['x-ratelimit-limit'])
      this._ratelimits[route].limit = +headers['x-ratelimit-limit'];

    if (!headers['x-ratelimit-remaining']) {
      this._ratelimits[route].remaining = 1;
    } else {
      this._ratelimits[route].remaining =
        +headers['x-ratelimit-remaining'] ?? 0;
    }

    if (headers['retry-after']) {
      this._ratelimits[route].reset = (+headers['retry-after'] || 1) + now;
    } else if (headers['x-ratelimit-reset']) {
      this._ratelimits[route].reset = Math.max(
        +headers['x-ratelimit-reset'],
        now,
      );
    } else {
      this._ratelimits[route].reset = now;
    }
  }

  public request(
    method: 'POST' | 'GET',
    route: string,
    payload: any = {},
    requestOptions: AxiosRequestConfig = {},
  ) {
    if (!this._ratelimits[route]) this._ratelimits[route] = new Bucket(1);

    return new Promise((resolve, reject) => {
      axios
        .request({
          ...this._requestOptions,
          ...requestOptions,
          method,
          url: route,
          ...(payload
            ? method === 'GET'
              ? { params: payload }
              : { data: payload }
            : {}),
        })
        .then((response) => {
          this._parseRateLimitHeaders(route, response.headers);

          const rejectWithError = () => {
            if (response.data && response.data.error) {
              reject(new Error(response.data.error));
            } else {
              reject(new Error(response.data.error ?? 'Unknown error'));
            }
          };

          const retryRequest = () => {
            if (response.headers['retry-after']) {
              setTimeout(() => {
                this.request(method, route, payload, requestOptions)
                  .then(resolve)
                  .catch(reject);
              }, +response.headers['retry-after']);
            } else {
              //  Retry immediately if no retry-after header
              this.request(method, route, payload, requestOptions)
                .then(resolve)
                .catch(reject);
            }
          };

          if (response.status >= 200 && response.status < 300) {
            resolve(response.data);
          } else if (response.status === 429) {
            retryRequest();
          } else {
            rejectWithError();
          }
        });
    });
  }
}
