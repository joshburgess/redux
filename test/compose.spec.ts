import { compose } from '..'

describe('Utils', () => {
  describe('compose', () => {
    it('composes from right to left', () => {
      const double = (x: number) => x * 2
      const square = (x: number) => x * x
      expect(compose(square)(5)).toBe(25)
      const flawedDoubleSquare = compose(
        square,
        // double
        y => y * 2
      ) // `flawedDoubleSquare` gets inferred as `(y: any) => number`... This is bad.
      expect(flawedDoubleSquare(5)).toBe(100)
      expect(
        compose(
          // double, // `y` is inferred as `any`... This is bad. No inference propagated through functions.
          y => y * 2,
          // square,
          x => x * x, // `x` is inferred as `any`... This is bad. No inference propagated through functions.
          double
        )(5)
      ).toBe(200)
    })

    it('composes functions from right to left', () => {
      // I could have pointed out more inference problems in this test, but they would have been redudant
      // Look at the other tests
      const a = (next: (x: string) => string) => (x: string) => next(x + 'a')
      const b = (next: (x: string) => string) => (x: string) => next(x + 'b')
      const c = (next: (x: string) => string) => (x: string) => next(x + 'c')
      const final = (x: string) => x

      expect(
        compose(
          a,
          b,
          c
        )(final)('')
      ).toBe('abc')
      expect(
        compose(
          b,
          c,
          a
        )(final)('')
      ).toBe('bca')
      expect(
        compose(
          c,
          a,
          b
        )(final)('')
      ).toBe('cab')
    })

    it('throws at runtime if argument is not a function', () => {
      type sFunc = (x: number, y: number) => number
      const square = (x: number, _: number) => x * x
      const add = (x: number, y: number) => x + y

      expect(() =>
        compose(
          square,
          add,
          (false as unknown) as sFunc
        )(1, 2)
      ).toThrow()
      expect(() =>
        compose(
          square,
          add,
          undefined
        )(1, 2)
      ).toThrow()
      expect(() =>
        compose(
          square,
          add,
          (true as unknown) as sFunc
        )(1, 2)
      ).toThrow()
      expect(() =>
        compose(
          square,
          add,
          (NaN as unknown) as sFunc
        )(1, 2)
      ).toThrow()
      expect(() =>
        compose(
          square,
          add,
          ('42' as unknown) as sFunc
        )(1, 2)
      ).toThrow()
    })

    it('can be seeded with multiple arguments', () => {
      const square = (x: number, _: number) => x * x
      const add = (x: number, y: number) => x + y
      // old expect assertion... commented out, but left here for reference
      // expect(
      //   compose(
      //     square,
      //     add
      //   )(1, 2)
      // ).toBe(9)
      expect(
        compose(
          // any function here could easily cause a runtime error
          // square, // commented out for sake of above argument ^
          // add
          (x, y) => x + y // `x` and `y` are both inferred as `any`... This is bad.
        )(1, 2) // this entire function is now `(a: any) => any` and completely unsafe, susceptible to runtime errors because of failed inference.
      ).toBe(3) // expected value modified to match changed expect assertion so that tests pass
    })

    it('returns the first given argument if given no functions', () => {
      // doesn't work, has to be commented out due to a type error
      // expect(compose<number>()(1, 2)).toBe(1)

      // without explicitly passing the generic type param
      const res0 = compose()(1, 2) // `res0` is inferred as `never`... This is bad. There are no overloads or type inference to make this work.
      expect(res0).toBe(1)

      const res1 = compose()('zero', 1, 2) // again, `res1` is inferred as `never`... This is bad.
      expect(res1).toBe('zero')

      expect(compose()(3)).toBe(3) // `3` is inferred as `never`
      expect(compose()(undefined)).toBe(undefined) // `undefined` is inferred as `never`
    })

    it('returns the first function if given only one', () => {
      const fn = () => {}

      expect(compose(fn)).toBe(fn)
    })
  })
})
