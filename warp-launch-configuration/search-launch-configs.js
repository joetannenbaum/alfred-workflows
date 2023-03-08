#!/usr/bin/osascript -l JavaScript

// Modified from: https://deanishe.net/alfred-workflows/Search%20PDFs.alfredworkflow

// Folder to search in
const folder = '~/.warp/launch_configurations';
// Only show files with this extension
const extension = 'yaml';

// Return list of files in folder with given extension.
function findFiles(folder, extension) {
    const fm = $.NSFileManager.defaultManager;
    const files = [];

    const root = $(folder).stringByExpandingTildeInPath;
    const contents = fm.contentsOfDirectoryAtPathError(root, null);

    for (let i = 0; i < contents.count; i++) {
        files.push(
            root.stringByAppendingPathComponent(contents.objectAtIndex(i)),
        );
    }

    if (extension) {
        return files.filter((p) => p.pathExtension.js == extension);
    }

    return files;
}

// Convert NSString path to an Alfred feedback item.
function alfredItem(path) {
    return {
        title: path.lastPathComponent.js.replace('.yaml', ''),
        subtitle: path.stringByAbbreviatingWithTildeInPath.js,
        arg: path.stringByAbbreviatingWithTildeInPath.js,
        uid: path.js,
        valid: true,
        type: 'file',
    };
}

function queryRegex(query) {
    const pat = [];
    const iter = query[Symbol.iterator]();
    const char = iter.next();

    while (!char.done) {
        pat.push(char.value);
        char = iter.next();
    }

    return new RegExp(pat.join('.*'), 'i');
}

function toJSON(files) {
    return JSON.stringify({ items: files.map(alfredItem) }, null, 2);
}

function run(argv) {
    const query = argv.length ? argv[0] : null;

    const files = findFiles(folder, extension);

    if (!query) {
        return toJSON(files);
    }

    const regex = queryRegex(query);

    return toJSON(
        files.filter((p) => p.lastPathComponent.js.match(regex) !== null),
    );
}
