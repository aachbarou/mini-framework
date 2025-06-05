/**
 * Build System for Mini-Framework
 * Handles minification, bundling, and optimization for production
 */
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class BuildSystem {
    constructor(config = {}) {
        this.config = {
            srcDir: path.resolve(config.srcDir || './src'),
            distDir: path.resolve(config.distDir || './dist'),
            examplesDir: path.resolve(config.examplesDir || './examples'),
            minify: config.minify !== false,
            sourceMaps: config.sourceMaps !== false,
            bundle: config.bundle !== false,
            ...config
        };

        this.stats = {
            startTime: 0,
            files: {
                processed: 0,
                minified: 0,
                copied: 0
            },
            sizes: {
                original: 0,
                compressed: 0
            }
        };
    }

    async build() {
        console.log('🚀 Starting Mini-Framework build...\n');
        this.stats.startTime = Date.now();

        try {
            await this.cleanDist();
            await this.copySource();
            await this.minifyFiles();
            await this.createBundle();
            await this.copyExamples();
            await this.generateManifest();
            await this.printStats();
            
            console.log('✅ Build completed successfully!');
        } catch (error) {
            console.error('❌ Build failed:', error.message);
            process.exit(1);
        }
    }

    async cleanDist() {
        console.log('🧹 Cleaning dist directory...');
        try {
            await fs.rmdir(this.config.distDir, { recursive: true });
        } catch (error) {
            // Directory might not exist
        }
        await fs.mkdir(this.config.distDir, { recursive: true });
    }

    async copySource() {
        console.log('📁 Copying source files...');
        await this.copyDirectory(this.config.srcDir, path.join(this.config.distDir, 'src'));
    }

    async copyDirectory(src, dest) {
        await fs.mkdir(dest, { recursive: true });
        const entries = await fs.readdir(src, { withFileTypes: true });

        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);

            if (entry.isDirectory()) {
                await this.copyDirectory(srcPath, destPath);
            } else {
                await fs.copyFile(srcPath, destPath);
                this.stats.files.copied++;
                
                const stats = await fs.stat(srcPath);
                this.stats.sizes.original += stats.size;
            }
        }
    }

    async minifyFiles() {
        if (!this.config.minify) return;
        
        console.log('⚡ Minifying JavaScript files...');
        await this.minifyJavaScript(path.join(this.config.distDir, 'src'));
    }

    async minifyJavaScript(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const filePath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                await this.minifyJavaScript(filePath);
            } else if (entry.name.endsWith('.js')) {
                await this.minifyFile(filePath);
            }
        }
    }

    async minifyFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const minified = this.minifyJavaScriptContent(content);
            
            const minPath = filePath.replace('.js', '.min.js');
            await fs.writeFile(minPath, minified);
            
            this.stats.files.minified++;
            this.stats.sizes.compressed += minified.length;
            
            console.log(`  ✓ ${path.basename(filePath)} -> ${path.basename(minPath)}`);
        } catch (error) {
            console.warn(`  ⚠️ Failed to minify ${filePath}: ${error.message}`);
        }
    }

    minifyJavaScriptContent(content) {
        // Simple minification - remove comments and extra whitespace
        return content
            // Remove single-line comments
            .replace(/\/\/.*$/gm, '')
            // Remove multi-line comments
            .replace(/\/\*[\s\S]*?\*\//g, '')
            // Remove extra whitespace
            .replace(/\s+/g, ' ')
            // Remove whitespace around operators
            .replace(/\s*([{}();,=<>!&|+\-*\/])\s*/g, '$1')
            // Remove leading/trailing whitespace
            .trim();
    }

    async createBundle() {
        if (!this.config.bundle) return;
        
        console.log('📦 Creating bundle...');
        
        const bundleContent = await this.createFrameworkBundle();
        const bundlePath = path.join(this.config.distDir, 'mini-framework.bundle.js');
        await fs.writeFile(bundlePath, bundleContent);
        
        if (this.config.minify) {
            const minified = this.minifyJavaScriptContent(bundleContent);
            const minPath = path.join(this.config.distDir, 'mini-framework.bundle.min.js');
            await fs.writeFile(minPath, minified);
            console.log(`  ✓ Created minified bundle: ${path.basename(minPath)}`);
        }
        
        console.log(`  ✓ Created bundle: ${path.basename(bundlePath)}`);
    }

    async createFrameworkBundle() {
        const coreFiles = [
            'framework.js',
            'core/signals.js',
            'core/events.js',
            'core/state.js',
            'core/router.js',
            'core/virtual-dom.js',
            'core/websocket.js',
            'core/lobby.js',
            'core/touch-controls.js',
            'core/animation-engine.js'
        ];

        let bundle = `/**
 * Mini-Framework Bundle
 * High-performance gaming framework with reactive signals
 * Generated on ${new Date().toISOString()}
 */
(function(window) {
    'use strict';
    
`;

        for (const file of coreFiles) {
            const filePath = path.join(this.config.srcDir, file);
            try {
                const content = await fs.readFile(filePath, 'utf8');
                bundle += `\n    // === ${file} ===\n`;
                bundle += this.wrapModuleContent(content, file);
                bundle += '\n';
            } catch (error) {
                console.warn(`  ⚠️ Could not include ${file} in bundle: ${error.message}`);
            }
        }

        bundle += `
})(typeof window !== 'undefined' ? window : global);`;

        return bundle;
    }

    wrapModuleContent(content, filename) {
        // Remove module.exports and require statements for browser bundle
        const wrapped = content
            .replace(/module\.exports\s*=\s*[^;]+;/g, '')
            .replace(/const\s+\w+\s*=\s*require\([^)]+\);/g, '')
            .replace(/if\s*\(\s*typeof\s+module[^}]+}/g, '');
        
        return wrapped;
    }

    async copyExamples() {
        console.log('📋 Copying examples...');
        const examplesDestDir = path.join(this.config.distDir, 'examples');
        await this.copyDirectory(this.config.examplesDir, examplesDestDir);
        
        // Update script paths in HTML files to use bundled version
        await this.updateExamplePaths(examplesDestDir);
    }

    async updateExamplePaths(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const filePath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                await this.updateExamplePaths(filePath);
            } else if (entry.name.endsWith('.html')) {
                await this.updateHtmlFile(filePath);
            }
        }
    }

    async updateHtmlFile(filePath) {
        const content = await fs.readFile(filePath, 'utf8');
        const updated = content.replace(
            /\.\.\/\.\.\/src\/[^"']+/g,
            '../../mini-framework.bundle.min.js'
        );
        
        if (content !== updated) {
            await fs.writeFile(filePath, updated);
            console.log(`  ✓ Updated paths in ${path.basename(filePath)}`);
        }
    }

    async generateManifest() {
        console.log('📄 Generating build manifest...');
        
        const manifest = {
            version: '1.0.0',
            buildTime: new Date().toISOString(),
            buildDuration: Date.now() - this.stats.startTime,
            files: await this.getFileList(this.config.distDir),
            stats: this.stats,
            config: this.config
        };

        const manifestPath = path.join(this.config.distDir, 'manifest.json');
        await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    }

    async getFileList(dir, basePath = '') {
        const files = [];
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const relativePath = path.join(basePath, entry.name);
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                const subFiles = await this.getFileList(fullPath, relativePath);
                files.push(...subFiles);
            } else {
                const stats = await fs.stat(fullPath);
                files.push({
                    path: relativePath,
                    size: stats.size,
                    modified: stats.mtime
                });
            }
        }

        return files;
    }

    async printStats() {
        const duration = Date.now() - this.stats.startTime;
        const compressionRatio = this.stats.sizes.original > 0 
            ? (1 - this.stats.sizes.compressed / this.stats.sizes.original) * 100 
            : 0;

        console.log('\n📊 Build Statistics:');
        console.log(`   Duration: ${duration}ms`);
        console.log(`   Files processed: ${this.stats.files.processed}`);
        console.log(`   Files minified: ${this.stats.files.minified}`);
        console.log(`   Files copied: ${this.stats.files.copied}`);
        console.log(`   Original size: ${this.formatBytes(this.stats.sizes.original)}`);
        console.log(`   Compressed size: ${this.formatBytes(this.stats.sizes.compressed)}`);
        console.log(`   Compression ratio: ${compressionRatio.toFixed(1)}%`);
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Watch mode for development
    async watch() {
        console.log('👀 Starting watch mode...');
        
        const chokidar = require('chokidar');
        const watcher = chokidar.watch([this.config.srcDir, this.config.examplesDir]);
        
        watcher.on('change', async (filePath) => {
            console.log(`\n🔄 File changed: ${filePath}`);
            try {
                await this.build();
                console.log('✅ Rebuild completed\n');
            } catch (error) {
                console.error('❌ Rebuild failed:', error.message);
            }
        });

        console.log('Watching for changes... Press Ctrl+C to stop.');
    }

    // Development server
    async serve(port = 3000) {
        console.log(`🌐 Starting development server on port ${port}...`);
        
        const http = require('http');
        const url = require('url');
        const mime = require('mime-types');

        const server = http.createServer(async (req, res) => {
            const parsedUrl = url.parse(req.url);
            let pathname = parsedUrl.pathname;
            
            if (pathname === '/') {
                pathname = '/examples/bomberman-test/index.html';
            }
            
            const filePath = path.join(this.config.distDir, pathname);
            
            try {
                const content = await fs.readFile(filePath);
                const mimeType = mime.lookup(filePath) || 'text/plain';
                
                res.writeHead(200, { 'Content-Type': mimeType });
                res.end(content);
            } catch (error) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found');
            }
        });

        server.listen(port, () => {
            console.log(`✅ Server running at http://localhost:${port}`);
            console.log(`📖 Bomberman demo: http://localhost:${port}/examples/bomberman-test/`);
        });
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'build';
    
    const builder = new BuildSystem({
        srcDir: './src',
        distDir: './dist',
        examplesDir: './examples'
    });

    switch (command) {
        case 'build':
            await builder.build();
            break;
        case 'watch':
            await builder.build();
            await builder.watch();
            break;
        case 'serve':
            await builder.build();
            await builder.serve(parseInt(args[1]) || 3000);
            break;
        default:
            console.log('Usage: node build.js [build|watch|serve] [port]');
            process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = BuildSystem;
