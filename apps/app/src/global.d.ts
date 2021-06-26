type AsyncFunc = (...args: any[]) => Promise<any>
type AnyFunc = (...args: any[]) => any

type LazyThen<T extends AsyncFunc> = T extends (
  ...args: any[]
) => Promise<infer R>
  ? R
  : T

type RT2<F extends AnyFunc> = ReturnType<ReturnType<F>>

type Undefined<T> = T | undefined

type NativeButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>

type SVGIconElement = (props: React.SVGProps<SVGSVGElement>) => JSX.Element
