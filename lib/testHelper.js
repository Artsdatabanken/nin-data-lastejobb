function tellBarnasNøkler(o) {
  return Object.keys(o).reduce((acc, cur) => {
    const ok = Object.keys(o[cur])
    return Object.assign(
      ...ok.map(d => ({
        [d]: acc[d] ? acc[d] + 1 : 1
      }))
    )
  }, {})
}

module.exports = { tellBarnasNøkler }
