const generator = require('generate-password')

module.exports = function generate(type) {
    const generatedValue = generator.generate({
      length: type === "password" ? 10 : 15, 
      numbers: true,
      symbols: true,
      uppercase: true,
      exclude: '{},.:;[]()$"/\\~^',
      excludeSimilarCharacters: true
    })

    console.log(`Generated ${type}: ${generatedValue}`)
    // check length of pw in db to be sure
    return generatedValue
}
    