
const tokens = [
    {
        name: "IQ",
        precision: 3,
        contract: "everipediaiq",
        icon: "tokens/iq.png",
        marketId: -1,
        side: null,
        allowedTrades: [
            {token: "YETRUMP", pool: "IQYTRMP", precision: 3},
            {token: "NOTRUMP", pool: "IQNTRMP", precision: 3},
            {token: "YVAC", pool: "IQYVAC", precision: 3},
            {token: "NVAC", pool: "IQNVAC", precision: 3},
            {token: "YESDFS", pool: "IQYDFS", precision: 3},
            {token: "NODFS", pool: "IQNDFS", precision: 3},
            {token: "YEIQUPB", pool: "IQYUPB", precision: 3},
            {token: "NOIQUPB", pool: "IQNUPB", precision: 3},
            {token: "EOS", pool: "EOSIQ", precision: 4},
            {token: "YEBIDEN", pool: "IQYBID", precision: 3},
            {token: "NOBIDEN", pool: "IQNBID", precision: 3},
            {token: "YLAKERS", pool: "IQYLKRS", precision: 3},
            {token: "NLAKERS", pool: "IQNLKRS", precision: 3},
            {token: "YCLLBTC", pool: "IQYCBTC", precision: 3},
            {token: "NCLLBTC", pool: "IQNCBTC", precision: 3},
            {token: "YPUTBTC", pool: "IQYPBTC", precision: 3},
            {token: "NPUTBTC", pool: "IQNPBTC", precision: 3},
        ],
        isDefault: true,
        isSelected: false,
    },
    {
        name: "EOS",
        precision: 4,
        contract: "eosio.token",
        icon: "tokens/eos.png",
        marketId: -1,
        side: null,
        allowedTrades: [{token: "IQ", pool: "EOSIQ", precision: 4}],
        isSelected: false,
        isDefault: false,
    },
    {
        name: "YETRUMP",
        precision: 3,
        contract: "prediqtokens",
        icon: "tokens/yestrump.png",
        marketId: 69,
        side: 1,
        allowedTrades: [{token: "IQ", pool: "IQYTRMP", precision: 3}],
        isSelected: false,
        isDefault: false,
    },
    {
        name: "NOTRUMP",
        precision: 3,
        contract: "prediqtokens",
        icon: "tokens/notrump.png",
        marketId: 69,
        side: 0,
        allowedTrades: [{token: "IQ", pool: "IQNTRMP", precision: 3}],
        isSelected: false,
        isDefault: false,
    },
    {
        name: "YVAC",
        precision: 3,
        contract: "prediqtokens",
        icon: "tokens/yvac.png",
        marketId: 117,
        side: 1,
        allowedTrades: [{token: "IQ", pool: "IQYVAC", precision: 3}],
        isSelected: false,
        isDefault: false,
    },
    {
        name: "NVAC",
        precision: 3,
        contract: "prediqtokens",
        icon: "tokens/nvac.png",
        marketId: 117,
        side: 0,
        allowedTrades: [{token: "IQ", pool: "IQNVAC", precision: 3}],
        isSelected: false,
        isDefault: false,
    },
    {
        name: "YESDFS",
        precision: 3,
        contract: "prediqtokens",
        icon: "tokens/yesdfs.png",
        marketId: 220,
        side: 1,
        allowedTrades: [{token: "IQ", pool: "IQYDFS", precision: 3}],
        isSelected: false,
        isDefault: false,
    },
    {
        name: "NODFS",
        precision: 3,
        contract: "prediqtokens",
        icon: "tokens/nodfs.png",
        marketId: 220,
        side: 0,
        allowedTrades: [{token: "IQ", pool: "IQNDFS", precision: 3}],
        isSelected: false,
        isDefault: false,
    },
    {
        name: "YEIQUPB",
        precision: 3,
        contract: "prediqtokens",
        icon: "tokens/yeskrw.png",
        marketId: 216,
        side: 1,
        allowedTrades: [{token: "IQ", pool: "IQYUPB", precision: 3}],
        isSelected: false,
        isDefault: false,
    },
    {
        name: "NOIQUPB",
        precision: 3,
        contract: "prediqtokens",
        icon: "tokens/nokrw.png",
        marketId: 216,
        side: 0,
        allowedTrades: [{token: "IQ", pool: "IQNUPB", precision: 3}],
        isSelected: false,
        isDefault: false,
    },
    {
        name: "YEBIDEN",
        precision: 3,
        contract: "prediqtokens",
        icon: "tokens/yebiden.png",
        marketId: 206,
        side: 1,
        allowedTrades: [{token: "IQ", pool: "IQYBID", precision: 3}],
        isSelected: false,
        isDefault: false,
    },
    {
        name: "NOBIDEN",
        precision: 3,
        contract: "prediqtokens",
        icon: "tokens/nobiden.png",
        marketId: 206,
        side: 0,
        allowedTrades: [{token: "IQ", pool: "IQNBID", precision: 3}],
        isSelected: false,
        isDefault: false,
    },
    {
        name: "YLAKERS",
        precision: 3,
        contract: "prediqtokens",
        icon: "tokens/lakersyes.png",
        marketId: 241,
        side: 1,
        allowedTrades: [{token: "IQ", pool: "IQYLKRS", precision: 3}],
        isSelected: false,
        isDefault: false,
    },
    {
        name: "NLAKERS",
        precision: 3,
        contract: "prediqtokens",
        icon: "tokens/lakersno.png",
        marketId: 241,
        side: 0,
        allowedTrades: [{token: "IQ", pool: "IQNLKRS", precision: 3}],
        isSelected: false,
        isDefault: false,
    },
    {
        name: "YCLLBTC",
        precision: 3,
        contract: "prediqtokens",
        icon: "tokens/btcyes.png",
        marketId: 236,
        side: 1,
        allowedTrades: [{token: "IQ", pool: "IQYCBTC", precision: 3}],
        isSelected: false,
        isDefault: false,
    },
    {
        name: "NCLLBTC",
        precision: 3,
        contract: "prediqtokens",
        icon: "tokens/btcno.png",
        marketId: 236,
        side: 0,
        allowedTrades: [{token: "IQ", pool: "IQNCBTC", precision: 3}],
        isSelected: false,
        isDefault: false,
    },
    {
        name: "YPUTBTC",
        precision: 3,
        contract: "prediqtokens",
        icon: "tokens/btcyes.png",
        marketId: 238,
        side: 1,
        allowedTrades: [{token: "IQ", pool: "IQYPBTC", precision: 3}],
        isSelected: false,
        isDefault: false,
    },
    {
        name: "NPUTBTC",
        precision: 3,
        contract: "prediqtokens",
        icon: "tokens/btcno.png",
        marketId: 238,
        side: 0,
        allowedTrades: [{token: "IQ", pool: "IQNPBTC", precision: 3}],
        isSelected: false,
        isDefault: false,
    },
];

const balances = [
    {
        name: "IQYDFS",
        precision: 3,
        contract: "mindswapswap",
        balance: 0,
        icon: "tokens/yesdfs.png",
    },
    {
        name: "IQNDFS",
        precision: 3,
        contract: "mindswapswap",
        balance: 0,
        icon: "tokens/nodfs.png",
    },
    {
        name: "IQYUPB",
        precision: 3,
        contract: "mindswapswap",
        balance: 0,
        icon: "tokens/yeskrw.png",
    },
    {
        name: "IQNUPB",
        precision: 3,
        contract: "mindswapswap",
        balance: 0,
        icon: "tokens/nokrw.png",
    },
    {
        name: "IQYTRMP",
        precision: 3,
        contract: "mindswapswap",
        balance: 0,
        icon: "tokens/yestrump.png",
    },
    {
        name: "IQNTRMP",
        precision: 3,
        contract: "mindswapswap",
        balance: 0,
        icon: "tokens/notrump.png",
    },
    {
        name: "IQYVAC",
        precision: 3,
        contract: "mindswapswap",
        balance: 0,
        icon: "tokens/yvac.png",
    },
    {
        name: "IQNVAC",
        precision: 3,
        contract: "mindswapswap",
        balance: 0,
        icon: "tokens/nvac.png",
    },
    {
        name: "EOSIQ",
        precision: 4,
        contract: "mindswapswap",
        balance: 0,
        icon: "tokens/eos.png",
    },
    {
        name: "IQYBID",
        precision: 3,
        contract: "mindswapswap",
        balance: 0,
        icon: "tokens/yebiden.png",
    },
    {
        name: "IQNBID",
        precision: 3,
        contract: "mindswapswap",
        balance: 0,
        icon: "tokens/nobiden.png",
    },
    {
        name: "IQYLKRS",
        precision: 3,
        contract: "mindswapswap",
        balance: 0,
        icon: "tokens/lakersyes.png",
    },
    {
        name: "IQNLKRS",
        precision: 3,
        contract: "mindswapswap",
        balance: 0,
        icon: "tokens/lakersno.png",
    },
    {
        name: "IQYCBTC",
        precision: 3,
        contract: "mindswapswap",
        balance: 0,
        icon: "tokens/btcyes.png",
    },
    {
        name: "IQNCBTC",
        precision: 3,
        contract: "mindswapswap",
        balance: 0,
        icon: "tokens/btcno.png",
    },
    {
        name: "IQYPBTC",
        precision: 3,
        contract: "mindswapswap",
        balance: 0,
        icon: "tokens/btcyes.png",
    },
    {
        name: "IQNPBTC",
        precision: 3,
        contract: "mindswapswap",
        balance: 0,
        icon: "tokens/btcno.png",
    }
];

for (const token of tokens) {
    balances.push({
        name: token.name,
        precision: token.precision,
        contract: token.contract,
        balance: 0,
        icon: token.icon,
    });
}

module.exports.tokens = tokens;
module.exports.balances = balances;
