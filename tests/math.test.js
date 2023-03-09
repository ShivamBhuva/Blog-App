test("Hello world!", () => {});

const calculator = (a, b) => {
  return a + b;
};

test("Calculator is false", () => {
  const ans = calculator(5, 3);
  expect(ans).toBe(8);
  //   if (ans != 8) {
  //     throw new Error();
  //   }
});
