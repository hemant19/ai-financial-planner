const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'core/src/data/financial-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const getCategory = (name) => {
    const n = name.toUpperCase();
    if (n.includes('SMALL CAP') || n.includes('SMALLCAP')) return 'SMALLCAP';
    if (n.includes('MID CAP') || n.includes('MIDCAP')) return 'MIDCAP';
    if (n.includes('NIFTY 50 INDEX') || n.includes('NIFTY NEXT 50') || n.includes('NASDAQ') || n.includes('FANG+')) return 'INDEX_FUND';
    if (n.includes('LARGE CAP') || n.includes('LARGECAP')) return 'LARGECAP';
    if (n.includes('ELSS') || n.includes('TAX SAVER')) return 'MULTICAP'; // Tax saver is usually flexi/multi
    if (n.includes('FLEXI CAP') || n.includes('FLEXICAP') || n.includes('DYNAMIC') || n.includes('HYBRID') || n.includes('MULTICAP')) return 'MULTICAP';
    if (n.includes('SHORT TERM') || n.includes('LIQUID') || n.includes('DEBT')) return 'DEBT_FUND';
    if (n.includes('GOLD')) return 'GOLD';
    if (n.includes('SILVER')) return 'SILVER';
    if (n.includes('AUTOMOTIVE') || n.includes('TECHNOLOGY') || n.includes('PHARMA') || n.includes('INFRA')) return 'SECTOR_FUND';
    return 'OTHER';
};

data.holdings = data.holdings.map(h => {
    if (h.assetClass === 'MUTUAL_FUND') {
        return {
            ...h,
            assetType: 'MUTUAL_FUND',
            assetCategory: getCategory(h.name)
        };
    }
    return h;
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Updated mutual fund metadata successfully.');
