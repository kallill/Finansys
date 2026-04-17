declare module 'svg-captcha' {
  interface Captcha {
    data: string;
    text: string;
  }
  export function create(options?: any): Captcha;
  export function createMathExpr(options?: any): Captcha;
}
