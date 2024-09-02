const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { UPLOADS_DIR } = require('../config/environment');

// const rootDir = path.resolve(__dirname, '..');
// const uploadsDir = path.join(rootDir, 'uploads');

exports.createNpmPackage = async ({ projectName, jsxComponents, tsxComponents, indexJsExports, indexTsExports, declarationFiles, packageVersion }) => {
    const packageDir = path.join(UPLOADS_DIR, projectName);
    const distJsxDir = path.join(packageDir, 'dist', 'jsx');
    const distTsxDir = path.join(packageDir, 'dist', 'tsx');

    // Create directories
    fs.mkdirSync(distJsxDir, { recursive: true });
    fs.mkdirSync(distTsxDir, { recursive: true });

    // Write JSX and TSX components
    jsxComponents.forEach(({ fileName, content }) => {
        fs.writeFileSync(path.join(distJsxDir, fileName), content);
    });
    fs.writeFileSync(path.join(distJsxDir, 'index.js'), indexJsExports.join('\n'));

    tsxComponents.forEach(({ fileName, content }) => {
        fs.writeFileSync(path.join(distTsxDir, fileName), content);
    });
    fs.writeFileSync(path.join(distTsxDir, 'index.ts'), indexTsExports.join('\n'));

    // Write TypeScript declaration files
    declarationFiles.forEach(({ fileName, content }) => {
        fs.writeFileSync(path.join(distTsxDir, fileName), content);
    });

    // Create package.json
    const packageJsonContent = {
        name: projectName.toLowerCase(),
        version: packageVersion || "1.0.0",
        main: "dist/jsx/index.js",
        types: "dist/tsx/index.d.ts",
        author: "Mrunal Patel",
        peerDependencies: {
            react: ">= 16",
            "react-dom": ">= 16"
        },
        devDependencies: {}
    };
    fs.writeFileSync(path.join(packageDir, 'package.json'), JSON.stringify(packageJsonContent, null, 2));

    // Change to uploads directory for npm pack
    const originalDir = process.cwd();
    process.chdir(UPLOADS_DIR);

    // Create .tgz package using npm pack
    execSync(`npm pack ${packageDir}`);

    // Change back to the original directory
    process.chdir(originalDir);

    // Clean up
    fs.rmdirSync(packageDir, { recursive: true });

    return path.join(UPLOADS_DIR, `${projectName}`);
};