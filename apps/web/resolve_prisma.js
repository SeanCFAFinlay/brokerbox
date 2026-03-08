
try {
    const resolvePath = require.resolve('@prisma/client');
    console.log('Resolved @prisma/client to:', resolvePath);
    const pkg = require('@prisma/client/package.json');
    console.log('Version:', pkg.version);
    const fs = require('fs');
    const path = require('path');
    const dtsPath = path.join(path.dirname(resolvePath), 'index.d.ts');
    if (fs.existsSync(dtsPath)) {
        const content = fs.readFileSync(dtsPath, 'utf8');
        console.log('Contains utilizationRate:', content.includes('utilizationRate'));
        console.log('Contains DealActivity:', content.includes('DealActivity'));
    } else {
        console.log('index.d.ts NOT FOUND at', dtsPath);
    }
} catch (e) {
    console.error('Error:', e.message);
}
