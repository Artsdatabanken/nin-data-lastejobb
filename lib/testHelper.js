function tellBarnasNøkler(o) {
  return Object.keys(o).reduce((acc, cur) => {
    const ok = Object.keys(o[cur])
    return Object.assign(
      ...ok.map(d => {
        let count = acc[d] || 0
        if (o[cur][d]) count++
        return {
          [d]: count
        }
      })
    )
  }, {})
}

module.exports = { tellBarnasNøkler }
