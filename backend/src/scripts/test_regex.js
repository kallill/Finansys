const testPhrases = [
    "gastei 50 no mercado",
    "paguei 120.50 de luz",
    "recebi 2500 de salario",
    "almoÃ§o 35 no nubank",
    "lanÃ§ar 10 pizza"
];

function extractLocal(phrase) {
    // Regex para capturar valores (R$ 10, 10.00, 10,50)
    const amountRegex = /(\d+[,.]\d+|\d+)/;
    const amountMatch = phrase.match(amountRegex);
    const amount = amountMatch ? parseFloat(amountMatch[0].replace(',', '.')) : null;

    // Tentativa de pegar a descriÃ§Ã£o (o que sobrar tirando verbos e valores)
    let description = phrase
        .replace(amountRegex, '')
        .replace(/gastei|paguei|recebi|lanÃ§ar|fui|no|na|de|do|da|com|por/gi, '')
        .trim();

    return { amount, description };
}

testPhrases.forEach(p => console.log(`"${p}" ->`, extractLocal(p)));
