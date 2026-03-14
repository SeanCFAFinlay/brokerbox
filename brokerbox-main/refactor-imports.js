const fs = require('fs');
const path = require('path');

const appsDir = 'apps';
const apps = ['broker', 'client', 'lender', 'mobile'];

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;

            // Replace imports
            const replacements = [
                { from: /import EditScreenInfo from '@\/components\/EditScreenInfo';/g, to: "import { EditScreenInfo } from '@brokerbox/ui';" },
                { from: /import { (.*) } from '@\/components\/Themed';/g, to: "import { $1 } from '@brokerbox/ui';" },
                { from: /import (.*) from '@\/components\/ExternalLink';/g, to: "import { ExternalLink } from '@brokerbox/ui';" },
                { from: /import { (.*) } from '@\/components\/StyledText';/g, to: "import { $1 } from '@brokerbox/ui';" },
                { from: /import { (.*) } from '@\/components\/useColorScheme';/g, to: "import { $1 } from '@brokerbox/ui';" },
                { from: /import { (.*) } from '@\/components\/useClientOnlyValue';/g, to: "import { $1 } from '@brokerbox/ui';" }
            ];

            for (const r of replacements) {
                if (r.from.test(content)) {
                    content = content.replace(r.from, r.to);
                    changed = true;
                }
            }

            if (changed) {
                console.log(`Updated ${fullPath}`);
                fs.writeFileSync(fullPath, content);
            }
        }
    }
}

for (const app of apps) {
    const appPath = path.join(appsDir, app, 'app');
    if (fs.existsSync(appPath)) {
        processDir(appPath);
    }
}
