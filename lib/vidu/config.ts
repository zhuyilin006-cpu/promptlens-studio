// Vidu 接入的运行时配置读取。
// 服务端专用值（API Key）只在 server 侧读取，切勿在客户端组件引用本文件的 getServerConfig。

/** 服务端配置：仅在 Route Handler / server.mjs 中使用 */
export function getServerConfig() {
  const apiKey = process.env.VIDU_API_KEY?.trim() || '';
  const httpHost = process.env.VIDU_HTTP_HOST?.trim() || 'api.vidu.cn';
  const wsHost = process.env.VIDU_WS_HOST?.trim() || 'api.vidu.cn';
  return {
    apiKey,
    httpHost,
    wsHost,
    hasKey: apiKey.length > 0,
  };
}

/** 客户端可见配置（仅 NEXT_PUBLIC_* ） */
export function getClientConfig() {
  const forceMock = process.env.NEXT_PUBLIC_VIDU_MOCK === '1';
  const sdkUrl =
    process.env.NEXT_PUBLIC_ALIRTC_SDK_URL?.trim() ||
    'https://g.alicdn.com/apsara-media-box/imp-web-rtc/4.5.0/aliyun-rtc-sdk.js';
  return { forceMock, sdkUrl };
}

/** 本域 WS 代理路径 */
export const VIDU_WS_PROXY_PATH = '/api/vidu/ws';
/** 会话创建代理路径 */
export const VIDU_SESSION_API = '/api/vidu/session';
