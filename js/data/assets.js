// Simulated Database of popular assets
const GLOBAL_ASSET_DATA = [
    // --- CRYPTO (Sourced from GitHub via crypto_data.js) ---
    ...(typeof CRYPTO_DATA !== 'undefined' ? CRYPTO_DATA.map(item => ({
        symbol: item.symbol,
        name: item.name,
        type: 'crypto',
        logo: item.icon
    })) : []),

    // --- BIST (Sourced from GitHub via bist_data.js) ---
    // If BIST_DATA is available (loaded from index.html), map it. Otherwise empty.
    ...(typeof BIST_DATA !== 'undefined' ? BIST_DATA.map(item => ({
        symbol: item.symbol,
        name: item.name,
        type: 'bist',
        logo: item.logoUrl // Use the URL directly from the source
    })) : []),

    // --- US STOCK ---
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'us_stock', logo: 'https://logo.clearbit.com/apple.com' },
    { symbol: 'MSFT', name: 'Microsoft', type: 'us_stock', logo: 'https://logo.clearbit.com/microsoft.com' },
    { symbol: 'TSLA', name: 'Tesla', type: 'us_stock', logo: 'https://logo.clearbit.com/tesla.com' },
    { symbol: 'NVDA', name: 'Nvidia', type: 'us_stock', logo: 'https://logo.clearbit.com/nvidia.com' },
    { symbol: 'GOOGL', name: 'Alphabet (Google)', type: 'us_stock', logo: 'https://logo.clearbit.com/google.com' },
    { symbol: 'AMZN', name: 'Amazon', type: 'us_stock', logo: 'https://logo.clearbit.com/amazon.com' },
    { symbol: 'META', name: 'Meta Platforms', type: 'us_stock', logo: 'https://logo.clearbit.com/meta.com' },
    { symbol: 'NFLX', name: 'Netflix', type: 'us_stock', logo: 'https://logo.clearbit.com/netflix.com' },

    // --- FUNDS (Sourced from TEFAS via fund_data.js) ---
    ...(typeof FUND_DATA !== 'undefined' ? FUND_DATA.map(item => ({
        symbol: item.symbol,
        name: item.name,
        type: 'fund',
        logo: 'https://ui-avatars.com/api/?name=' + item.name.substring(0, 2) + '&background=333&color=fff&bold=true'
    })) : []),

    // --- METALS ---
    { symbol: 'XAU/TRY', name: 'Gram Altın', type: 'metal', logo: 'https://ui-avatars.com/api/?name=AU&background=ffd700&color=000&bold=true' },
    { symbol: 'XAG/TRY', name: 'Gram Gümüş', type: 'metal', logo: 'https://ui-avatars.com/api/?name=AG&background=c0c0c0&color=000&bold=true' },
    { symbol: 'XPT/TRY', name: 'Gram Platin', type: 'metal', logo: 'https://ui-avatars.com/api/?name=PT&background=e5e4e2&color=000&bold=true' },
    { symbol: 'XPD/TRY', name: 'Gram Paladyum', type: 'metal', logo: 'https://ui-avatars.com/api/?name=PD&background=ced0dd&color=000&bold=true' },
    { symbol: 'XRH/TRY', name: 'Rodyum (TL)', type: 'metal', logo: 'https://ui-avatars.com/api/?name=RH&background=b6b6b4&color=000&bold=true' },
    { symbol: 'HG/TRY', name: 'Bakır (TL)', type: 'metal', logo: 'https://ui-avatars.com/api/?name=HG&background=b87333&color=fff&bold=true' },
    // --- DEPOSIT ---
    { symbol: 'USD/TRY', name: 'Amerikan Doları', type: 'deposit', logo: 'https://flagcdn.com/w80/us.png' },
    { symbol: 'EUR/TRY', name: 'Euro', type: 'deposit', logo: 'https://flagcdn.com/w80/eu.png' },
    { symbol: 'TLREF', name: 'Türk Lirası Gecelik Referans Faiz Oranı', type: 'deposit', logo: 'https://flagcdn.com/w80/tr.png' }
];
