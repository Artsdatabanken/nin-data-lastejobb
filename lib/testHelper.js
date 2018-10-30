function isKey(key) {
  if (key.length === 2) return true
  if (key.indexOf("_") >= 0) return true
  if (key.indexOf("-") >= 0) return true
  return false
}

function tellBarnasNøkler(o, acc = {}) {
  if (typeof o == "string") return acc
  if (!o) return acc
  if (!Object.keys(o)) return acc

  Object.keys(o).forEach(key => {
    const isDynamic =
      isKey(key) ||
      !isNaN(key) ||
      Object.prototype.hasOwnProperty.call(o[key] || {}, "@")
    let outputKey = isDynamic ? "_" : key // Ignore codes
    if (!acc[outputKey]) acc[outputKey] = { count: 0 }
    acc[outputKey].count = acc[outputKey].count + 1 || 1
    const node = o[key]
    const ck = tellBarnasNøkler(node, acc[outputKey])
  })
  return acc
}

module.exports = { tellBarnasNøkler }
