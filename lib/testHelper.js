function tellBarnasNøkler(o) {
  const acc = {}
  return Object.keys(o).forEach(key => {
    const node = o[key]
    Object.keys(node).forEach(childkey => {
      acc[childkey] = acc[childkey] + 1 || 1
    })
  })
  return acc
}

module.exports = { tellBarnasNøkler }
