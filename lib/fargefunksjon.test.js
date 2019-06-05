const blandFarger = require("./fargefunksjon")

describe("fargefunksjon", () => {
  it("mix saturation and color", () => {
    const farger = [
      { farge: "hsl(320,60%, 70%)", vekt: [0, 1, 0] },
      { farge: "hsl(120,90%, 30%)", vekt: [1, 0, 1] }
    ]
    const actual = blandFarger(farger)
    expect(actual).toMatchSnapshot()
  })
})
