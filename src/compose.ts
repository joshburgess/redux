import { F } from 'ts-toolbelt'

/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for the
 * resulting composite function.
 *
 * @param funcs The functions to compose.
 * @returns A function obtained by composing the argument functions from right
 *   to left. For example, `compose(f, g, h)` is identical to doing
 *   `(...args) => f(g(h(...args)))`.
 */
export default function compose<Fns extends F.Function[]>(
  ...fns: F.Composer<Fns>
): F.Compose<Fns> {
  const len = fns.length

  if (len === 0) {
    return (<A extends unknown[]>(...args: A): A[0] => args[0]) as any
  }

  if (len === 1) {
    return fns[0] as any
  }

  // `Parameters<typeof b>` is equalavelnt to `unknown[]` in the below type,
  // signature, but `Parameters<typeof b>` more clearly conveys intent
  return fns.reduce((a, b) => (...args: Parameters<typeof b>) =>
    a(b(...args))
  ) as any
}
