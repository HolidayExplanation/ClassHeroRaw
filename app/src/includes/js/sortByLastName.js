module.exports = function sortByLasyName(list) {
    return list.sort(function(a, b) {
        return (a.lastName > b.lastName) ? 1 : ((b.lastName > a.lastName) ? -1 : 0)
    })
}